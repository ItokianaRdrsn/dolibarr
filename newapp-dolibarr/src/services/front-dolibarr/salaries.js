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