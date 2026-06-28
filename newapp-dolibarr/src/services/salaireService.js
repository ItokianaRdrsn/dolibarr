import { apiClient } from '@/api/axios'
import salaireParser from '@/services/salaireParser'
import userService from '@/services/userService'

// ========== SERVICE "SALAIRES" ==========
// Appels API + logique métier, dans un seul fichier.
// Le formatage est délégué à salaireParser.service.js.

// Utilisé par SalariesList.vue : récupère employés + salaires + paiements,
// puis renvoie tout, déjà formaté.
async function listerSalaires() {

  const employes = await userService.listerEmployes()

  const salaries = await apiClient.get('/salaries', {
    params: { limit: 0 }
  })

  const payments = await apiClient.get('/salaries/payments', {
    params: { limit: 0 }
  })

  const salaires = salaireParser.parseSalaires(
    salaries.data,
    payments.data,
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

  return apiClient.post('/salaries', {
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

  const body = {

    paiementtype: 2,

    datepaye: date,

    chid: '',

    amounts: {
      [salaireId]: Number(montant)
    },

    accountid: 1

  }

  return apiClient.post(`/salaries/${salaireId}/payments`, body)

}

export default {
  listerSalaires,
  creerSalaire,
  payerSalaire,
}
