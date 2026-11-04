import Icon from '../shared/Icon'

function DashboardHero({ onSeeDashboard }: { onSeeDashboard: () => void }) {
  return (
    <section className="dashboard-hero">
      <img className="hero-art" src="/scdip-hero-art.jpg" alt="" aria-hidden="true" />
      <div className="hero-copy">
        <h2>Bienvenue sur <span>SCDIP-PNLP</span></h2>
        <p>Ensemble pour une meilleure surveillance<br className="desktop-break" /> du paludisme au Togo</p>
        <button type="button" className="hero-button" onClick={onSeeDashboard}>
          <Icon name="bars" /> Voir le tableau de bord <Icon name="arrow" />
        </button>
      </div>
    </section>
  )
}

export default DashboardHero
