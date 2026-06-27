<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/api/axios'

// ===== Données brutes (chargées une seule fois depuis l'API) =====
const salaires = ref([])   // vient de GET /salaries
const employes = ref([])   // vient de GET /users
const loading = ref(false)

// ===== Champs de recherche (un v-model par champ, tout simple) =====
const rechercheEmploye = ref('')
const rechercheDateDebutPeriode = ref('')
const rechercheDateFinPeriode = ref('')
const rechercheDateDebutPaiement = ref('')
const rechercheDateFinPaiement = ref('')
const rechercheMontantMin = ref('')
const rechercheMontantMax = ref('')

// Donne le nom complet d'un employé à partir de son id
function nomEmploye(idUser) {
  const u = employes.value.find((e) => String(e.id) === String(idUser))
  return u ? `${u.firstname || ''} ${u.lastname || ''}`.trim() : idUser
}

// Met les paiements d'un salaire sous forme de texte lisible
function texteDesPaiements(paiements) {
  return paiements
    .map((p) => `${formatDate(p.datep)} : ${p.amount}`)
    .join(' | ')
}

function formatDate(timestamp) {
  if (!timestamp) return ''

  return new Date(timestamp * 1000).toISOString().split('T')[0]
}

// Chargement initial
async function chargerDonnees() {
  loading.value = true

  const reponseEmployes = await apiClient.get('/users', {
    params: { limit: 0 },
  })
  employes.value = reponseEmployes.data

  const reponseSalaires = await apiClient.get('/salaries', {
    params: { limit: 0 },
  })

  const reponsePaiements = await apiClient.get('/salaries/payments', {
    params: { limit: 0 },
  })

  salaires.value = reponseSalaires.data.map((salaire) => {
    const paiements = reponsePaiements.data.filter(
      (paiement) => paiement.fk_salary === salaire.id,
    )

    return {
        id_employe: salaire.fk_user,
        ref_salaire: salaire.ref || salaire.id,
        ref_employe: employes.value.find(e => String(e.id) === String(salaire.fk_user))?.ref_employee || '',
        nom_employe: nomEmploye(salaire.fk_user),
        date_debut: formatDate(salaire.datesp),
        date_fin: formatDate(salaire.dateep),
        montant: salaire.amount,
        paiements,
        paiement: texteDesPaiements(paiements),
    }
  })

  loading.value = false
}

// Est-ce qu'au moins un paiement de la ligne tombe dans l'intervalle demandé ?
function paiementDansIntervalle(paiements) {
  if (!rechercheDateDebutPaiement.value && !rechercheDateFinPaiement.value) {
    return true
  }

  return paiements.some((p) => {
    if (rechercheDateDebutPaiement.value && p.datep < rechercheDateDebutPaiement.value) {
      return false
    }

    if (rechercheDateFinPaiement.value && p.datep > rechercheDateFinPaiement.value) {
      return false
    }

    return true
  })
}

// ===== Résultat affiché =====
const resultats = computed(() => {
  return salaires.value.filter((s) => {
    if (rechercheEmploye.value && String(s.id_employe) !== String(rechercheEmploye.value)) {
      return false
    }

    if (rechercheDateDebutPeriode.value && s.date_debut < rechercheDateDebutPeriode.value) {
      return false
    }

    if (rechercheDateFinPeriode.value && s.date_fin > rechercheDateFinPeriode.value) {
      return false
    }

    if (rechercheMontantMin.value && s.montant < Number(rechercheMontantMin.value)) {
      return false
    }

    if (rechercheMontantMax.value && s.montant > Number(rechercheMontantMax.value)) {
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
    <h1>Liste des salaires</h1>

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

    <table v-if="!loading" border="1">
      <thead>
        <tr>
          <th>ref_salaire</th>
          <th>ref_employe</th>
          <th>nom_employe</th>
          <th>date_debut</th>
          <th>date_fin</th>
          <th>montant</th>
          <th>paiement</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(s, index) in resultats" :key="index">
          <td>{{ s.ref_salaire }}</td>
          <td>{{ s.ref_employe }}</td>
          <td>{{ s.nom_employe }}</td>
          <td>{{ s.date_debut }}</td>
          <td>{{ s.date_fin }}</td>
          <td>{{ s.montant }}</td>
          <td>{{ s.paiement }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !resultats.length">Aucun salaire trouvé.</p>
  </div>
</template>