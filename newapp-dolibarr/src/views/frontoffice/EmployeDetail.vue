<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import userService from '@/services/userService'
import salaryService from '@/services/salaryService'

const route = useRoute()

const employe = ref(null)
const salaires = ref([])
const loading = ref(false)

// Popup paiement (même logique que dans SalariesList)
const afficherPopup = ref(false)
const salaireSelectionne = ref(null)

const paiement = ref({
  date: new Date().toISOString().slice(0, 10),
  montant: 0,
})

function totalPaye(salaire) {
  return salaryService.totalPaye(salaire)
}

function resteAPayer(salaire) {
  return salaryService.resteAPayer(salaire)
}

async function chargerDonnees() {
  loading.value = true

  const id = route.params.id

  employe.value = await userService.getEmploye(id)

  salaires.value = await salaryService.ListerSalairesParEmploye(id)

  loading.value = false
}

function ouvrirPaiement(salaire) {
  salaireSelectionne.value = salaire

  paiement.value = {
    date: new Date().toISOString().slice(0, 10),
    montant: resteAPayer(salaire)
  }

  afficherPopup.value = true
}

async function enregistrerPaiement() {
  try {
    await salaryService.payerSalaire({
      salaireId: salaireSelectionne.value.id,
      date: paiement.value.date,
      montant: paiement.value.montant,
    })

    afficherPopup.value = false

    await chargerDonnees()
  } catch (e) {
    console.error(e)
    alert(
      e.response?.data?.error ||
      e.response?.data?.message ||
      JSON.stringify(e.response?.data) ||
      "Erreur lors du paiement."
    )
  }
}

const totalMontant = computed(() =>
  salaires.value.reduce((total, s) => total + Number(s.montant), 0)
)

const totalResteAPayer = computed(() =>
  salaires.value.reduce((total, s) => total + resteAPayer(s), 0)
)

onMounted(chargerDonnees)
</script>

<template>
  <div>
    <p><RouterLink :to="{ name: 'frontoffice-employes' }">&larr; Retour à la liste des salariés</RouterLink></p>

    <p v-if="loading">Chargement...</p>

    <template v-if="employe">
      <h2>{{ employe.firstname }} {{ employe.lastname }}</h2>

      <table border="1">
        <tbody>
          <tr>
            <th>Référence</th>
            <td>{{ employe.ref_employee }}</td>
          </tr>
          <tr>
            <th>Poste</th>
            <td>{{ employe.job }}</td>
          </tr>
          <tr>
            <th>Genre</th>
            <td>{{ employe.gender }}</td>
          </tr>
          <tr>
            <th>Identifiant</th>
            <td>{{ employe.login }}</td>
          </tr>
          <tr>
            <th>Heures de travail / semaine</th>
            <td>{{ employe.note_private }}</td>
          </tr>
        </tbody>
      </table>

      <h3>Historique des salaires</h3>

      <table border="1">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Montant</th>
            <th>Déjà payé</th>
            <th>Reste</th>
            <th>Paiements</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="s in salaires" :key="s.id">
            <td>{{ s.ref_salaire }}</td>
            <td>{{ s.date_debut }}</td>
            <td>{{ s.date_fin }}</td>
            <td>{{ s.montant }}</td>
            <td>{{ totalPaye(s) }}</td>
            <td>{{ resteAPayer(s) }}</td>
            <td>{{ s.paiement }}</td>
            <td>
              <button v-if="resteAPayer(s) > 0" @click="ouvrirPaiement(s)">
                Payer
              </button>
              <span v-else>
                ✔ Payé
              </span>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th colspan="3">Total</th>
            <th>{{ totalMontant }}</th>
            <th></th>
            <th>{{ totalResteAPayer }}</th>
            <th colspan="2"></th>
          </tr>
        </tfoot>
      </table>
    </template>

    <div v-if="afficherPopup" class="popup">
      <div class="popup-content">
        <h3>Nouveau paiement</h3>

        <label>Date</label>
        <input type="date" v-model="paiement.date" />

        <br><br>

        <label>Montant</label>
        <input type="number" v-model="paiement.montant" />

        <br><br>

        <button @click="enregistrerPaiement">
          Valider
        </button>
        <button @click="afficherPopup = false">
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background: white;
  padding: 20px;
  width: 350px;
  border-radius: 6px;
}
</style>
