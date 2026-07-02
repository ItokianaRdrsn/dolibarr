import salaireParser from '@/services/salaryParser'
import userService from '@/services/userService'
import {
  getSalaries,
  getSalariesPaiements,
  postSalary,
  postSalaryPayment,
} from '@/services/front-dolibarr/salaries'

// ========== SERVICE "SALAIRES" ==========
// Appels API + logique métier, dans un seul fichier.
// Le formatage est délégué à salaireParser.service.js.

// Utilisé par SalariesList.vue : récupère employés + salaires + paiements,
// puis renvoie tout, déjà formaté.
async function listerSalaires() {
  const employes = await userService.listerEmployes()

  const salaries = await getSalaries({ limit: 0 })
  const payments = await getSalariesPaiements({ limit: 0 })

  const salaires = salaireParser.parseSalaires(
    salaries,
    payments,
    employes
  )

  return {
    employes,
    salaires,
  }
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
}
