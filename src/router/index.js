import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import MedicationInput from '../views/MedicationInput.vue'
import Rounds from '../views/Rounds.vue'
import PatientBarcodes from '../views/PatientBarcodes.vue'

const routes = [
  { path: '/', name: 'Landing', component: Landing },
  { path: '/medication', name: 'MedicationInput', component: MedicationInput },
  { path: '/rounds', name: 'Rounds', component: Rounds },
  { path: '/barcodes', name: 'PatientBarcodes', component: PatientBarcodes },
  { path: '/example1', name: 'ExampleOne', component: () => import('../views/ExampleOne.vue') },
  { path: '/example2', name: 'ExampleTwo', component: () => import('../views/ExampleTwo.vue') },
  { path: '/example3', name: 'ExampleThree', component: () => import('../views/ExampleThree.vue') },
  { path: '/example4', name: 'ExampleFour', component: () => import('../views/ExampleFour.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router


