<template>
    <div>
        <h1>Welcome to the Backoffice Dashboard</h1>
        <p>This is the backoffice dashboard page.</p>
        <RouterLink to="/backoffice/import">Go to Import Page</RouterLink>
        
        <!-- Salaires Femmes -->
        <div>
            <h2>Salaries</h2>
            <ul>
                <li v-for="salary in salariesByWomen" :key="salary.id">
                    {{ salary.label }} - {{ salary.amount }}
                </li>
            </ul>
            <p>Total Salaries for Women: {{ sumSalariesByWomen }}</p>
        </div>
        
        <!-- Salaires Hommes -->
        <div>
            <h2>Salaries</h2>
            <ul>
                <li v-for="salary in salariesByMen" :key="salary.id">
                    {{ salary.label }} - {{ salary.amount }}
                </li>
            </ul>
            <p>Total Salaries for Men: {{ sumSalariesByMen }}</p>
        </div>
        
        <!-- Paiements par mois -->
        <div>
            <h2>Paiements Salaire par mois</h2>
            
            <div v-for="(item, month) in salariesPaiementsByMonth" :key="month">
                <h3>{{ month }}</h3>
                <p>Nombre de paiements : {{ item.count }}</p>
                <p><strong>Total : {{ item.total }} €</strong></p>
                
                <ul>
                    <li v-for="salarie in item.salaries" :key="salarie.id">
                        {{ salarie.label }} - {{ salarie.amount }} €
                    </li>
                </ul>
                <hr />
            </div>
        </div>
    </div>
</template>

<script setup>
import { getSalaries, getUser, getSalariesPaiements } from '@/services/front-dolibarr/salaries'
import { onMounted, ref, computed } from 'vue'

const salaries = ref([])
const salariesPaiments = ref([])
const getUserCache = ref({})

// ===== SALAIRES PAR GENRE =====
const salariesByWomen = computed(() => {
    return salaries.value.filter((salary) => {
        const user = getUserCache.value[salary.fk_user]
        return user?.gender === 'woman'
    })
})

const salariesByMen = computed(() => {
    return salaries.value.filter((salary) => {
        const user = getUserCache.value[salary.fk_user]
        return user?.gender === 'man'
    })
})

// ===== SOMMES =====
const sumSalariesByWomen = computed(() => {
    return salariesByWomen.value.reduce((sum, salary) => sum + Number(salary.amount || 0), 0)
})

const sumSalariesByMen = computed(() => {
    return salariesByMen.value.reduce((sum, salary) => sum + Number(salary.amount || 0), 0)
})

// ===== PAIEMENTS PAR MOIS (avec total) =====
const salariesPaiementsByMonth = computed(() => {
    const result = {}
    
    for (const salary of salariesPaiments.value) {
        const date = new Date(salary.datepaye * 1000)
        date.setDate(1)
        
        const key = date.toLocaleDateString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
        })
        
        if (!result[key]) {
            result[key] = {
                salaries: [],
                count: 0,
                total: 0
            }
        }
        
        result[key].salaries.push(salary)
        result[key].count += 1
        result[key].total += Number(salary.amount || 0)
    }
    
    return result
})

// ===== FONCTIONS =====
const fetchSalaries = async () => {
    try {
        const response = await getSalaries()
        salaries.value = response
    } catch (error) {
        console.error('Error fetching salaries:', error)
    }
}

const fetchSalariesPaiements = async () => {
    try {
        const response = await getSalariesPaiements()
        salariesPaiments.value = response
        console.log('salariesPaiments', salariesPaiments.value)
    } catch (error) {
        console.error('Error fetching salaries:', error)
    }
}

// ===== MOUNT =====
onMounted(async () => {
    await fetchSalaries()
    
    const userIds = [...new Set(salaries.value.map((salary) => salary.fk_user))]
    for (const userId of userIds) {
        if (getUserCache.value[userId]) continue
        getUserCache.value[userId] = await getUser(userId)
    }
    
    await fetchSalariesPaiements()
})
</script>