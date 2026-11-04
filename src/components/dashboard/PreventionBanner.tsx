import Icon from '../shared/Icon'

function PreventionBanner() {
  return (
    <section className="prevention-banner">
      <span className="prevention-icon"><Icon name="shield" /></span>
      <strong>Prévenir le paludisme, protéger nos communautés</strong>
      <img className="prevention-art" src="/scdip-banner-art.jpg" alt="" aria-hidden="true" />
    </section>
  )
}

export default PreventionBanner
