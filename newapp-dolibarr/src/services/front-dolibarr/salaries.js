import {apiClient} from '@/api/axios'

// Récupérer les salaires
export const getSalaries = async () => {
  const response = await apiClient.get('/salaries', { params: { limit: 500, page: 0 } })
  return response.data
}

export const getSalariesPaiements = async () => {
  const response = await apiClient.get('/salaries/payments', { params: { limit: 500, page: 0 } })
  return response.data
}

// Récupérer un utilisateur par ID (pour le genre)
export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}