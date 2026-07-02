// ========== SERVICE "PARSER" SALAIRES ==========
// Uniquement du formatage / affichage (dates, libellés, mise en forme d'un salaire).
// Aucune logique métier ici (total payé, reste à payer -> voir salaryService).

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

// Construit l'objet "salaire" formaté prêt à être affiché,
// à partir d'un salaire brut (API), de ses paiements déjà filtrés et des employés bruts (API).
function formatSalaire(salaire, paiements, employes) {
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

export default {
  formatDate,
  nomEmploye,
  texteDesPaiements,
  formatSalaire,
}
