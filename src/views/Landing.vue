<script setup>
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    <h1 style="margin-bottom: 1rem;">Barcode Scanning App</h1>
    <p style="margin-bottom: 2rem; color: #666;">Scan barcodes using your device camera or keyboard scanner. Both pages support GS1 DataMatrix and other barcode formats.</p>

    <nav style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
      <RouterLink to="/medication" class="card">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💊</div>
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Medication Input</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Scan medication barcodes and auto-fill GS1 fields</div>
      </RouterLink>
      <RouterLink to="/rounds" class="card">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🏥</div>
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Rounds</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Scan patient barcodes for rounds documentation</div>
      </RouterLink>
      <RouterLink to="/patient-search" class="card">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">👥</div>
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Patient Search</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Search and view patient information</div>
      </RouterLink>
    </nav>
  </main>
</template>

<style scoped>
.card {
  display: block;
  padding: 1.5rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  color: #111827;
  text-decoration: none;
  transition: box-shadow .2s ease, transform .1s ease, border-color .2s ease;
  text-align: center;
}
.card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  transform: translateY(-2px);
  border-color: #646cff;
}

@media (prefers-color-scheme: dark) {
  .card {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }
  .card:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    border-color: #818cf8;
  }
}
</style>


