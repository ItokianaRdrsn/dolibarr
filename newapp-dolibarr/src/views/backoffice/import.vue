<template>
  <div class="import-page">
    <h1>Import des données</h1>

    <!-- Zone fichiers CSV -->
    <div class="files-grid">
    <!-- CSV Employés -->
<div class="drop-zone" :class="{ ready: fichiersCSV.employes }">
  <input type="file" accept=".csv" ref="inputEmployes"
         @change="e => onFileSelect(e, 'employes')" hidden />
  <div v-if="!fichiersCSV.employes" class="drop-inner">
    <div class="icon">👥</div>
    <p>CSV Employés</p>
    <button @click="inputEmployes.click()" class="btn-choisir">Choisir un fichier</button>
  </div>
  <div v-else class="fichier-info">
    <span>✅ {{ fichiersCSV.employes.name }}</span>
    <span class="count">{{ employes.length }} ligne(s)</span>
    <button @click.stop="retirerFichier('employes')">✕</button>
  </div>
</div>

<!-- CSV Salaires -->
<div class="drop-zone" :class="{ ready: fichiersCSV.salaires }">
  <input type="file" accept=".csv" ref="inputSalaires"
         @change="e => onFileSelect(e, 'salaires')" hidden />
  <div v-if="!fichiersCSV.salaires" class="drop-inner">
    <div class="icon">💰</div>
    <p>CSV Salaires</p>
    <button @click="inputSalaires.click()" class="btn-choisir">Choisir un fichier</button>
  </div>
  <div v-else class="fichier-info">
    <span>✅ {{ fichiersCSV.salaires.name }}</span>
    <span class="count">{{ salaires.length }} ligne(s)</span>
    <button @click.stop="retirerFichier('salaires')">✕</button>
  </div>
</div>
    </div>

    <!-- Bouton unique -->
    <div class="actions">
      <button
        @click="lancerImport"
        :disabled="importing || !peutImporter"
        class="btn-import">
        <span v-if="importing">⏳ Import en cours... {{ progression }}%</span>
        <span v-else-if="!peutImporter">Charge les 2 fichiers CSV pour continuer</span>
        <span v-else>🚀 Lancer l'import ({{ employes.length }} employés + {{ salaires.length }} salaires)</span>
      </button>
    </div>

    <!-- Barre de progression -->
    <div v-if="importing" class="progress-bar">
      <div class="progress-fill" :style="{ width: progression + '%' }"></div>
      <span class="etape">{{ etapeActuelle }}</span>
    </div>

    <!-- Résultats -->
    <div v-if="importTermine" class="resultats">
      <div class="resume-grid">
        <div class="resume-card succes">
          <div class="chiffre">{{ nbSuccesEmployes }}</div>
          <div class="label">Employés importés</div>
        </div>
        <div class="resume-card erreur">
          <div class="chiffre">{{ nbErreurEmployes }}</div>
          <div class="label">Employés en erreur</div>
        </div>
        <div class="resume-card succes">
          <div class="chiffre">{{ nbSuccesSalaires }}</div>
          <div class="label">Salaires importés</div>
        </div>
        <div class="resume-card erreur">
          <div class="chiffre">{{ nbErreurSalaires }}</div>
          <div class="label">Salaires en erreur</div>
        </div>
      </div>

      <!-- Détail erreurs -->
      <div v-if="erreurs.length" class="erreurs-detail">
        <h3>Détail des erreurs</h3>
        <div v-for="e in erreurs" :key="e.ref" class="erreur-item">
          <span class="badge">{{ e.type }}</span>
          <span>Ref {{ e.ref }} — {{ e.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import api from '@/api/axios'

// ─── Fichiers ───────────────────────────────────────────────
const inputEmployes = ref(null)
const inputSalaires = ref(null)
const fichiersCSV = ref({ employes: null, salaires: null })
const employes = ref([])
const salaires = ref([])

// ─── État import ────────────────────────────────────────────
const importing = ref(false)
const importTermine = ref(false)
const etapeActuelle = ref('')
const nbImportes = ref(0)
const totalOperations = ref(0)
const erreurs = ref([])

const resultatEmployes = ref({})
const resultatSalaires = ref({})

// ─── Computed ───────────────────────────────────────────────
const peutImporter = computed(() =>
  fichiersCSV.value.employes && fichiersCSV.value.salaires
)

const progression = computed(() => {
  if (!totalOperations.value) return 0
  return Math.round((nbImportes.value / totalOperations.value) * 100)
})

const nbSuccesEmployes = computed(() =>
  Object.values(resultatEmployes.value).filter(r => r === 'succes').length)
const nbErreurEmployes = computed(() =>
  Object.values(resultatEmployes.value).filter(r => r === 'erreur').length)
const nbSuccesSalaires = computed(() =>
  Object.values(resultatSalaires.value).filter(r => r === 'succes').length)
const nbErreurSalaires = computed(() =>
  Object.values(resultatSalaires.value).filter(r => r === 'erreur').length)

// ─── Fichiers ───────────────────────────────────────────────
function parserCSV(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data)
    })
  })
}

