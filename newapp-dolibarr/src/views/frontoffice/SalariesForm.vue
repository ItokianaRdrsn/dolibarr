<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'
import salaryService from '@/services/salaryService'

const employes = ref([])

const refEmploye = ref('')
const refSalaire = ref('')
const dateDebut = ref('')
const dateFin = ref('')
const montant = ref('')

async function chargerEmployes() {
  employes.value = await userService.listerEmployesAvecRef()
}

async function creerSalaire() {
  try {
    await salaryService.creerSalaire({
      refEmploye: refEmploye.value,
      employes: employes.value,
      montant: montant.value,
      dateDebut: dateDebut.value,
      dateFin: dateFin.value,
    })
  } catch (erreur) {
    console.log(erreur.response)
    console.log(erreur.response.data)
  }
}

onMounted(chargerEmployes)
</script>

<template>
  <div>
    <h1>Créer un salaire</h1>

    <div>
      <label>Référence employé :</label>
      <select v-model="refEmploye">
        <option value="">Choisir...</option>

        <option
          v-for="employe in employes"
          :key="employe.id"
          :value="employe.ref_employee"
        >
          {{ employe.ref_employee }}
        </option>
      </select>
    </div>

    <div>
      <label>Référence salaire :</label>
      <input
        type="text"
        v-model="refSalaire"
      />
    </div>

    <div>
      <label>Date début :</label>
      <input
        type="date"
        v-model="dateDebut"
      />
    </div>

    <div>
      <label>Date fin :</label>
      <input
        type="date"
        v-model="dateFin"
      />
    </div>

    <div>
      <label>Montant :</label>
      <input
        type="number"
        v-model="montant"
      />
    </div>

    <button @click="creerSalaire">
      Créer
    </button>
  </div>
</template>