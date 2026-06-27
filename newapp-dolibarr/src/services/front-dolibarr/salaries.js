import apiClient from '@services/front-dolibarr'


export const getSalaries = () =>
  api.get('/salaries', { params: { limit: 500, page: 0 } })

// Récupérer un utilisateur par ID (pour le genre)
export const getUser = (id) =>
  api.get(`/users/${id}`)