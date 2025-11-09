<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="user-info">
        <span v-if="authStore.user">Welcome, {{ authStore.user.name }}!</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <main class="dashboard-content">
      <div class="welcome-card">
        <h2>Welcome to Invoice MVP</h2>
        <p>Your invoice management system is ready to use.</p>
        
        <div v-if="authStore.user" class="user-details">
          <p><strong>Email:</strong> {{ authStore.user.email }}</p>
          <p><strong>User ID:</strong> {{ authStore.user.id }}</p>
        </div>

        <div class="quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><router-link to="/customers">Customers</router-link></li>
            <li><router-link to="/invoices">Invoices</router-link></li>
            <li>Payments (Coming in PR6)</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-logout:hover {
  background: #c82333;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.welcome-card p {
  margin: 0 0 1.5rem 0;
  color: #666;
}

.user-details {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
}

.user-details p {
  margin: 0.5rem 0;
}

.quick-links {
  margin-top: 2rem;
}

.quick-links h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.quick-links ul {
  list-style: none;
  padding: 0;
}

.quick-links li {
  padding: 0.75rem;
  background: #f8f9fa;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  color: #666;
}

.quick-links li a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.quick-links li a:hover {
  text-decoration: underline;
}
</style>

