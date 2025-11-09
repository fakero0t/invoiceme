<template>
  <div class="home">
    <div class="hero">
      <h1>Invoice MVP</h1>
      <p class="tagline">Professional Invoice Management Made Simple</p>

      <div class="cta-buttons">
        <router-link to="/dashboard" class="btn btn-primary">Go to Dashboard (Dev Mode)</router-link>
        <router-link to="/customers" class="btn btn-secondary">View Customers</router-link>
      </div>

      <div class="dev-notice">
        <p>🔓 Development Mode - Authentication Disabled</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth temporarily disabled for development
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.hero {
  text-align: center;
  color: white;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.tagline {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.authenticated-message {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.authenticated-message p {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.dev-notice {
  margin-top: 3rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.dev-notice p {
  margin: 0.5rem 0;
}
</style>

