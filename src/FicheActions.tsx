import { useState } from 'react'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

type FicheActionsProps = {
  ficheId: string
  numeroFiche: string
  token: string
  role: string
  onRefresh: () => Promise<void>
}

type FicheDetail = Record<string, unknown>

const labels: Record<string, string> = {
  numero_fiche: 'Numéro de fiche',
  date_consultation: 'Date de consultation',
  date_saisie: 'Date de saisie',
  num_oc: 'Numéro OC',
  mois: 'Mois',
  age: 'Âge',
  sexe: 'Sexe',
  grossesse: 'Grossesse',
  tpi1: 'TPI1',
  tpi2: 'TPI2',
  type_consultation: 'Type de consultation',
  fievre: 'Fièvre',
  motif_consultation: 'Motif de consultation',
  ge_realisee: 'GE réalisée',
  type_ge: 'Type de GE',
  charge_sigep: 'Charge SIGEP',
  tdr_realise: 'TDR réalisé',
  type_tdr_id: 'Type de TDR',
  resultat_tdr: 'Résultat TDR',
  numero_laboratoire: 'Numéro de laboratoire',
  diagnostic: 'Diagnostic',
  asaq: 'ASAQ',
  arlm: 'ARLM',
  quinine_comprime: 'Quinine comprimé',
  quinine_injectable: 'Quinine injectable',
  artesunate_injectable: 'Artésunate injectable',
  autre_traitement: 'Autre traitement',
  hospitalise: 'Hospitalisé',
  date_sortie: 'Date de sortie',
  issue_hospitalisation: 'Issue de l’hospitalisation',
  validation_confirmee: 'Validation confirmée',
  version: 'Version',
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Non renseigné'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function FicheActions({
  ficheId,
  numeroFiche,
  token,
  role,
  onRefresh,
}: FicheActionsProps) {
  const [detail, setDetail] = useState<FicheDetail | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function consulter() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API}/api/v1/fiches/${ficheId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(typeof body.detail === 'string' ? body.detail : `Erreur HTTP ${response.status}`)
      }
      setDetail(body as FicheDetail)
      setShowDetail(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de consulter la fiche.')
    } finally {
      setLoading(false)
    }
  }

  async function supprimer() {
    const confirme = window.confirm(
      `Supprimer la fiche ${numeroFiche || ficheId} ? Cette suppression sera enregistrée dans l’historique.`,
    )
    if (!confirme) return

    setDeleting(true)
    setError('')
    try {
      const response = await fetch(`${API}/api/v1/fiches/${ficheId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        let message = `Erreur HTTP ${response.status}`
        try {
          const body = await response.json()
          if (typeof body.detail === 'string') message = body.detail
        } catch {
          // La réponse ne contient pas de JSON.
        }
        throw new Error(message)
      }

      await onRefresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de supprimer la fiche.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="fiche-actions">
        <button type="button" className="secondary-button" disabled={loading || deleting} onClick={() => void consulter()}>
          {loading ? 'Chargement…' : 'Consulter'}
        </button>
        {role === 'administrateur_national' && (
          <button type="button" className="danger-button" disabled={loading || deleting} onClick={() => void supprimer()}>
            {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
        )}
      </div>

      {error && <p className="alert error">{error}</p>}

      {showDetail && detail && (
        <div className="user-modal-backdrop" onClick={() => setShowDetail(false)}>
          <section
            className="user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fiche-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <h2 id="fiche-detail-title">Fiche {numeroFiche || ficheId}</h2>
                <p className="muted">Consultation des données enregistrées</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => setShowDetail(false)}>
                Fermer
              </button>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="user-form-grid">
              {Object.entries(detail)
                .filter(([key]) => !['id', 'agent_id', 'validee_par_id', 'supprime_le'].includes(key))
                .map(([key, value]) => (
                  <label className="nf-field" key={key}>
                    <span>{labels[key] || key.replaceAll('_', ' ')}</span>
                    <input readOnly value={displayValue(value)} />
                  </label>
                ))}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
