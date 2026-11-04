export type User = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  actif?: boolean
}

export type Fiche = {
  id: string
  numero_fiche: string
  date_consultation: string
  date_saisie?: string
  age: number
  sexe: string
  diagnostic: string
  validation_confirmee?: boolean
  formation_sanitaire_id: number
}

export type PagedFiches = {
  items: Fiche[]
  total: number
  limit: number
  offset: number
}

export type Structure = {
  id: number
  code: string
  libelle: string
  actif?: boolean
}