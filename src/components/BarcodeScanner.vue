<template>
  <div class="scanner-container">
    <div v-if="!isScanning" class="scanner-placeholder">
      <button @click="startScanning" class="scan-button" :disabled="isLoading">
        <span v-if="isLoading">Loading...</span>
        <span v-else>📷 Start Camera Scan</span>
      </button>
    </div>
    
    <div v-else class="scanner-active">
      <div ref="scannerElement" id="scanner" class="scanner-video"></div>
      <div class="scanner-overlay">
        <div class="scan-frame"></div>
        <div class="scan-instructions">
          <p>Position DataMatrix barcode within the frame</p>
          <button @click="stopScanning" class="stop-button">Stop Scanning</button>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="clearError" class="retry-button">Try Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode'

const emit = defineEmits(['barcode-detected', 'error'])

const isScanning = ref(false)
const isLoading = ref(false)
const error = ref('')
const scannerElement = ref(null)

let html5QrcodeScanner = null

const startScanning = async () => {
  if (isScanning.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera not supported on this device')
    }
    
    // Set scanning to true to render the scanner element
    isScanning.value = true
    
    // Wait for DOM to be ready
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (!scannerElement.value) {
      throw new Error('Scanner element not found')
    }
    
    // Initialize Html5QrcodeScanner with DataMatrix support
    html5QrcodeScanner = new Html5QrcodeScanner(
      "scanner",
      {
        fps: 10,
        qrbox: null, // Disable built-in scanning frame
        aspectRatio: 1.0,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODE_93
        ]
      },
      false // verbose
    )
    
    // Start scanning
    html5QrcodeScanner.render(
      (decodedText, decodedResult) => {
        console.log('Barcode detected:', decodedText)
        emit('barcode-detected', decodedText)
        stopScanning()
      },
      (errorMessage) => {
        // This is expected - it means no barcode was found in this frame
        // We don't need to handle this as an error
      }
    )
    
  } catch (err) {
    console.error('Scanner initialization error:', err)
    error.value = err.message || 'Failed to initialize camera scanner'
    emit('error', error.value)
    // Reset scanning state on error
    isScanning.value = false
  } finally {
    isLoading.value = false
  }
}

const stopScanning = () => {
  if (html5QrcodeScanner) {
    try {
      html5QrcodeScanner.clear()
    } catch (err) {
      console.warn('Error stopping scanner:', err)
    }
    html5QrcodeScanner = null
  }
  
  isScanning.value = false
}

const clearError = () => {
  error.value = ''
}

onBeforeUnmount(() => {
  stopScanning()
})
</script>

<style scoped>
.scanner-container {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
}

.scanner-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
}

.scan-button {
  background: #646cff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.scan-button:hover:not(:disabled) {
  background: #5a5fcf;
}

.scan-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.scanner-active {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.scanner-video {
  width: 100%;
  height: 480px;
  background: #000;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.scan-frame {
  width: 300px;
  height: 200px;
  border: 3px solid #646cff;
  border-radius: 8px;
  background: transparent;
  position: relative;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
}

.scan-frame::before,
.scan-frame::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #646cff;
}

.scan-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scan-frame::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.scan-instructions {
  margin-top: 20px;
  text-align: center;
  pointer-events: auto;
}

.scan-instructions p {
  color: white;
  margin: 0 0 10px 0;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.stop-button {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.stop-button:hover {
  background: rgba(220, 38, 38, 0.9);
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
}

.error-message p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.retry-button:hover {
  background: #b91c1c;
}

/* Hide the default html5-qrcode scanner UI and fix alignment */
#scanner {
  position: relative;
  width: 100%;
  height: 480px;
  overflow: hidden;
  border-radius: 8px;
}

/* Hide the default html5-qrcode UI elements */
#scanner > div:first-child {
  display: none !important;
}

#scanner canvas {
  display: none !important;
}

#scanner video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}

/* Hide any scanning frame overlays from html5-qrcode */
#scanner div[style*="position: absolute"] {
  display: none !important;
}

/* Ensure the scanner container matches the video dimensions */
.scanner-video {
  width: 100%;
  height: 480px;
  background: #000;
  position: relative;
  overflow: hidden;
}
</style>