<template>
    <div>
        <h1>Réinitialisation des données</h1>
        <p>
            Cette page supprime, via l'API Dolibarr, toutes les données de test :
            les paiements de salaire, les salaires, et les employés
            (utilisateurs ayant une référence employé).
        </p>

        <!-- Étape "depart" : bouton de lancement -->
        <div v-if="etape === 'depart'">
            <button @click="etape = 'confirmation'">Réinitialiser les données</button>
        </div>

        <!-- Étape "confirmation" : confirmation explicite -->
        <div v-else-if="etape === 'confirmation'">
            <p><strong>Êtes-vous sûr ? Cette action est irréversible.</strong></p>
            <button @click="lancerReinitialisation">Oui, tout supprimer</button>
            <button @click="etape = 'depart'">Annuler</button>
        </div>

        <!-- Étape "en cours" -->
        <div v-else-if="etape === 'enCours'">
            <p>Réinitialisation en cours...</p>
        </div>

        <!-- Étape "resultat" -->
        <div v-else-if="etape === 'resultat'">
            <p>Réinitialisation terminée.</p>
            <ul>
                <li>
                    Paiements supprimés : {{ resultat.nbPaiementsSupprimes }} / {{ resultat.nbPaiements }}
                </li>
                <li>
                    Salaires supprimés : {{ resultat.nbSalairesSupprimes }} / {{ resultat.nbSalaires }}
                </li>
                <li>
                    Employés supprimés : {{ resultat.nbEmployesSupprimes }} / {{ resultat.nbEmployes }}
                </li>
            </ul>

            <!-- Détail des échecs -->
            <div v-if="resultat.echecsPaiements.length">
                <p><strong>Paiements non supprimés :</strong></p>
                <ul>
                    <li v-for="echec in resultat.echecsPaiements" :key="'paiement-' + echec.id">
                        Paiement #{{ echec.id }} : {{ echec.erreur }}
                    </li>
                </ul>
            </div>

            <div v-if="resultat.echecsSalaires.length">
                <p><strong>Salaires non supprimés :</strong></p>
                <ul>
                    <li v-for="echec in resultat.echecsSalaires" :key="'salaire-' + echec.id">
                        Salaire #{{ echec.id }} : {{ echec.erreur }}
                    </li>
                </ul>
            </div>

            <div v-if="resultat.echecsEmployes.length">
                <p><strong>Employés non supprimés :</strong></p>
                <ul>
                    <li v-for="echec in resultat.echecsEmployes" :key="'employe-' + echec.id">
                        Employé #{{ echec.id }} : {{ echec.erreur }}
                    </li>
                </ul>
            </div>

            <button @click="etape = 'depart'">Refaire une réinitialisation</button>
        </div>

        <!-- Étape "erreur" : erreur bloquante -->
        <div v-else-if="etape === 'erreur'">
            <p>Une erreur est survenue : {{ erreur }}</p>
            <button @click="etape = 'depart'">Réessayer</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import resetService from '@/services/resetService'

// Une seule variable pilote l'affichage : 'depart', 'confirmation',
// 'enCours', 'resultat' ou 'erreur'. Ça évite les états incohérents
// où deux blocs (ex: le bouton de départ ET le résultat) pourraient
// s'afficher en même temps.
const etape = ref('depart')
const resultat = ref(null)
const erreur = ref('')

const lancerReinitialisation = async () => {
    etape.value = 'enCours'

    console.log('[reset] Début de la réinitialisation des données')

    try {
        resultat.value = await resetService.reinitialiserToutesLesDonnees()

        console.log(
            `[reset] Paiements supprimés : ${resultat.value.nbPaiementsSupprimes}/${resultat.value.nbPaiements}`,
            resultat.value.echecsPaiements,
        )
        console.log(
            `[reset] Salaires supprimés : ${resultat.value.nbSalairesSupprimes}/${resultat.value.nbSalaires}`,
            resultat.value.echecsSalaires,
        )
        console.log(
            `[reset] Employés supprimés : ${resultat.value.nbEmployesSupprimes}/${resultat.value.nbEmployes}`,
            resultat.value.echecsEmployes,
        )
        console.log('[reset] Réinitialisation terminée', resultat.value)

        etape.value = 'resultat'
    } catch (e) {
        erreur.value = e?.message || 'Erreur inconnue'
        console.error('[reset] Erreur pendant la réinitialisation :', e)
        etape.value = 'erreur'
    }
}
</script>