async function onFileSelect(e, type) {
  const file = e.target.files[0]
  if (!file) return
  fichiersCSV.value[type] = file
  const data = await parserCSV(file)
  if (type === 'employes') employes.value = data
  else salaires.value = data
}

async function onDrop(e, type) {
  const file = e.dataTransfer.files[0]
  if (!file?.name.endsWith('.csv')) return
  fichiersCSV.value[type] = file
  const data = await parserCSV(file)
  if (type === 'employes') employes.value = data
  else salaires.value = data
}

function retirerFichier(type) {
  fichiersCSV.value[type] = null
  if (type === 'employes') { employes.value = []; inputEmployes.value.value = '' }
  else { salaires.value = []; inputSalaires.value.value = '' }
}

// ─── Helpers ────────────────────────────────────────────────
function convertirGenre(genre) {
  const g = genre?.toLowerCase().trim()
  if (g === 'homme' || g === 'man') return 'man'
  if (g === 'femme' || g === 'woman') return 'woman'
  return ''
}

function convertirDate(dateStr) {
  if (!dateStr) return null
  const [jour, mois, annee] = dateStr.trim().split('/')
  const anneeComplete = annee.length === 2 ? `20${annee}` : annee
  return `${anneeComplete}-${mois.padStart(2,'0')}-${jour.padStart(2,'0')}`
}

function convertirMontant(val) {
  if (!val) return 0
  return parseFloat(String(val).replace(',', '.'))
}

function parserPaiements(raw) {
  if (!raw || raw.trim() === '') return []
  try {
    const jsonStr = raw.trim().replace(/^\{/, '[').replace(/\}$/, ']')
    const tableau = JSON.parse(jsonStr)
    return tableau.map(([date, montant]) => ({
      date: convertirDate(date),
      montant: convertirMontant(montant)
    }))
  } catch {
    return []
  }
}

