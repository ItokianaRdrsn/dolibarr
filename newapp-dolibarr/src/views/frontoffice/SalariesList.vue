<script setup>
import { ref, computed, onMounted } from 'vue'
import salaryService from '@/services/salaryService'
import salaireParser from '@/services/salaryParser'

const salaires = ref([])
const employes = ref([])
const loading = ref(false)

// Recherche
const rechercheEmploye = ref('')
const rechercheDateDebutPeriode = ref('')
const rechercheDateFinPeriode = ref('')
const rechercheDateDebutPaiement = ref('')
const rechercheDateFinPaiement = ref('')
const rechercheMontantMin = ref('')
const rechercheMontantMax = ref('')

// Popup
const afficherPopup = ref(false)
const salaireSelectionne = ref(null)

const paiement = ref({
  date: new Date().toISOString().slice(0, 10),
  montant: 0,
})

function totalPaye(salaire) {
  return salaireParser.totalPaye(salaire)
}

function resteAPayer(salaire) {
  return salaireParser.resteAPayer(salaire)
}

async function chargerDonnees() {
  loading.value = true

  const { employes: e, salaires: s } = await salaryService.listerSalaires()

  employes.value = e
  salaires.value = s

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
    const r = await salaryService.payerSalaire({
      salaireId: salaireSelectionne.value.id,
      date: paiement.value.date,
      montant: paiement.value.montant,
    })

    console.log(r.data)

    afficherPopup.value = false

    await chargerDonnees()
  } catch (e) {
    console.error(e)
    console.log("Response :", e.response)
    console.log("Data :", e.response?.data)

    alert(
      e.response?.data?.error ||
      e.response?.data?.message ||
      JSON.stringify(e.response?.data) ||
      "Erreur lors du paiement."
    )
  }
}

function paiementDansIntervalle(paiements) {
  if (
    !rechercheDateDebutPaiement.value &&
    !rechercheDateFinPaiement.value
  ) {
    return true
  }

  return paiements.some(p => {
    const d = salaireParser.formatDate(p.datep)

    if (
      rechercheDateDebutPaiement.value &&
      d < rechercheDateDebutPaiement.value
    ) {
      return false
    }

    if (
      rechercheDateFinPaiement.value &&
      d > rechercheDateFinPaiement.value
    ) {
      return false
    }

    return true
  })
}

const resultats = computed(() => {
  return salaires.value.filter(s => {
    if (
      rechercheEmploye.value &&
      String(s.id_employe) !== String(rechercheEmploye.value)
    ) {
      return false
    }

    if (
      rechercheDateDebutPeriode.value &&
      s.date_debut < rechercheDateDebutPeriode.value
    ) {
      return false
    }

    if (
      rechercheDateFinPeriode.value &&
      s.date_fin > rechercheDateFinPeriode.value
    ) {
      return false
    }

    if (
      rechercheMontantMin.value &&
      s.montant < Number(rechercheMontantMin.value)
    ) {
      return false
    }

    if (
      rechercheMontantMax.value &&
      s.montant > Number(rechercheMontantMax.value)
    ) {
      return false
    }

    if (!paiementDansIntervalle(s.paiements)) {
      return false
    }

    return true
  })
})

onMounted(chargerDonnees)
</script>

<template>
  <div>
    <h2>Liste des salaires</h2>

    <div>
      <label>Employé :</label>
      <select v-model="rechercheEmploye">
        <option value="">Tous</option>
        <option v-for="e in employes" :key="e.id" :value="e.id">
          {{ e.firstname }} {{ e.lastname }}
        </option>
      </select>
    </div>

    <div>
      <label>Période - date début (à partir de) :</label>
      <input type="date" v-model="rechercheDateDebutPeriode" />
    </div>

    <div>
      <label>Période - date fin (jusqu'à) :</label>
      <input type="date" v-model="rechercheDateFinPeriode" />
    </div>

    <div>
      <label>Paiement - date début (à partir de) :</label>
      <input type="date" v-model="rechercheDateDebutPaiement" />
    </div>

    <div>
      <label>Paiement - date fin (jusqu'à) :</label>
      <input type="date" v-model="rechercheDateFinPaiement" />
    </div>

    <div>
      <label>Montant min :</label>
      <input type="number" v-model="rechercheMontantMin" />
    </div>

    <div>
      <label>Montant max :</label>
      <input type="number" v-model="rechercheMontantMax" />
    </div>

    <p v-if="loading">Chargement...</p>

    <table border="1">
      <thead>
        <tr>
          <th>Référence</th>
          <th>Employé</th>
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
        <tr v-for="s in resultats" :key="s.id">
          <td>{{ s.ref_salaire }}</td>
          <td>{{ s.nom_employe }}</td>
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
    </table>

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
