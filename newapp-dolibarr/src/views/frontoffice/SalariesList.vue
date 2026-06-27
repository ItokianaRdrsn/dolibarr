<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/api/axios'

// ===== Données brutes (chargées une seule fois depuis l'API) =====
const salaires = ref([])   // vient de GET /salaries
const employes = ref([])   // vient de GET /users
const loading = ref(false)

// ===== Champs de recherche (un v-model par champ, tout simple) =====
const rechercheEmploye = ref('')        // filtre sur fk_user
const rechercheDateDebutPeriode = ref('') // filtre sur datesp
const rechercheDateFinPeriode = ref('')   // filtre sur dateep
const rechercheDateDebutPaiement = ref('') // filtre sur les paiements (datep)
const rechercheDateFinPaiement = ref('')   // filtre sur les paiements (datep)
const rechercheMontantMin = ref('')
const rechercheMontantMax = ref('')

// Donne le nom complet d'un employé à partir de son id
function nomEmploye(idUser) {
  const u = employes.value.find((e) => String(e.id) === String(idUser))
  return u ? `${u.firstname || ''} ${u.lastname || ''}`.trim() : idUser
}

// Met les paiements d'un salaire sous forme de texte lisible "date : montant"
function texteDesPaiements(paiements) {
  return paiements.map((p) => `${p.datep} : ${p.amount}`).join(' | ')
}

// Chargement initial : employés, salaires, et paiements de chaque salaire
async function chargerDonnees() {
  loading.value = true

  const resUsers = await apiClient.get('/users', { params: { limit: 0 } })
  employes.value = resUsers.data

  const resSalaries = await apiClient.get('/salaries', { params: { limit: 0 } })

  // Pour chaque salaire, on récupère aussi ses paiements (table llx_payment_salary)
  const lignes = []
  for (const s of resSalaries.data) {
    const resPaiements = await apiClient.get(`/salaries/${s.id}/payments`)
    lignes.push({
      id_employe: s.fk_user,
      ref_salaire: s.ref || s.id,
      ref_employe: nomEmploye(s.fk_user),
      date_debut: s.datesp,
      date_fin: s.dateep,
      montant: s.amount,
      paiements: resPaiements.data,             // liste brute, utilisée pour filtrer
      paiement: texteDesPaiements(resPaiements.data), // texte affiché dans le tableau
    })
  }
  salaires.value = lignes

  loading.value = false
}

// Est-ce qu'au moins un paiement de la ligne tombe dans l'intervalle demandé ?
function paiementDansIntervalle(paiements) {
  if (!rechercheDateDebutPaiement.value && !rechercheDateFinPaiement.value) {
    return true // pas de filtre sur la date de paiement
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

// ===== Le résultat affiché = la liste complète passée dans un .filter() =====
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

    <!-- ===== Recherche : juste des v-model, pas de bouton, le filtre se fait en direct ===== -->
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

    <!-- ===== Tableau des résultats ===== -->
    <table v-if="!loading">
      <thead>
        <tr>
          <th>ref_salaire</th>
          <th>ref_employe</th>
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