<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/api/axios'

const employes = ref([])

const refEmploye = ref('')
const refSalaire = ref('')
const dateDebut = ref('')
const dateFin = ref('')
const montant = ref('')

async function chargerEmployes() {
  const reponseEmployes = await apiClient.get('/users', {
    params: { limit: 0 },
  })

  employes.value = reponseEmployes.data.filter(
    (e) => e.ref_employee,
  )
}

async function creerSalaire() {
  try {
    const employe = employes.value.find(
      (e) => e.ref_employee === refEmploye.value,
    )

    await apiClient.post('/salaries', {
      fk_user: employe.id,
      //ref: refSalaire.value,
      label: 'Salaire',
      amount: Number(montant.value),
      salary: Number(montant.value),
      datesp: dateDebut.value,
      dateep: dateFin.value,
      // datesp: Math.floor(new Date(dateDebut.value).getTime() / 1000),
      // dateep: Math.floor(new Date(dateFin.value).getTime() / 1000),
      type_payment: 2,
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