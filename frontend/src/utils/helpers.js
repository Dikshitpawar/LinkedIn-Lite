export function timeAgo(date) {
  const now  = Date.now()
  const d    = new Date(date).getTime()
  const diff = Math.floor((now - d) / 1000)

  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  '#5c6ef8','#9b5de5','#ff5f7e','#00e5c3',
  '#ffb340','#22c55e','#38bdf8','#fb923c',
]
export function avatarColor(name = '') {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function parseSkills(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export function buildFormData(obj) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) fd.append(k, v)
  }
  return fd
}

export function required(val, label) {
  if (!String(val ?? '').trim()) return `${label} is required`
  return null
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