function pause(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Rollback ────────────────────────────────────────────────
// On garde trace de tout ce qui a été créé
const crees = ref({
  paiements: [],  // { salaireId }  (pas d'endpoint DELETE payments, on supprime le salaire)
  salaires: [],   // [salaireId, salaireId, ...]
  employes: [],   // [userId, userId, ...]
})

async function rollback() {
  etapeActuelle.value = '⚠️ Erreur détectée — rollback en cours...'

  // 1. Supprimer les salaires (les paiements sont liés, supprimés en cascade)
  for (const id of [...crees.value.salaires].reverse()) {
    try {
      await api.delete(`/salaries/${id}`)
    } catch (e) {
      console.warn(`Impossible de supprimer le salaire ${id}`, e)
    }
    await pause(100)
  }

  // 2. Supprimer les employés créés
  for (const id of [...crees.value.employes].reverse()) {
    try {
      await api.delete(`/users/${id}`)
    } catch (e) {
      console.warn(`Impossible de supprimer l'utilisateur ${id}`, e)
    }
    await pause(100)
  }

  etapeActuelle.value = '🔄 Rollback terminé — aucune donnée enregistrée'
}

// ─── Import tout ou rien ─────────────────────────────────────
async function lancerImport() {
  importing.value = true
  importTermine.value = false
  erreurs.value = []
  resultatEmployes.value = {}
  resultatSalaires.value = {}
  nbImportes.value = 0
  totalOperations.value = employes.value.length + salaires.value.length
  crees.value = { paiements: [], salaires: [], employes: [] }

  const refToDolibarrId = {}

  try {
    // ── ÉTAPE 1 : Employés ──────────────────────────────────
    etapeActuelle.value = 'Import des employés...'

    for (const emp of employes.value) {
      etapeActuelle.value = `Import employé ${emp.nom}...`

      const payload = {
        lastname: emp.nom,
        login: emp.identifiant,
        password: emp.mdp,
        gender: convertirGenre(emp.genre),
        statut: 1,
        employee: 1,
        note_private: `Heures/semaine:${emp.heure_travail_semaine}`
      }

      // Peut lever une exception → capturée par le try global
      let dolibarrId
      try {
        const { data } = await api.post('/users', payload)
        dolibarrId = data
      } catch (err) {
        if (err.response?.status === 500) {
          const { data: users } = await api.get('/users?limit=500')
          const existant = users.find(u => u.login === emp.identifiant)
          if (existant) {
            await api.put(`/users/${existant.id}`, payload)
            dolibarrId = existant.id
            // Utilisateur existant : on ne le rollback pas
          } else {
            throw new Error(`Échec création employé ${emp.nom} : ${err.response?.data?.error?.message || err.message}`)
          }
        } else {
          throw new Error(`Échec création employé ${emp.nom} : ${err.response?.data?.error?.message || err.message}`)
        }
      }

      // Mémoriser uniquement les nouveaux (pas les mis à jour)
      if (!crees.value.employes.includes(dolibarrId)) {
        crees.value.employes.push(dolibarrId)
      }

      refToDolibarrId[emp.ref_employe] = dolibarrId
      resultatEmployes.value[emp.ref_employe] = 'succes'
      nbImportes.value++
      await pause(200)
    }

    // ── ÉTAPE 2 : Salaires + Paiements ─────────────────────
    etapeActuelle.value = 'Import des salaires...'

    for (const row of salaires.value) {
      etapeActuelle.value = `Import salaire ref ${row.ref_salaire}...`

      const fk_user = refToDolibarrId[row.ref_employe]
      if (!fk_user) {
        throw new Error(`Employé ref ${row.ref_employe} introuvable pour le salaire ${row.ref_salaire}`)
      }

      const dateDebut = convertirDate(row.date_debut)
      const dateFin = convertirDate(row.date_fin)

      // Créer le salaire
      const { data: salaireId } = await api.post('/salaries', {
        fk_user,
        label: `Salaire ref ${row.ref_salaire}`,
        amount: convertirMontant(row.montant),
        datesp: Math.floor(new Date(dateDebut).getTime() / 1000),
        dateep: Math.floor(new Date(dateFin).getTime() / 1000),
        paye: 0,
        status: 0
      }).catch(err => {
        throw new Error(`Échec création salaire ref ${row.ref_salaire} : ${err.response?.data?.error?.message || err.message}`)
      })

      crees.value.salaires.push(salaireId)
      resultatSalaires.value[row.ref_salaire] = 'succes'

      // Ajouter les paiements
      const paiements = parserPaiements(row.paiement)
      for (const p of paiements) {
        await api.post(`/salaries/${salaireId}/payments`, {
          paiementtype: 'VIR',
          datepaye: p.date,
          chid: '',
          amounts: { [salaireId]: p.montant },
          accountid: 1
        }).catch(err => {
          throw new Error(`Échec paiement du salaire ${row.ref_salaire} : ${err.response?.data?.error?.message || err.message}`)
        })
        await pause(100)
      }

      nbImportes.value++
      await pause(200)
    }

    // ── Tout réussi ─────────────────────────────────────────
    etapeActuelle.value = '✅ Import terminé avec succès !'
    importTermine.value = true

  } catch (err) {
    // ── Une erreur quelque part → rollback total ─────────────
    console.error('Erreur import, rollback...', err.message)
    erreurs.value.push({ type: 'Global', ref: '—', message: err.message })

    await rollback()

    importTermine.value = true
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.import-page { max-width: 960px; margin: auto; padding: 2rem; }
h1 { font-size: 1.4rem; margin-bottom: 1.5rem; }

.files-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.drop-zone {
  /* retire cursor: pointer ici */
  border: 2px solid #d1d5db;  /* solid au lieu de dashed */
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-choisir {
  margin-top: 0.75rem;
  padding: 0.4rem 1rem;
  background: #4f86c6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}
.btn-choisir:hover { background: #3a6fad; }
/* .drop-zone:hover { border-color: #4f86c6; }
.drop-zone.ready { border-color: #22c55e; background: #f0fdf4; }

.drop-inner { pointer-events: none; }
.drop-inner .icon { font-size: 2rem; margin-bottom: 0.5rem; }
.drop-inner p { margin: 0.2rem 0; font-size: 0.95rem; } */
.hint { color: #999; font-size: 0.8rem; }

.fichier-info {
  display: flex; flex-direction: column;
  align-items: center; gap: 0.4rem; pointer-events: none;
}
.fichier-info span { font-size: 0.9rem; }
.fichier-info .count { color: #666; font-size: 0.8rem; }
.fichier-info button {
  pointer-events: all;
  background: none; border: none; cursor: pointer;
  color: #999; font-size: 1rem;
}

.actions { margin-bottom: 1rem; }
.btn-import {
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: #4f86c6;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-import:disabled { opacity: 0.5; cursor: not-allowed; }

.progress-bar {
  height: 10px; background: #e5e7eb;
  border-radius: 5px; overflow: hidden;
  margin-bottom: 0.5rem;
}
.progress-fill { height: 100%; background: #4f86c6; transition: width 0.3s; }
.etape { font-size: 0.85rem; color: #666; }

.resume-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}
.resume-card {
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
}
.resume-card.succes { background: #f0fdf4; }
.resume-card.erreur { background: #fef2f2; }
.chiffre { font-size: 2rem; font-weight: 700; }
.label { font-size: 0.8rem; color: #666; margin-top: 0.25rem; }

.erreurs-detail { margin-top: 1rem; }
.erreurs-detail h3 { font-size: 1rem; margin-bottom: 0.75rem; }
.erreur-item {
  display: flex; gap: 0.75rem; align-items: center;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}
.badge {
  background: #fee2e2; color: #b91c1c;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .files-grid { grid-template-columns: 1fr; }
  .resume-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>