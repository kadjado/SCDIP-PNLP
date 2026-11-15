import type { ComponentProps, Dispatch, SetStateAction } from 'react'
import Icon from '../shared/Icon'
import FicheTable from './FicheTable'
import NewFicheForm from './NewFicheForm'

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
  onAction: FicheTableProps['onAction']
  onRefresh: FicheTableProps['onRefresh']
  onCreated: () => Promise<void>
  onSessionInvalid: () => Promise<void>
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
  onSessionInvalid
}: FichesPageProps) {
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
        onAction={onAction}
        token={token}
        onRefresh={onRefresh}
        onSessionInvalid={onSessionInvalid}

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

