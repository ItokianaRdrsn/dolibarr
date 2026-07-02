<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'

const employes = ref([])
const loading = ref(false)

async function chargerDonnees() {
  loading.value = true
  employes.value = await userService.listerEmployes()
  loading.value = false
}

onMounted(chargerDonnees)
</script>

<template>
  <div>
    <h2>Liste des salariés</h2>

    <p v-if="loading">Chargement...</p>

    <table border="1">
      <thead>
        <tr>
          <th>Référence</th>
          <th>Nom</th>
          <th>Poste</th>
          <th>Genre</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="e in employes" :key="e.id">
          <td>{{ e.ref_employee }}</td>
          <td>
            <RouterLink :to="{ name: 'frontoffice-employe-detail', params: { id: e.id } }">
              {{ e.firstname }} {{ e.lastname }}
            </RouterLink>
          </td>
          <td>{{ e.job }}</td>
          <td>{{ e.gender }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped></style>
