/**
 * Muthoni Home Finds — Smart Search & Recommendation Utilities
 */

// ─── Levenshtein distance (fuzzy spelling check) ───────────────────────────
export function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

/**
 * Given a user query and product list, return a "Did you mean?" suggestion
 * ONLY if there are zero results and the query resembles something in the catalog.
 */
export function findClosestMatch(query, products, maxDistance = 3) {
  if (!query || query.length < 2) return null

  const q = query.toLowerCase().trim()

  // Already matches something — no suggestion needed
  const hasMatch = products.some(p =>
    (p.title || '').toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)
  )
  if (hasMatch) return null

  // Build candidate words from the catalog
  const candidates = new Set()
  products.forEach(p => {
    ;(p.title || '').split(/\s+/).forEach(w => w.length > 2 && candidates.add(w.toLowerCase()))
    if (p.category) candidates.add(p.category.toLowerCase())
  })

  let bestWord = null, bestScore = Infinity
  candidates.forEach(word => {
    const score = levenshtein(q, word)
    if (score < bestScore) { bestScore = score; bestWord = word }
  })

  return bestWord && bestScore <= maxDistance && bestScore > 0 ? bestWord : null
}

// ─── Affinity store (persisted in localStorage) ───────────────────────────

const AFFINITY_KEY = 'mhf_affinity'

/** Returns the stored affinity map, e.g. { electronics: 5, kitchenware: 2 } */
export function getAffinity() {
  try {
    return JSON.parse(localStorage.getItem(AFFINITY_KEY) || '{}')
  } catch {
    return {}
  }
}

/** Increment affinity score for a category (called when user searches or clicks) */
export function boostAffinity(category) {
  if (!category) return
  const aff = getAffinity()
  const key = category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
  aff[key] = (aff[key] || 0) + 1
  localStorage.setItem(AFFINITY_KEY, JSON.stringify(aff))
}

// ─── Weighted / Personalised Shuffle ─────────────────────────────────────

/**
 * Shuffle products so that:
 * - New visitors (no affinity): fully random
 * - Returning visitors: ~40% of positions filled by their top-interest category,
 *   rest random — so it's mixed, never all one category
 */
export function personalizedShuffle(products) {
  if (!products.length) return []

  const affinity = getAffinity()
  const topCategory = Object.keys(affinity).sort((a, b) => affinity[b] - affinity[a])[0]

  // Separate into preferred vs rest
  const preferred = topCategory
    ? products.filter(p =>
        (p.category || '').toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === topCategory
      )
    : []
  const rest = products.filter(p => !preferred.includes(p))

  // Shuffle both independently
  const shuffleFY = arr => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const shuffledPreferred = shuffleFY(preferred)
  const shuffledRest      = shuffleFY(rest)

  // Interleave: insert 1 preferred item every 2-3 rest items (≈40% preferred)
  const result = []
  let pi = 0, ri = 0
  while (pi < shuffledPreferred.length || ri < shuffledRest.length) {
    // Insert up to 2 rest items
    for (let i = 0; i < 2 && ri < shuffledRest.length; i++) result.push(shuffledRest[ri++])
    // Insert 1 preferred item
    if (pi < shuffledPreferred.length) result.push(shuffledPreferred[pi++])
  }

  return result
}

// ─── Category → Placeholder image map ────────────────────────────────────

export const CATEGORY_PLACEHOLDERS = {
  electronics:      '/ph-electronics.png',
  kitchenware:      '/ph-kitchenware.svg',
  furniture:        '/ph-furniture.svg',
  beddings:         '/ph-beddings.svg',
  'curtains-carpets': '/ph-curtains-carpets.svg',
}

/** Returns the best placeholder for a product given its category */
export function getPlaceholder(product) {
  if (!product?.category) return null
  const key = product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
  return CATEGORY_PLACEHOLDERS[key] || null
}
