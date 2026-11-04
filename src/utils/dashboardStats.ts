import type { Fiche } from '../types'

export function getMonthlyStats(fiches: Fiche[]) {
  const now = new Date()

  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (3 - index),
      1,
    )

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`

    const items = fiches.filter((fiche) => {
      const rawDate = fiche.date_consultation || fiche.date_saisie
      if (!rawDate) return false

      const parsed = new Date(rawDate)

      return (
        !Number.isNaN(parsed.getTime()) &&
        `${parsed.getFullYear()}-${String(
          parsed.getMonth() + 1,
        ).padStart(2, '0')}` === key
      )
    })

    const month = new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
    }).format(date)

    return {
      label: month.charAt(0).toUpperCase() + month.slice(1),
      total: items.length,
      validated: items.filter((fiche) => fiche.validation_confirmee).length,
    }
  })
}

export const formatNumber = (value: number) =>
  value.toLocaleString('fr-FR')

export function niceStep(max: number) {
  const raw = Math.max(1, max) / 4
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const base = raw / pow

  const nice =
    base <= 1 ? 1 :
    base <= 2 ? 2 :
    base <= 2.5 ? 2.5 :
    base <= 5 ? 5 : 10

  return Math.max(1, Math.ceil(nice * pow))
}