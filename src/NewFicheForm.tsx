import { useEffect, useState } from 'react'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

type TypeTDR = { id: number; code: string; libelle: string }
type Contexte = {
  formation_sanitaire: { id: number; code: string; libelle: string; type_fs: string }
  types_tdr: TypeTDR[]
}

type Props = {
  token: string
  onCancel: () => void
  onCreated: () => Promise<void>
}

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') message = body.detail
      else if (Array.isArray(body.detail)) {
        message = body.detail.map((item: { msg?: string }) => item.msg || '').filter(Boolean).join(' ')
      }
    } catch {
      // Conserver le message HTTP par défaut.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

function localDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function yesNo(name: string, label: string, initial = 'Non') {
  return (
    <label className="nf-field">
      <span>{label}</span>
      <select name={name} defaultValue={initial}>
        <option value="Oui">Oui</option>
        <option value="Non">Non</option>
      </select>
    </label>
  )
}

export default function NewFicheForm({ token, onCancel, onCreated }: Props) {
  const [context, setContext] = useState<Contexte | null>(null)
  const [loadingContext, setLoadingContext] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ge, setGe] = useState(false)
  const [tdr, setTdr] = useState(false)
  const [tpi1, setTpi1] = useState(false)
  const [hospitalise, setHospitalise] = useState(false)
  const [sexe, setSexe] = useState('F')
  const [age, setAge] = useState('')

  useEffect(() => {
    let active = true
    request<Contexte>('/api/v1/fiches/contexte', token)
      .then((data) => { if (active) setContext(data) })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Impossible de charger le contexte.')
      })
      .finally(() => { if (active) setLoadingContext(false) })
    return () => { active = false }
  }, [token])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!context) {
      setError('Le contexte de la formation sanitaire est indisponible.')
      return
    }

    const form = new FormData(event.currentTarget)
    const dateConsultation = String(form.get('date_consultation') || '')
    const dateSortie = String(form.get('date_sortie') || '')
    const issue = String(form.get('issue_hospitalisation') || '')
    const numOC = String(form.get('num_oc') || '').trim()
    const parsedAge = Number(age)

    if (!numOC) {
      setError('Le numéro OC est obligatoire.')
      return
    }
    if (!dateConsultation || dateConsultation > localDate()) {
      setError('La date de consultation doit être valide et ne pas être dans le futur.')
      return
    }
    if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      setError('L’âge doit être un nombre entier compris entre 0 et 120.')
      return
    }
    if (hospitalise && dateSortie && dateSortie < dateConsultation) {
      setError('La date de sortie ne peut pas précéder la consultation.')
      return
    }
    if (hospitalise && issue === 'Décédé' && !dateSortie) {
      setError('La date de sortie est obligatoire lorsque l’issue est « Décédé ».')
      return
    }

    const val = (key: string) => String(form.get(key) || '').trim()
    const bool = (key: string) => val(key) === 'Oui'

    const payload = {
      formation_sanitaire_id: context.formation_sanitaire.id,
      date_consultation: dateConsultation,
      num_oc: numOC,
      mois: Number(dateConsultation.slice(5, 7)),
      age: parsedAge,
      sexe,
      grossesse: sexe === 'F' && parsedAge >= 15 && parsedAge <= 49 ? (val('grossesse') || null) : null,
      tpi1,
      tpi2: tpi1 ? val('tpi2') : 'Non applicable',
      type_consultation: val('type_consultation'),
      fievre: bool('fievre'),
      motif_consultation: val('motif_consultation') || null,
      ge_realisee: ge,
      type_ge: ge ? (val('type_ge') || null) : null,
      charge_sigep: ge ? (val('charge_sigep') || null) : null,
      tdr_realise: tdr,
      type_tdr_id: tdr && val('type_tdr_id') ? Number(val('type_tdr_id')) : null,
      resultat_tdr: tdr ? (val('resultat_tdr') || null) : null,
      numero_laboratoire: tdr ? (val('numero_laboratoire') || null) : null,
      diagnostic: val('diagnostic'),
      asaq: bool('asaq'),
      arlm: bool('arlm'),
      quinine_comprime: bool('quinine_comprime'),
      quinine_injectable: bool('quinine_injectable'),
      artesunate_injectable: bool('artesunate_injectable'),
      autre_traitement: val('autre_traitement') || null,
      hospitalise,
      date_sortie: hospitalise && dateSortie ? dateSortie : null,
      issue_hospitalisation: hospitalise && issue ? issue : null,
    }

    setSaving(true)
    try {
      await request('/api/v1/fiches', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      await onCreated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de l’enregistrement de la fiche.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel nf-panel">
      <div className="panel-heading">
        <div>
          <h2>Nouvelle fiche paludisme</h2>
          <p className="muted">Renseignez les informations de consultation et de prise en charge.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
      </div>

      {loadingContext && <p className="muted">Chargement de la formation sanitaire…</p>}
      {context && (
        <div className="nf-context">
          <strong>{context.formation_sanitaire.libelle}</strong>
          <span>Code : {context.formation_sanitaire.code}</span>
          <span>Type : {context.formation_sanitaire.type_fs}</span>
        </div>
      )}
      {error && <div className="alert error" role="alert">{error}</div>}

      <form onSubmit={submit}>
        <fieldset className="nf-section">
          <legend>1. Consultation</legend>
          <div className="nf-grid">
            <label className="nf-field">
              <span>Date de consultation *</span>
              <input name="date_consultation" type="date" max={localDate()} defaultValue={localDate()} required />
            </label>
            <label className="nf-field">
              <span>Numéro OC *</span>
              <input name="num_oc" maxLength={50} required placeholder="Numéro OC" />
            </label>
            <label className="nf-field">
              <span>Âge (années) *</span>
              <input name="age" type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} required />
            </label>
            <label className="nf-field">
              <span>Sexe *</span>
              <select name="sexe" value={sexe} onChange={(e) => setSexe(e.target.value)}>
                <option value="F">Féminin</option>
                <option value="M">Masculin</option>
              </select>
            </label>
            {sexe === 'F' && Number(age) >= 15 && Number(age) <= 49 && (
              <label className="nf-field">
                <span>Grossesse</span>
                <input name="grossesse" maxLength={20} placeholder="Préciser selon le dossier" />
              </label>
            )}
            <label className="nf-field">
              <span>Type de consultation *</span>
              <select name="type_consultation" defaultValue="Nouveau cas" required>
                <option>Nouveau cas</option>
                <option>Reconsultation</option>
                <option>Référé</option>
              </select>
            </label>
            {yesNo('fievre', 'Fièvre')}
            {yesNo('tpi1', 'TPI1', 'Non') && null}
            <label className="nf-field">
              <span>TPI1</span>
              <select value={tpi1 ? 'Oui' : 'Non'} onChange={(e) => setTpi1(e.target.value === 'Oui')}>
                <option value="Non">Non</option>
                <option value="Oui">Oui</option>
              </select>
            </label>
            {tpi1 && (
              <label className="nf-field">
                <span>TPI2</span>
                <select name="tpi2" defaultValue="Non">
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                  <option value="Non applicable">Non applicable</option>
                </select>
              </label>
            )}
            <label className="nf-field nf-wide">
              <span>Motif de consultation</span>
              <textarea name="motif_consultation" maxLength={255} rows={2} />
            </label>
          </div>
        </fieldset>

        <fieldset className="nf-section">
          <legend>2. Examens et diagnostic</legend>
          <div className="nf-grid">
            <label className="nf-field">
              <span>GE réalisée</span>
              <select value={ge ? 'Oui' : 'Non'} onChange={(e) => setGe(e.target.value === 'Oui')}>
                <option value="Non">Non</option><option value="Oui">Oui</option>
              </select>
            </label>
            {ge && <>
              <label className="nf-field"><span>Type de GE</span><input name="type_ge" maxLength={30} /></label>
              <label className="nf-field"><span>Charge SIGEP</span><input name="charge_sigep" maxLength={50} /></label>
            </>}
            <label className="nf-field">
              <span>TDR réalisé</span>
              <select value={tdr ? 'Oui' : 'Non'} onChange={(e) => setTdr(e.target.value === 'Oui')}>
                <option value="Non">Non</option><option value="Oui">Oui</option>
              </select>
            </label>
            {tdr && <>
              <label className="nf-field">
                <span>Type de TDR</span>
                <select name="type_tdr_id" defaultValue="">
                  <option value="">Sélectionner…</option>
                  {context?.types_tdr.map((item) => <option key={item.id} value={item.id}>{item.libelle}</option>)}
                </select>
              </label>
              <label className="nf-field"><span>Résultat TDR</span><input name="resultat_tdr" maxLength={20} /></label>
              <label className="nf-field"><span>Numéro laboratoire</span><input name="numero_laboratoire" maxLength={50} /></label>
            </>}
            <label className="nf-field nf-wide">
              <span>Diagnostic *</span>
              <select name="diagnostic" defaultValue="Non confirmé" required>
                <option>Non confirmé</option>
                <option>Paludisme simple</option>
                <option>Paludisme grave</option>
                <option>Autre</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="nf-section">
          <legend>3. Traitement</legend>
          <div className="nf-grid">
            {yesNo('asaq', 'ASAQ')}
            {yesNo('arlm', 'ARLM')}
            {yesNo('quinine_comprime', 'Quinine comprimé')}
            {yesNo('quinine_injectable', 'Quinine injectable')}
            {yesNo('artesunate_injectable', 'Artésunate injectable')}
            <label className="nf-field nf-wide"><span>Autre traitement</span><input name="autre_traitement" maxLength={255} /></label>
          </div>
        </fieldset>

        <fieldset className="nf-section">
          <legend>4. Hospitalisation</legend>
          <div className="nf-grid">
            <label className="nf-field">
              <span>Patient hospitalisé</span>
              <select value={hospitalise ? 'Oui' : 'Non'} onChange={(e) => setHospitalise(e.target.value === 'Oui')}>
                <option value="Non">Non</option><option value="Oui">Oui</option>
              </select>
            </label>
            {hospitalise && <>
              <label className="nf-field"><span>Date de sortie</span><input name="date_sortie" type="date" max={localDate()} /></label>
              <label className="nf-field">
                <span>Issue de l’hospitalisation</span>
                <select name="issue_hospitalisation" defaultValue="">
                  <option value="">Sélectionner…</option>
                  <option>Guéri</option><option>Transféré</option><option>Décédé</option>
                  <option>Sorti contre avis</option><option>En cours</option>
                </select>
              </label>
            </>}
          </div>
        </fieldset>

        <div className="nf-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>Annuler</button>
          <button type="submit" className="primary-button" disabled={saving || loadingContext || !context}>
            {saving ? 'Enregistrement…' : 'Enregistrer la fiche'}
          </button>
        </div>
      </form>
    </section>
  )
}