import { getUsers } from '@/services/front-dolibarr/users'

// ========== SERVICE "USERS" (EMPLOYÉS) ==========

async function listerEmployes() {
  const employes = await getUsers({ limit: 0 })
  return employes
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
