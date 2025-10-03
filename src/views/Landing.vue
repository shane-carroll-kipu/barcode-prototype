<script setup>
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    <h1 style="margin-bottom: 1rem;">Barcode Scanning Prototypes</h1>
    <p style="margin-bottom: 2rem; color: #666;">Choose an example to explore different implementations. These are placeholders for now.</p>

    <nav style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
      <RouterLink to="/medication" class="card">Medication Input</RouterLink>
      <RouterLink to="/rounds" class="card">Rounds</RouterLink>
      <RouterLink to="/example1" class="card">Camera Scanner (Placeholder)</RouterLink>
      <RouterLink to="/example2" class="card">Image Upload Scanner (Placeholder)</RouterLink>
      <RouterLink to="/example3" class="card">Library-based Scanner (Placeholder)</RouterLink>
      <RouterLink to="/example4" class="card">Manual Entry + Validation (Placeholder)</RouterLink>
    </nav>
  </main>
</template>

<style scoped>
.card {
  display: block;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  text-decoration: none;
  transition: box-shadow .2s ease, transform .1s ease;
}
.card:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
</style>


