const EVENT = 'netlink:connections-changed'

export function notifyConnectionsChanged() {
  window.dispatchEvent(new Event(EVENT))
}

export function onConnectionsChanged(callback) {
  window.addEventListener(EVENT, callback)
  return () => window.removeEventListener(EVENT, callback)
}
