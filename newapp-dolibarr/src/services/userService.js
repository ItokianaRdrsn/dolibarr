import { apiClient } from '@/api/axios'

// ========== SERVICE "USERS" (EMPLOYÉS) ==========

async function listerEmployes() {
  const reponse = await apiClient.get('/users', {
    params: { limit: 0 },
  })

  return reponse.data
}

async function listerEmployesAvecRef() {
  const employes = await listerEmployes()

  return employes.filter(
    (e) => e.ref_employee,
  )
}

export default {
  listerEmployes,
  listerEmployesAvecRef,
}
