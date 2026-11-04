import type { Fiche } from '../../types'
import Icon from '../shared/Icon'
import {
  getMonthlyStats,
  niceStep,
  formatNumber,
} from '../../utils/dashboardStats'

export default function EvolutionPanel({
  fiches,
}: {
  fiches: Fiche[]
}) {
  const stats = getMonthlyStats(fiches)
  const step = niceStep(Math.max(...stats.map((item) => item.total), 1))
  const top = step * 4

  const W = 640
  const H = 218
  const L = 62
  const R = 622
  const T = 12
  const B = 170

  const xAt = (i: number) =>
    L + (i / (stats.length - 1)) * (R - L)

  const yAt = (v: number) =>
    B - (v / top) * (B - T)

  const poly = (key: 'total' | 'validated') =>
    stats
      .map((item, i) => `${xAt(i)},${yAt(item[key])}`)
      .join(' ')

  const area = `${L},${B} ${poly('total')} ${R},${B}`

  return (
    <section className="panel evolution-panel">
      <div className="panel-title-row">
        <h2>
          <Icon name="bars" /> Évolution des fiches
        </h2>

        <div className="chart-legend">
          <span><i className="legend-blue" />Fiches saisies</span>
          <span><i className="legend-green" />Fiches validées</span>
        </div>
      </div>

      <div className="chart-wrap">
        <svg
          className="evolution-chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Évolution mensuelle des fiches saisies et validées parmi les fiches chargées"
        >
          <defs>
            <linearGradient
              id="evoFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0" stopColor="#0867e8" stopOpacity=".16" />
              <stop offset="1" stopColor="#0867e8" stopOpacity=".03" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((n) => (
            <g key={n}>
              <line
                x1={L}
                y1={yAt(n * step)}
                x2={R}
                y2={yAt(n * step)}
                className="chart-gridline"
              />
              <text
                x={L - 12}
                y={yAt(n * step) + 5}
                textAnchor="end"
                className="chart-label"
              >
                {formatNumber(n * step)}
              </text>
            </g>
          ))}

          {stats.map((item, i) => (
            <line
              key={item.label + i}
              x1={xAt(i)}
              y1={T}
              x2={xAt(i)}
              y2={B + 6}
              className="chart-gridline"
            />
          ))}

          <polygon points={area} fill="url(#evoFill)" />

          <polyline
            points={poly('validated')}
            className="chart-line chart-line-green"
          />

          <polyline
            points={poly('total')}
            className="chart-line chart-line-blue"
          />

          {stats.map((item, i) => (
            <g key={item.label + i}>
              <circle
                cx={xAt(i)}
                cy={yAt(item.validated)}
                r="5.5"
                className="chart-dot-green"
              />

              <circle
                cx={xAt(i)}
                cy={yAt(item.total)}
                r="5.5"
                className="chart-dot-blue"
              />

              <text
                x={xAt(i)}
                y={B + 30}
                textAnchor={
                  i === 0
                    ? 'start'
                    : i === stats.length - 1
                      ? 'end'
                      : 'middle'
                }
                dx={i === 0 ? -14 : 0}
                className="chart-label"
              >
                {item.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}