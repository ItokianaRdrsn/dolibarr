import { apiClient } from '@/api/axios'

// Récupérer les salaires
export const getSalaries = async (params = { limit: 500, page: 0 }) => {
  const response = await apiClient.get('/salaries', { params })
  return response.data
}

export const getSalariesPaiements = async (params = { limit: 500, page: 0 }) => {
  const response = await apiClient.get('/salaries/payments', { params })
  return response.data
}

export const postSalary = async (body) => {
  return apiClient.post('/salaries', body)
}

export const postSalaryPayment = async (salaireId, body) => {
  return apiClient.post(`/salaries/${salaireId}/payments`, body)
}

// IMPORTANT : côté Dolibarr, la route DELETE {id}/payments attend en
// réalité l'ID DU PAIEMENT lui-même dans {id} (le code fait
// $paymentsalary->fetch($id)), même si l'URL ressemble à une sous-ressource
// du salaire. Il faut donc appeler cette route une fois par paiement à
// supprimer, avec l'id du paiement — jamais l'id du salaire.
export const deleteSalary = async (id) => {
  return apiClient.delete(`/salaries/${id}`)
}

export const deleteSalaryPayment = async (paiementId) => {
  return apiClient.delete(`/salaries/${paiementId}/payments`)
}

// Récupérer un utilisateur par ID (pour le genre)
export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}
// Convertir date "08/03/26" → "2026-03-08" pour Dolibarr
function convertirDate(dateStr) {
  if (!dateStr) return null
  const [jour, mois, annee] = dateStr.trim().split('/')
  const anneeComplete = annee.length === 2 ? `20${annee}` : annee
  return `${anneeComplete}-${mois.padStart(2,'0')}-${jour.padStart(2,'0')}`
}

// Convertir montant "677,56" → 677.56
function convertirMontant(val) {
  if (!val) return 0
  return parseFloat(String(val).replace(',', '.'))
}

// Parser le champ paiement : {["08/03/26",890],["08/03/26",300]}
export function parserPaiements(raw) {
  if (!raw || raw.trim() === '') return []

  try {
    // {[...],[...]} → [[...],[...]]
    const jsonStr = raw
      .trim()
      .replace(/^\{/, '[')   // { → [
      .replace(/\}$/, ']')   // } → ]

    const tableau = JSON.parse(jsonStr)

    return tableau.map(([date, montant]) => ({
      date: convertirDate(date),
      montant: convertirMontant(montant)
    }))
  } catch (e) {
    console.warn('Impossible de parser les paiements:', raw, e)
    return []
  }
}

// Créer un salaire dans Dolibarr
export async function creerSalaire(row, fk_user) {
  const payload = {
    fk_user: fk_user,
    label: `Salaire ref ${row.ref_salaire}`,
    amount: convertirMontant(row.montant),
    datesp: Math.floor(new Date(convertirDate(row.date_debut)).getTime() / 1000),
    dateep: Math.floor(new Date(convertirDate(row.date_fin)).getTime() / 1000),
    paye: 0,
    status: 0
  }

  const { data } = await apiClient.post('/salaries', payload)
  return data  // retourne l'ID du salaire créé
}

// Ajouter un paiement à un salaire
export async function ajouterPaiement(salaireId, date, montant) {
  const payload = {
    paiementtype: 'VIR',
    datepaye: date,
    chid: '',
    amounts: {
      [salaireId]: montant
    },
    accountid: 1
  }

  const { data } = await apiClient.post(`/salaries/${salaireId}/payments`, payload)
  return data
}