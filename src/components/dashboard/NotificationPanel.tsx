import Icon from '../shared/Icon'
import type { Fiche } from '../../types'

function formatNotificationDate(raw?: string) {
  if (!raw) return ''
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  const date = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed)
  if (!raw.includes('T')) return date
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(parsed)
  return `À ${time} - ${date}`
}

function NotificationPanel({ unread, pushEnabled, fiches, onOpenMailbox }: { unread: number; pushEnabled: boolean; fiches: Fiche[]; onOpenMailbox: () => void }) {
  const latest = fiches.reduce<Fiche | null>((best, fiche) => {
    const stamp = new Date(fiche.date_saisie || fiche.date_consultation || '').getTime()
    const bestStamp = best ? new Date(best.date_saisie || best.date_consultation || '').getTime() : -Infinity
    return !Number.isNaN(stamp) && stamp > bestStamp ? fiche : best
  }, null)

  return (
    <section className="panel notification-panel">
      <div className="panel-title-row">
        <h2><Icon name="bell" /> Dernières notifications</h2>
        <button type="button" className="text-button" onClick={onOpenMailbox}>Voir toutes <Icon name="arrow" /></button>
      </div>
      <div className="notif-list">
        <div className="notif-row">
          <span className="notif-icon notif-green"><Icon name="mailbox" /></span>
          <span className="notif-text"><strong>{unread > 0 ? `${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}` : 'Messagerie à jour'}</strong><small>Messagerie SCDIP-PNLP</small></span>
          <span className={`notif-pill ${unread > 0 ? 'pill-warn' : ''}`}>{unread > 0 ? 'À lire' : 'À jour'}</span>
        </div>
        <div className="notif-row">
          <span className="notif-icon notif-blue"><Icon name="bell" /></span>
          <span className="notif-text"><strong>Notifications Push {pushEnabled ? 'activées' : 'non activées'}</strong><small>Sur cet appareil</small></span>
          <span className={`notif-pill ${pushEnabled ? '' : 'pill-off'}`}>{pushEnabled ? 'Actif' : 'Inactif'}</span>
        </div>
        <div className="notif-row">
          <span className="notif-icon notif-orange"><Icon name="info" /></span>
          <span className="notif-text"><strong>{latest ? 'Nouvelle fiche soumise' : 'Aucune fiche récente'}</strong><small>{latest ? `Fiche ${latest.numero_fiche}` : 'Les fiches apparaîtront ici'}</small></span>
          {latest && <span className="notif-date">{formatNotificationDate(latest.date_saisie || latest.date_consultation)}</span>}
        </div>
      </div>
    </section>
  )
}

export default NotificationPanel
