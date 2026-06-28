import { getUsers, deleteUser } from '@/services/front-dolibarr/users'
import {
  getSalaries,
  getSalariesPaiements,
  deleteSalary,
  deleteSalaryPayment,
} from '@/services/front-dolibarr/salaries'

// ========== SERVICE "RESET" ==========
// Réinitialise les données de test : llx_payment_salary, llx_salary, llx_user.
//
// Points importants côté API Dolibarr (vérifiés sur le code source) :
//
// 1) DELETE /salaries/{id}/payments attend en réalité l'ID DU PAIEMENT
//    lui-même (pas l'ID du salaire). Il faut donc supprimer les paiements
//    UN PAR UN, avec leur propre id (champ "id" de /salaries/payments),
//    et pas un seul appel par salaire.
//
// 2) Important : DELETE /salaries/{id} (suppression du salaire) ne
//    fonctionne réellement que si le salaire n'a plus aucun paiement lié.
//    C'est pour ça qu'on supprime systématiquement tous les paiements
//    avant de supprimer le salaire correspondant (voir point 3).
//
// 3) Un salaire ne peut être supprimé que si TOUS ses paiements ont été
//    supprimés au préalable.

// Supprime un paiement de salaire donné. Ne lève jamais d'exception.
async function supprimerUnPaiement(paiement) {
  try {
    await deleteSalaryPayment(paiement.id)
    console.log(`[reset] Paiement #${paiement.id} (salaire #${paiement.fk_salary}) supprimé`)
    return { id: paiement.id, ok: true }
  } catch (e) {
    const erreur = e?.response?.data?.error?.message || e?.message || 'Erreur inconnue'
    console.warn(`[reset] Échec suppression paiement #${paiement.id} :`, erreur)
    return { id: paiement.id, ok: false, erreur }
  }
}

// Supprime un salaire. Ne lève jamais d'exception.
// (Ne fonctionne que si tous ses paiements ont déjà été supprimés au
// préalable, sinon Dolibarr refuse la suppression.)
async function supprimerUnSalaire(salaire) {
  try {
    await deleteSalary(salaire.id)
    console.log(`[reset] Salaire #${salaire.id} supprimé`)
    return { id: salaire.id, ok: true }
  } catch (e) {
    const erreur = e?.response?.data?.error?.message || e?.message || 'Erreur inconnue'
    console.warn(`[reset] Échec suppression salaire #${salaire.id} :`, erreur)
    return { id: salaire.id, ok: false, erreur }
  }
}

// Supprime un utilisateur employé donné. Ne lève jamais d'exception.
async function supprimerUnEmploye(employe) {
  try {
    await deleteUser(employe.id)
    console.log(`[reset] Employé #${employe.id} (${employe.login}) supprimé`)
    return { id: employe.id, ok: true }
  } catch (e) {
    const erreur = e?.response?.data?.error?.message || e?.message || 'Erreur inconnue'
    console.warn(`[reset] Échec suppression employé #${employe.id} :`, erreur)
    return { id: employe.id, ok: false, erreur }
  }
}

// Supprime tous les paiements, puis tous les salaires. Ne s'arrête jamais
// au premier échec : chaque ligne est traitée indépendamment.
async function reinitialiserSalaires() {
  const salaries = await getSalaries({ limit: 0 })
  const paiements = await getSalariesPaiements({ limit: 0 })

  console.log(`[reset] ${paiements.length} paiement(s) à supprimer`)

  // 1) Supprimer tous les paiements, un par un (par leur propre id).
  const resultatsPaiements = []
  for (const paiement of paiements) {
    resultatsPaiements.push(await supprimerUnPaiement(paiement))
  }

  console.log(`[reset] ${salaries.length} salaire(s) à supprimer`)

  // 2) Supprimer tous les salaires (possible seulement si leurs paiements
  //    ont bien été supprimés à l'étape précédente).
  const resultatsSalaires = []
  for (const salaire of salaries) {
    resultatsSalaires.push(await supprimerUnSalaire(salaire))
  }

  return { resultatsSalaires, resultatsPaiements }
}

// Supprime uniquement les utilisateurs "employés" (ceux qui ont un
// ref_employee), pour ne jamais toucher à l'utilisateur admin / API.
async function reinitialiserEmployes() {
  const users = await getUsers({ limit: 0 })
  const employes = users.filter((u) => u.ref_employee)

  console.log(`[reset] ${employes.length} employé(s) à supprimer`)

  const resultats = []
  for (const employe of employes) {
    resultats.push(await supprimerUnEmploye(employe))
  }

  return resultats
}

// Lance la réinitialisation complète et renvoie un résumé détaillé :
// nombre de succès/échecs, et le détail des lignes en échec.
async function reinitialiserToutesLesDonnees() {
  const { resultatsSalaires, resultatsPaiements } = await reinitialiserSalaires()
  const resultatsEmployes = await reinitialiserEmployes()

  const echecsSalaires = resultatsSalaires.filter((r) => !r.ok)
  const echecsPaiements = resultatsPaiements.filter((r) => !r.ok)
  const echecsEmployes = resultatsEmployes.filter((r) => !r.ok)

  return {
    nbSalaires: resultatsSalaires.length,
    nbSalairesSupprimes: resultatsSalaires.length - echecsSalaires.length,
    echecsSalaires,

    nbPaiements: resultatsPaiements.length,
    nbPaiementsSupprimes: resultatsPaiements.length - echecsPaiements.length,
    echecsPaiements,

    nbEmployes: resultatsEmployes.length,
    nbEmployesSupprimes: resultatsEmployes.length - echecsEmployes.length,
    echecsEmployes,
  }
}

export default {
  reinitialiserSalaires,
  reinitialiserEmployes,
  reinitialiserToutesLesDonnees,
}