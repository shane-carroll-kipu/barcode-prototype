// Simple cross-tab scan message bus using BroadcastChannel with localStorage fallback

export function createScanBus(onScan) {
  const channelName = 'patient-scans'
  let bc = null

  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel(channelName)
    bc.onmessage = (e) => {
      if (typeof e.data === 'string') onScan(e.data)
    }
  } else {
    const onStorage = (e) => {
      if (e.key === channelName && e.newValue) {
        try {
          const { value } = JSON.parse(e.newValue)
          if (typeof value === 'string') onScan(value)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    bc = {
      postMessage(value) {
        try { localStorage.setItem(channelName, JSON.stringify({ value, ts: Date.now() })) } catch {}
      },
      close() { window.removeEventListener('storage', onStorage) }
    }
  }

  return {
    send(value) { bc && bc.postMessage(value) },
    destroy() { bc && bc.close && bc.close() }
  }
}


