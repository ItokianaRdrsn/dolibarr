import { apiClient } from '@/api/axios'

export const getUsers = async (params = { limit: 0 }) => {
  const response = await apiClient.get('/users', { params })
  return response.data
}

export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}

export const postUser = async (body) => {
  return apiClient.post('/users', body)
}

export const putUser = async (id, body) => {
  return apiClient.put(`/users/${id}`, body)
}

export const deleteUser = async (id) => {
  if(id==1)return
  return apiClient.delete(`/users/${id}`)
}
