import type { ReactNode } from 'react'
import Icon from '../shared/Icon'
import { formatNumber } from '../../utils/dashboardStats'

type KpiCardProps = {
  tone: 'blue' | 'green' | 'orange' | 'violet'
  icon: string
  label: ReactNode
  value: number
  current?: number
  previous?: number
  series?: number[]
  onClick?: () => void
}

export default function KpiCard({
  tone,
  icon,
  label,
  value,
  current,
  previous,
  series,
  onClick,
}: KpiCardProps) {
  const trend =
    current !== undefined && previous !== undefined && previous > 0
      ? Math.round(((current - previous) / previous) * 100)
      : null

  let spark: { line: string; area: string } | null = null

  if (series && series.length > 1 && Math.max(...series) > 0) {
    const max = Math.max(...series)

    const pts = series.map(
      (v, i) =>
        [(i / (series.length - 1)) * 120, 38 - (v / max) * 30] as const,
    )

    const line = pts
      .map(
        ([x, y], i) =>
          `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(' ')

    spark = {
      line,
      area: `${line} L120,44 L0,44 Z`,
    }
  }

  const content = (
    <>
      <span className="kpi-icon">
        <Icon name={icon} />
      </span>

      <span className="kpi-body">
        <strong className="kpi-value">{formatNumber(value)}</strong>
        <span className="kpi-label">{label}</span>
      </span>

      {trend !== null && (
        <span className={`kpi-trend ${trend < 0 ? 'down' : ''}`}>
          {trend < 0 ? '↓' : '↑'} {trend > 0 ? '+' : ''}
          {trend}%
        </span>
      )}

      {spark && (
        <svg
          className="kpi-spark"
          viewBox="0 0 120 44"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={spark.area} className="kpi-spark-area" />
          <path d={spark.line} className="kpi-spark-line" />
        </svg>
      )}

      {onClick && (
        <span className="kpi-arrow">
          <Icon name="chevron" />
        </span>
      )}
    </>
  )

  return onClick ? (
    <button
      type="button"
      className={`kpi-card kpi-${tone} is-clickable`}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <div className={`kpi-card kpi-${tone}`}>{content}</div>
  )
}