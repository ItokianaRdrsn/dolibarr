import salaryParser from '@/services/salaryParser'
import userService from '@/services/userService'
import {
  getSalaries,
  getSalariesPaiements,
  postSalary,
  postSalaryPayment,
} from '@/services/front-dolibarr/salaries'

// ========== SERVICE "SALAIRES" ==========
// Appels API + logique métier (total payé, reste à payer, etc.), dans un seul fichier.
// Le formatage (dates, libellés...) est délégué à salaryParser.js.

// Calcule le total déjà payé pour un salaire (formaté, avec sa liste de paiements).
function totalPaye(salaire) {
  return salaire.paiements.reduce(
    (total, p) => total + Number(p.amount),
    0
  )
}

// Calcule le reste à payer pour un salaire (formaté).
function resteAPayer(salaire) {
  return Number(salaire.montant) - totalPaye(salaire)
}

// Utilisé par SalariesList.vue : récupère employés + salaires + paiements,
// puis renvoie tout, déjà formaté.
async function listerSalaires() {
  const employes = await userService.listerEmployes()

  const salaries = await getSalaries({ limit: 0 })
  const payments = await getSalariesPaiements({ limit: 0 })

  const salaires = salaries.map(salaire => {
    const paiements = payments.filter(
      p => Number(p.fk_salary) === Number(salaire.id)
    )

    return salaryParser.formatSalaire(salaire, paiements, employes)
  })

  return {
    employes,
    salaires,
  }
}

// Utilisé par EmployeDetail.vue : renvoie uniquement les salaires d'un employé donné.
async function ListerSalairesParEmploye(idEmploye) {
  const { salaires } = await listerSalaires()

  return salaires.filter(
    s => String(s.id_employe) === String(idEmploye)
  )
}

// Utilisé par SalariesForm.vue : crée un salaire pour un employé (identifié par ref_employee).
async function creerSalaire({ refEmploye, employes, montant, dateDebut, dateFin }) {
  const employe = employes.find(
    (e) => e.ref_employee === refEmploye,
  )

  return postSalary({
    fk_user: employe.id,
    label: 'Salaire',
    amount: Number(montant),
    salary: Number(montant),
    datesp: dateDebut,
    dateep: dateFin,
    type_payment: 2,
  })
}

// Utilisé par SalariesList.vue : enregistre un paiement pour un salaire donné.
async function payerSalaire({ salaireId, date, montant }) {
  return postSalaryPayment(salaireId, {
    paiementtype: 2,
    datepaye: date,
    chid: '',
    amounts: {
      [salaireId]: Number(montant),
    },
    accountid: 1,
  })
}

export default {
  listerSalaires,
  creerSalaire,
  payerSalaire,
  totalPaye,
  resteAPayer,
  ListerSalairesParEmploye
}