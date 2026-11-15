
import FicheActions from './FicheActions'
import EmptyState from '../shared/EmptyState'
import type { Fiche } from '../../types'

type FicheTableProps = {
  fiches: Fiche[]
  loading: boolean
  role: string
  busy: boolean
  token: string
  onRefresh: () => Promise<void>
  onSessionInvalid: () => Promise<void>
  onAction: (
    fiche: Fiche,
    action: 'valider' | 'demander-correction' | 'traiter-correction',
  ) => void
}

function FicheTable({
  fiches,
  loading,
  role,
  busy,
  onAction,
  token,
  onRefresh,
  onSessionInvalid,
}: FicheTableProps) {
  if (loading && fiches.length === 0) {
    return <EmptyState text="Chargement des fiches..." />
  }

  if (!fiches.length) {
    return <EmptyState text="Aucune fiche disponible dans les résultats chargés." />
  }

  const isSupervisor = role === 'superviseur'

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Numéro de fiche</th>
            <th>Date consultation</th>
            <th>Âge</th>
            <th>Sexe</th>
            <th>Diagnostic</th>
            <th>Validation</th>
            <th>Gestion</th>
            {isSupervisor && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {fiches.map((fiche) => (
            <tr key={fiche.id}>
              <td>
                <strong>{fiche.numero_fiche || fiche.id.slice(0, 8)}</strong>
              </td>

              <td>
                {fiche.date_consultation
                  ? new Date(fiche.date_consultation).toLocaleDateString('fr-FR')
                  : '—'}
              </td>

              <td>{fiche.age} ans</td>

              <td>
                {fiche.sexe === 'M'
                  ? 'Masculin'
                  : fiche.sexe === 'F'
                    ? 'Féminin'
                    : fiche.sexe}
              </td>

              <td>
                <span className="diagnostic">
                  {fiche.diagnostic || 'Non renseigné'}
                </span>
              </td>

              <td>
                <span
                  className={`status ${
                    fiche.validation_confirmee ? 'confirmed' : 'pending'
                  }`}
                >
                  {fiche.validation_confirmee ? 'Confirmée' : 'À confirmer'}
                </span>
              </td>

              <td>
                <FicheActions
                  ficheId={fiche.id}
                  numeroFiche={fiche.numero_fiche}
                  token={token}
                  role={role}
                  onRefresh={onRefresh}
                  onSessionInvalid={onSessionInvalid}
                />
              </td>

              {isSupervisor && (
                <td>
                  <div className="fiche-actions">
                    {!fiche.validation_confirmee && (
                      <>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => onAction(fiche, 'valider')}
                        >
                          Valider
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => onAction(fiche, 'demander-correction')}
                        >
                          Demander correction
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => onAction(fiche, 'traiter-correction')}
                        >
                          Traiter réponse
                        </button>
                      </>
                    )}

                    {fiche.validation_confirmee && (
                      <span className="status confirmed">Déjà validée</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FicheTable
