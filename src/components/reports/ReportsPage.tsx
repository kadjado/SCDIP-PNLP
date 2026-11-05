import './ReportsPage.css'
export type RapportStatistiques = {
  filtres: {
    date_debut: string | null
    date_fin: string | null
    periodicite: 'jour' | 'semaine' | 'mois' | 'annee'
  }
  indicateurs: {
    total_fiches: number
    paludisme_simple: number
    paludisme_grave: number
    non_confirmes: number
    autres_diagnostics: number
    cas_confirmes: number
    hospitalisations: number
    tdr_realises: number
    guerisons_hospitalisation: number
    deces_hospitalisation: number
    issues_hospitalisation_cloturees: number
    taux_guerison_issues_cloturees: number
    taux_deces_issues_cloturees: number
  }
  repartitions: {
    diagnostics: Record<string, number>
    issues_hospitalisation: Record<string, number>
    grossesses: Record<string, number>
    resultats_tdr: Record<string, number>
    sexes: Record<string, number>
  }
  evolution: Array<{
    periode: string
    total: number
  }>
}

import { useCallback, useEffect, useState } from 'react'
import { api } from '../../services/api'

type Periodicite = RapportStatistiques['filtres']['periodicite']

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

function formatPeriod(value: string, periodicite: Periodicite): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  if (periodicite === 'annee') {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
    }).format(date)
  }

  if (periodicite === 'jour') {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
    }).format(date)
  }

  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function DistributionPanel({
  title,
  data,
}: {
  title: string
  data: Record<string, number>
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, value]) => sum + value, 0)
  const max = Math.max(...entries.map(([, value]) => value), 1)

  return (
    <section className="panel report-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p className="muted">Répartition des fiches enregistrées</p>
        </div>
        <strong className="report-total">{formatNumber(total)}</strong>
      </div>

      {entries.length === 0 ? (
        <div className="report-empty">Aucune donnée disponible.</div>
      ) : (
        <div className="report-distribution">
          {entries.map(([label, value]) => (
            <div className="report-distribution-item" key={label}>
              <div className="report-distribution-label">
                <span>{label}</span>
                <strong>{formatNumber(value)}</strong>
              </div>
              <div className="report-track">
                <div
                  className="report-bar"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
              <small>
                {total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'} %
              </small>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ReportsPage({
  token,
}: {
  token: string
}) {
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [periodicite, setPeriodicite] = useState<Periodicite>('mois')

  const [rapport, setRapport] = useState<RapportStatistiques | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const chargerRapport = useCallback(async () => {
    if (dateDebut && dateFin && dateDebut > dateFin) {
      setError('La date de début doit précéder la date de fin.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.set('periodicite', periodicite)

      if (dateDebut) params.set('date_debut', dateDebut)
      if (dateFin) params.set('date_fin', dateFin)

      const resultat = await api<RapportStatistiques>(
        `/api/v1/rapports/statistiques?${params.toString()}`,
        token,
      )

      setRapport(resultat)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les statistiques.',
      )
    } finally {
      setLoading(false)
    }
  }, [token, dateDebut, dateFin, periodicite])

  useEffect(() => {
    void chargerRapport()
  }, [chargerRapport])

  const indicateurs = rapport?.indicateurs

  const kpis = [
    {
      label: 'Total des fiches',
      value: indicateurs?.total_fiches ?? 0,
      detail: 'Toutes les fiches accessibles',
      tone: 'blue',
    },
    {
      label: 'Paludisme simple',
      value: indicateurs?.paludisme_simple ?? 0,
      detail: 'Diagnostics enregistrés',
      tone: 'green',
    },
    {
      label: 'Paludisme grave',
      value: indicateurs?.paludisme_grave ?? 0,
      detail: 'Diagnostics enregistrés',
      tone: 'orange',
    },
    {
      label: 'Cas confirmés',
      value: indicateurs?.cas_confirmes ?? 0,
      detail: 'Paludisme simple et grave',
      tone: 'violet',
    },
    {
      label: 'Hospitalisations',
      value: indicateurs?.hospitalisations ?? 0,
      detail: 'Patients hospitalisés',
      tone: 'blue',
    },
    {
      label: 'TDR réalisés',
      value: indicateurs?.tdr_realises ?? 0,
      detail: 'Examens déclarés réalisés',
      tone: 'green',
    },
  ]

  const maxEvolution = Math.max(
    ...(rapport?.evolution.map((item) => item.total) ?? [0]),
    1,
  )

  return (
    <div className="reports-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ANALYSE ÉPIDÉMIOLOGIQUE</span>
          <h1>Centre de rapports</h1>
          <p className="muted">
            Consultez les indicateurs et l'évolution des données du paludisme.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => void chargerRapport()}
          disabled={loading}
        >
          {loading ? 'Actualisation…' : '↻ Actualiser'}
        </button>
      </div>

      <section className="panel report-filters">
        <div className="report-filter-heading">
          <div>
            <h2>Filtres du rapport</h2>
            <p className="muted">Sélectionnez la période à analyser.</p>
          </div>
        </div>

        <form
          className="report-filter-form"
          onSubmit={(event) => {
            event.preventDefault()
            void chargerRapport()
          }}
        >
          <label className="report-field">
            <span>Date de début</span>
            <input
              type="date"
              value={dateDebut}
              onChange={(event) => setDateDebut(event.target.value)}
            />
          </label>

          <label className="report-field">
            <span>Date de fin</span>
            <input
              type="date"
              value={dateFin}
              onChange={(event) => setDateFin(event.target.value)}
            />
          </label>

          <label className="report-field">
            <span>Périodicité</span>
            <select
              value={periodicite}
              onChange={(event) =>
                setPeriodicite(event.target.value as Periodicite)
              }
            >
              <option value="jour">Par jour</option>
              <option value="semaine">Par semaine</option>
              <option value="mois">Par mois</option>
              <option value="annee">Par année</option>
            </select>
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            Appliquer
          </button>
        </form>
      </section>

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {loading && !rapport ? (
        <div className="panel report-loading">
          Chargement des statistiques…
        </div>
      ) : rapport ? (
        <>
          <div className="report-section-title">
            <div>
              <h2>Indicateurs clés</h2>
              <p className="muted">
                Synthèse des données sur la période sélectionnée.
              </p>
            </div>
          </div>

          <div className="report-kpi-grid">
            {kpis.map((item) => (
              <article className="report-kpi-card" key={item.label}>
                <div className={`report-kpi-icon ${item.tone}`}>▦</div>
                <span>{item.label}</span>
                <strong>{formatNumber(item.value)}</strong>
                <small>{item.detail}</small>
              </article>
            ))}
          </div>

          <div className="report-section-title">
            <div>
              <h2>Analyses et répartitions</h2>
              <p className="muted">
                Distribution des données enregistrées.
              </p>
            </div>
          </div>

          <div className="report-two-columns">
            <DistributionPanel
              title="Diagnostics"
              data={rapport.repartitions.diagnostics}
            />
            <DistributionPanel
              title="Résultats des TDR"
              data={rapport.repartitions.resultats_tdr}
            />
            <DistributionPanel
              title="Issues d'hospitalisation"
              data={rapport.repartitions.issues_hospitalisation}
            />
            <DistributionPanel
              title="Répartition par sexe"
              data={rapport.repartitions.sexes}
            />
            <DistributionPanel
              title="Grossesses"
              data={rapport.repartitions.grossesses}
            />

            <section className="panel report-panel">
              <div className="panel-heading">
                <div>
                  <h2>Issues hospitalières</h2>
                  <p className="muted">Résultats des hospitalisations clôturées</p>
                </div>
              </div>

              <div className="report-outcomes">
                <div>
                  <span>Guérisons</span>
                  <strong>
                    {formatNumber(indicateurs?.guerisons_hospitalisation ?? 0)}
                  </strong>
                  <small>
                    {indicateurs?.taux_guerison_issues_cloturees ?? 0} % des
                    issues clôturées
                  </small>
                </div>
                <div>
                  <span>Décès hospitaliers</span>
                  <strong>
                    {formatNumber(indicateurs?.deces_hospitalisation ?? 0)}
                  </strong>
                  <small>
                    {indicateurs?.taux_deces_issues_cloturees ?? 0} % des
                    issues clôturées
                  </small>
                </div>
                <div>
                  <span>Issues clôturées</span>
                  <strong>
                    {formatNumber(
                      indicateurs?.issues_hospitalisation_cloturees ?? 0,
                    )}
                  </strong>
                  <small>Dénominateur des deux taux</small>
                </div>
              </div>
            </section>
          </div>

          <section className="panel report-panel report-evolution">
            <div className="panel-heading">
              <div>
                <h2>Évolution des consultations</h2>
                <p className="muted">
                  Nombre de fiches par {periodicite}.
                </p>
              </div>
              <strong className="report-total">
                {rapport.evolution.length} périodes
              </strong>
            </div>

            {rapport.evolution.length === 0 ? (
              <div className="report-empty">
                Aucune donnée pour cette période.
              </div>
            ) : (
              <div className="report-chart">
                {rapport.evolution.map((item) => (
                  <div className="report-chart-column" key={item.periode}>
                    <strong>{formatNumber(item.total)}</strong>
                    <div className="report-chart-track">
                      <div
                        className="report-chart-bar"
                        style={{
                          height: `${Math.max(
                            (item.total / maxEvolution) * 100,
                            2,
                          )}%`,
                        }}
                      />
                    </div>
                    <span>{formatPeriod(item.periode, periodicite)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="report-disclaimer">
            Les taux de guérison et de décès sont calculés uniquement sur les
            issues d'hospitalisation clôturées. Ils ne représentent pas des
            taux globaux de guérison ou de mortalité de l'ensemble des cas.
          </p>
        </>
      ) : (
        !error && (
          <div className="panel report-empty">
            Aucune statistique disponible.
          </div>
        )
      )}
    </div>
  )
}

export default ReportsPage
