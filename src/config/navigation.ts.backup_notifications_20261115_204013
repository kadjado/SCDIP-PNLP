export const navigation = [
  { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord' },
  { id: 'fiches', icon: 'fiches', label: 'Fiches paludisme' },
  { id: 'mailbox', icon: 'mailbox', label: 'Messagerie' },
  { id: 'users', icon: 'users', label: 'Utilisateurs' },
  { id: 'structures', icon: 'structures', label: 'Structures sanitaires' },
] as const

export const settingsNavigation = [
  { id: 'journaux', icon: 'journal', label: 'Journaux' },
  { id: 'rapport', icon: 'bars', label: 'Rapport' },
  { id: 'export', icon: 'download', label: 'Export' },
] as const

export const accountPages = [
  { id: 'profil', label: 'Profil' },
  { id: 'aide', label: 'Aide' },
] as const

export type Page =
  | typeof navigation[number]['id']
  | typeof settingsNavigation[number]['id']
  | typeof accountPages[number]['id']

export const supervisorPages: Page[] = [
  'dashboard',
  'fiches',
  'mailbox',
  'journaux',
  'rapport',
  'export',
  'profil',
  'aide',
]

export const pageSubtitles: Partial<Record<Page, string>> = {
  fiches: 'Consultez les fiches accessibles à votre compte.',
  users: 'Consultez les comptes utilisateurs disponibles.',
  journaux: 'Suivez l’historique des actions effectuées dans l’application.',
  rapport: 'Consultez et générez les rapports.',
  export: 'Exportez les données de collecte.',
  profil: 'Consultez les informations de votre compte.',
  aide: 'Retrouvez les réponses aux questions courantes.',
}

export const pagePaths: Record<Page, string> = {
  dashboard: '/dashboard',
  fiches: '/forms',
  mailbox: '/messagerie',
  users: '/utilisateurs',
  structures: '/structures',
  journaux: '/parametres/journaux',
  rapport: '/parametres/rapport',
  export: '/parametres/export',
  profil: '/profil',
  aide: '/aide',
}

export const pathPages: Record<string, Page> = {
  '/': 'dashboard',
  '/login': 'dashboard',
  '/dashboard': 'dashboard',
  '/forms': 'fiches',
  '/messagerie': 'mailbox',
  '/utilisateurs': 'users',
  '/structures': 'structures',
  '/parametres/journaux': 'journaux',
  '/parametres/rapport': 'rapport',
  '/parametres/export': 'export',
  '/profil': 'profil',
  '/aide': 'aide',
}
