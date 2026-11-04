import type { Dispatch, FormEvent, SetStateAction } from 'react'
import LoginIcon from './LoginIcon'

type LoginPageProps = {
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  password: string
  setPassword: Dispatch<SetStateAction<string>>
  showPassword: boolean
  setShowPassword: Dispatch<SetStateAction<boolean>>
  loginError: string
  error: string
  busy: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function LoginPage({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loginError,
  error,
  busy,
  onSubmit,
}: LoginPageProps) {
  return (
    <main className="lg-page">
      <section className="lg-left">
        <div className="lg-stage">
          <div className="lg-hero">
            <svg className="lg-hero-bg" viewBox="0 0 880 799" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="lgHeroGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#04386f" />
                  <stop offset=".36" stopColor="#08558a" />
                  <stop offset=".6" stopColor="#177c78" />
                  <stop offset=".8" stopColor="#4aa35a" />
                  <stop offset="1" stopColor="#a9d6a0" />
                </linearGradient>
              </defs>
              <path d="M0,3 C180,40 360,62 520,46 C650,34 770,18 880,8 L880,799 L0,799 Z" fill="url(#lgHeroGrad)" />
            </svg>
            <img className="lg-hero-art" src="/scdip-hero-art.jpg" alt="" aria-hidden="true" />
            <svg className="lg-hero-sw" viewBox="0 0 880 799" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="lgLow" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="720" y2="0">
                  <stop offset="0" stopColor="#063b72" stopOpacity="0" />
                  <stop offset=".5" stopColor="#4f93c8" stopOpacity=".85" />
                  <stop offset="1" stopColor="#d6e8f1" />
                </linearGradient>
                <linearGradient id="lgBlue" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#0a4a98" />
                  <stop offset="1" stopColor="#2386cc" />
                </linearGradient>
                <linearGradient id="lgGreen" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#14a04b" />
                  <stop offset="1" stopColor="#62c872" />
                </linearGradient>
              </defs>
              <path d="M120,799 C320,745 560,735 880,520 L880,799 Z" fill="url(#lgLow)" />
              <path d="M250,640 C520,640 760,520 880,380 L880,445 C770,565 530,690 300,690 Z" fill="url(#lgBlue)" />
              <path d="M300,694 C540,692 780,572 880,450" fill="none" stroke="#fff" strokeWidth="4" />
              <path d="M330,700 C560,700 780,620 880,500 L880,560 C790,660 560,740 360,738 Z" fill="url(#lgGreen)" />
            </svg>
          </div>
          <img className="lg-emblem" src="/scdip-embleme.png" alt="Emblème SCDIP-PNLP" />
          <h1 className="lg-title">SCDIP<span>-PNLP</span></h1>
          <p className="lg-sub">Système de collecte des données individuelles<br />du paludisme</p>
          <div className="lg-prog">PROGRAMME NATIONAL DE LUTTE CONTRE LE PALUDISME</div>
          <div className="lg-togo"><span /><em>TOGO</em><span /></div>
          <h2 className="lg-h2">Ensemble contre<br />le <span>paludisme</span></h2>
          <p className="lg-lead">Des données fiables pour une meilleure surveillance et une action plus efficace.</p>
          <ul className="lg-features">
            <li><span className="lg-feature-icon"><LoginIcon name="chart" /></span><div><strong>Collecte des données</strong><small>Rapide et sécurisée</small></div></li>
            <li><span className="lg-feature-icon lg-green"><LoginIcon name="shieldCheck" /></span><div><strong>Suivi des cas</strong><small>À tous les niveaux</small></div></li>
            <li><span className="lg-feature-icon"><LoginIcon name="people" /></span><div><strong>Meilleure coordination</strong><small>Entre les acteurs de santé</small></div></li>
            <li><span className="lg-feature-icon lg-green"><LoginIcon name="pin" /></span><div><strong>Un Togo sans paludisme</strong><small>C’est possible !</small></div></li>
          </ul>
          <img className="lg-flag" src="/scdip-drapeau.png" alt="" aria-hidden="true" />
          <p className="lg-slogan">Un Togo sans paludisme, c’est possible !</p>
        </div>
      </section>
      <section className="lg-right">
        <div className="lg-rstage">
          <LoginIcon name="hexagons" />
          <div className="lg-hex-b"><LoginIcon name="hexagons" /></div>
          <form className="lg-card" onSubmit={onSubmit}>
            <img className="lg-card-logo" src="/scdip-embleme.png" alt="Emblème SCDIP-PNLP" />
            <h2>Bienvenue</h2>
            <p className="lg-card-sub">Connectez-vous à votre compte</p>
            <div className="lg-field">
              <span className="lg-field-icon"><LoginIcon name="user" /></span>
              <input id="email" type="text" autoComplete="username" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="Identifiant (e-mail ou nom d’utilisateur)" aria-label="Identifiant" required />
            </div>
            <div className="lg-field">
              <span className="lg-field-icon"><LoginIcon name="lock" /></span>
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" aria-label="Mot de passe" required />
              <button type="button" className="lg-eye" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword((value) => !value)}>
                <LoginIcon name={showPassword ? 'eye' : 'eyeOff'} />
              </button>
            </div>
            {loginError && <div className="alert error">{loginError}</div>}
            {error && <div className="alert error">{error}</div>}
            <button type="submit" className="lg-submit" disabled={busy}>
              <LoginIcon name="login" /> {busy ? 'Connexion en cours…' : 'Se connecter'}
            </button>
            <div className="lg-options">
              <label className="lg-remember"><input type="checkbox" /> Se souvenir de moi</label>
              <a href="#" className="lg-forgot" onClick={(e) => { e.preventDefault(); window.alert('Veuillez contacter l’administrateur du système pour réinitialiser votre mot de passe.') }}>Mot de passe oublié ?</a>
            </div>
            <div className="lg-card-foot">
              <LoginIcon name="shieldCheck" />
              <div><strong>SCDIP-PNLP</strong><span>Programme National de Lutte contre le Paludisme</span><span>Togo</span></div>
            </div>
          </form>
          <div className="lg-bottom">
            <span><LoginIcon name="shield" /> Données fiables</span>
            <span><LoginIcon name="people" /> Communautés en bonne santé</span>
            <span><LoginIcon name="leaf" /> Un Togo sans paludisme</span>
          </div>
        </div>
      </section>
      <div className="lg-stripe" />
    </main>
  )
}

export default LoginPage
