/** One encouraging line a day. Calm, specific, never comparing with anyone. */
const LINES = [
  'Her gün küçük bir adım, büyük bir yolculuk demek.',
  'Hata yapmak öğrenmenin bir parçası. Denemeye devam!',
  'Bugün öğrendiğin bir kelime, yarın kuracağın bir cümle olacak.',
  'Acele etme; anlayarak gitmek en hızlı yol.',
  'Merak ettiğin her şey yeni bir kapı açar.',
  'Dün bilmediğin bir şeyi bugün biliyorsun. Bu harika!',
  'Kendi hızında ilerlemek tamamen normal.',
]

/** The same line all day, a different one tomorrow. */
export function lineOfTheDay(date = new Date()): string {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return LINES[day % LINES.length]!
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'Merhaba'
  return 'İyi akşamlar'
}
