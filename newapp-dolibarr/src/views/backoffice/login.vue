<template>
    <div>
        <h1>Welcome to the Backoffice Login Page</h1>
        <p>Please log in to access the backoffice.</p>
        <label for="password">Mot de passe</label>
        <input type="password" id="password" v-model="mdp" />
        <button @click="login">Login</button>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

    const router = useRouter();
    const login = () => {
        if(mdp.value=="1234"){
            router.push('/backoffice/dashboard');
        }
    };
    const mdp=ref('1234'); // Mot de passe

</script>