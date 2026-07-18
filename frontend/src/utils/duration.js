export function parseDurationMs(str, fallbackMs = 15 * 60 * 1000) {
  if (!str) return fallbackMs
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(String(str).trim())
  if (!match) return fallbackMs
  const value = Number(match[1])
  const unit = match[2].toLowerCase()
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }
  return value * multipliers[unit]
}
