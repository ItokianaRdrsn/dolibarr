<template>
    <div>
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page of the application.</p>
        <RouterLink to="/backoffice/login">Go to Backoffice Login</RouterLink>
        <p>Welcome to the Home Page! This is the main landing page of the application.</p>
        <RouterLink :to="{ name: 'frontoffice-salaries' }">Go to Frontoffice Salaries</RouterLink>
    </div>
</template>
<script setup>
  
</script>