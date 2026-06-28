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

// Récupérer un utilisateur par ID (pour le genre)
export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}
