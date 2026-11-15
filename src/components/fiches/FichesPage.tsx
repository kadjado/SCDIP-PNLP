import { useState, type ComponentProps, type Dispatch, type SetStateAction } from 'react'
import Icon from '../shared/Icon'
import FicheTable from './FicheTable'
import FicheActions from './FicheActions'
import NewFicheForm from './NewFicheForm'
import type { Fiche } from '../../types'

type FicheTableProps = ComponentProps<typeof FicheTable>

type FichesPageProps = {
  token: string
  role: string
  fiches: FicheTableProps['fiches']
  loading: boolean
  busy: boolean
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  pageOffset: number
  setPageOffset: Dispatch<SetStateAction<number>>
  pageSize: number
  totalFiches: number
  showNewFiche: boolean
  setShowNewFiche: Dispatch<SetStateAction<boolean>>
  onAction: (
    fiche: Fiche,
    action: 'valider' | 'demander-correction' | 'traiter-correction',
  ) => void
  onRefresh: () => Promise<void>
  onCreated: () => Promise<void>
  onSessionInvalid: () => Promise<void>
  ficheIdToOpen: string | null
  onAutoOpenClose: () => void
}

function FichesPage({
  token,
  role,
  fiches,
  loading,
  busy,
  search,
  setSearch,
  pageOffset,
  setPageOffset,
  pageSize,
  totalFiches,
  showNewFiche,
  setShowNewFiche,
  onAction,
  onRefresh,
  onCreated,
  onSessionInvalid,
  ficheIdToOpen,
  onAutoOpenClose,
}: FichesPageProps) {
  const [ficheSelectionnee, setFicheSelectionnee] = useState<Fiche | null>(null)

  if (ficheSelectionnee) {
    return (
      <FicheActions
        ficheId={ficheSelectionnee.id}
        numeroFiche={ficheSelectionnee.numero_fiche || ''}
        token={token}
        role={role}
        onRefresh={onRefresh}
        onSessionInvalid={onSessionInvalid}
        autoOpen
        hideActions
        fiche={ficheSelectionnee}
        onAction={onAction}
        busy={busy}
        showWorkflowActions
        onAutoOpenClose={() => setFicheSelectionnee(null)}
        displayAsPage
      />
    )
  }

  if (ficheIdToOpen) {
    return (
      <FicheActions
        ficheId={ficheIdToOpen}
        numeroFiche=""
        token={token}
        role={role}
        onRefresh={onRefresh}
        onSessionInvalid={onSessionInvalid}
        autoOpen
        hideActions
        onAction={onAction}
        busy={busy}
        showWorkflowActions
        onAutoOpenClose={onAutoOpenClose}
        displayAsPage
      />
    )
  }

  return (
    <section className="panel list-panel fiches-panel">
      <div className="panel-heading list-heading">
        <div className="list-heading-main">
          <span className="list-icon"><Icon name="fiches" /></span>
          <div>
            <h2>Registre des fiches</h2>
            <p className="muted">
              {totalFiches} fiche(s) au total
              {totalFiches > 0
                ? ` — ${pageOffset + 1}–${Math.min(pageOffset + pageSize, totalFiches)} affichée(s)`
                : ''}
            </p>
          </div>
        </div>

        <div className="nf-header-actions">
          <label className="list-search">
            <Icon name="search" />
            <input
              className="search-input"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPageOffset(0)
              }}
              placeholder="Rechercher une fiche…"
              aria-label="Rechercher une fiche"
            />
          </label>

          {role === 'agent_fs' && (
            <button
              type="button"
              className="nf-plus-button"
              aria-label="Créer une nouvelle fiche"
              title="Nouvelle fiche paludisme"
              onClick={() => setShowNewFiche((value) => !value)}
            >
              {showNewFiche ? '×' : '+'}
            </button>
          )}
        </div>
      </div>

      {showNewFiche && role === 'agent_fs' && (
        <NewFicheForm
          token={token}
          onCancel={() => setShowNewFiche(false)}
          onCreated={onCreated}
        />
      )}

      <FicheTable
        fiches={fiches}
        loading={loading}
        role={role}
        busy={busy}
        token={token}
        onRefresh={onRefresh}
        onSessionInvalid={onSessionInvalid}
        onAction={onAction}
        onSelectFiche={setFicheSelectionnee}
      />

      <div className="table-foot pagination-controls">
        <span>
          Page {Math.floor(pageOffset / pageSize) + 1} sur{' '}
          {Math.max(1, Math.ceil(totalFiches / pageSize))}
        </span>

        <div>
          <button
            type="button"
            className="secondary-button"
            disabled={loading || pageOffset === 0}
            onClick={() =>
              setPageOffset((offset) => Math.max(0, offset - pageSize))
            }
          >
            Précédent
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={loading || pageOffset + pageSize >= totalFiches}
            onClick={() => setPageOffset((offset) => offset + pageSize)}
          >
            Suivant
          </button>
        </div>
      </div>
    </section>
  )
}

export default FichesPage
