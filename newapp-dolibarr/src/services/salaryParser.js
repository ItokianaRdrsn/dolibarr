// ========== SERVICE "PARSER" SALAIRES ==========
// Tout le formatage / parsing utilisé par les vues SalariesList et SalariesForm.
// Logique reprise telle quelle, juste déplacée ici.

function formatDate(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toISOString().split('T')[0]
}

function nomEmploye(idUser, employes) {
  const u = employes.find(
    e => String(e.id) === String(idUser)
  )

  return u
    ? `${u.firstname || ''} ${u.lastname || ''}`.trim()
    : idUser
}

function texteDesPaiements(paiements) {
  return paiements
    .map(p => `${formatDate(p.datep)} : ${p.amount}`)
    .join(' | ')
}

function totalPaye(salaire) {
  return salaire.paiements.reduce(
    (t, p) => t + Number(p.amount),
    0
  )
}

function resteAPayer(salaire) {
  return Number(salaire.montant) - totalPaye(salaire)
}

// Transforme un salaire brut (API) + ses paiements bruts (API) + les employés bruts (API)
// en un salaire "formaté" prêt à être affiché (même structure que dans SalariesList.vue).
function parseSalaire(salaire, payments, employes) {

  const paiements = payments.filter(
    p => Number(p.fk_salary) === Number(salaire.id)
  )

  return {

    id: salaire.id,

    id_employe: salaire.fk_user,

    ref_salaire: salaire.ref,

    ref_employe:
      employes.find(
        e => String(e.id) === String(salaire.fk_user)
      )?.ref_employee || '',

    nom_employe: nomEmploye(salaire.fk_user, employes),

    date_debut: formatDate(salaire.datesp),

    date_fin: formatDate(salaire.dateep),

    montant: Number(salaire.amount),

    paiements,

    paiement: texteDesPaiements(paiements)

  }

}

// Transforme la liste brute des salaires (API) en liste formatée.
function parseSalaires(salaries, payments, employes) {
  return salaries.map(salaire => parseSalaire(salaire, payments, employes))
}

export default {
  formatDate,
  nomEmploye,
  texteDesPaiements,
  totalPaye,
  resteAPayer,
  parseSalaire,
  parseSalaires,
}
