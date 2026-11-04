function Icon({ name }: { name: string }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  switch (name) {
    case 'dashboard':
      return <svg {...common} fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" opacity=".78" /><rect x="3" y="13" width="8" height="8" rx="2" opacity=".78" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>
    case 'fiches':
    case 'clipboard':
      return <svg {...common} {...stroke}><path d="M9 4h6v2H9z" /><path d="M15 5h2.2A1.8 1.8 0 0 1 19 6.8v12.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.2V6.8A1.8 1.8 0 0 1 6.8 5H9" /><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" /></svg>
    case 'mailbox':
      return <svg {...common} {...stroke}><rect x="3" y="5" width="18" height="14" rx="2.2" /><path d="m3.5 7 8.5 6.5L20.5 7" /></svg>
    case 'users':
      return <svg {...common} fill="currentColor"><circle cx="12" cy="8" r="3.2" /><circle cx="5.2" cy="9.6" r="2.4" /><circle cx="18.8" cy="9.6" r="2.4" /><path d="M6.2 19.5c0-3.3 2.6-5.6 5.8-5.6s5.8 2.3 5.8 5.6z" /><path d="M1.8 18c0-2.3 1.6-4 3.8-4 .9 0 1.7.3 2.3.7-1.1 1-1.8 2.3-2 3.3z" opacity=".85" /><path d="M22.2 18c0-2.3-1.6-4-3.8-4-.9 0-1.7.3-2.3.7 1.1 1 1.8 2.3 2 3.3z" opacity=".85" /></svg>
    case 'structures':
      return <svg {...common} fill="currentColor"><path d="M12 3.2 2.6 11.4a.9.9 0 0 0 .6 1.6H5v7h5v-5h4v5h5v-7h1.8a.9.9 0 0 0 .6-1.6z" /></svg>
    case 'logout':
      return <svg {...common} {...stroke}><path d="M10 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20H10" /><path d="M9 12h11M16.5 8l3.5 4-3.5 4" /></svg>
    case 'bell':
      return <svg {...common} {...stroke}><path d="M6 17h12l-1.5-2.2V10.5a4.5 4.5 0 0 0-9 0v4.3z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></svg>
    case 'bellOff':
      return <svg {...common} {...stroke}><path d="M6 17h12l-1.5-2.2V10.5a4.5 4.5 0 0 0-9 0v4.3z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /><path d="m4 4 16 16" /></svg>
    case 'menu':
      return <svg {...common} {...stroke} strokeWidth={2.6}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></svg>
    case 'chevron':
      return <svg {...common} width={18} height={18} {...stroke}><path d="m6 9 6 6 6-6" /></svg>
    case 'refresh':
      return <svg {...common} {...stroke}><path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5" /><path d="M4 4v4.5h4.5" /><path d="M4 13a8 8 0 0 0 14.3 4.3L20 15.5" /><path d="M20 20v-4.5h-4.5" /></svg>
    case 'user':
      return <svg {...common} fill="currentColor"><circle cx="12" cy="7.6" r="4.2" /><path d="M3.8 21c0-4.6 3.5-7.6 8.2-7.6s8.2 3 8.2 7.6z" /></svg>
    case 'bars':
      return <svg {...common} fill="currentColor"><rect x="3" y="11" width="4.4" height="9" rx="1" /><rect x="9.8" y="4" width="4.4" height="16" rx="1" /><rect x="16.6" y="8" width="4.4" height="12" rx="1" /></svg>
    case 'arrow':
      return <svg {...common} {...stroke}><path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" /></svg>
    case 'check':
      return <svg {...common} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" strokeWidth={2.4} /><path d="m7.8 12.4 3 3 5.6-6.2" /></svg>
    case 'hospital':
      return <svg {...common} fill="currentColor"><path fillRule="evenodd" d="M7 3h10a2 2 0 0 1 2 2v1.6h1.2A1.8 1.8 0 0 1 22 8.4V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.4a1.8 1.8 0 0 1 1.8-1.8H5V5a2 2 0 0 1 2-2zm4.2 3.2v1.6H9.6v1.6h1.6v1.6h1.6V9.4h1.6V7.8h-1.6V6.2zM6.4 13v2h2v-2zm4.6 0v2h2v-2zm4.6 0v2h2v-2zM6.4 17v2h2v-2zm4.6 0v2h2v-2zm4.6 0v2h2v-2z" /></svg>
    case 'settings':
      return <svg {...common} {...stroke}><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg>
    case 'journal':
      return <svg {...common} {...stroke}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M9.5 12h6M9.5 15.5h6M9.5 19h3" /></svg>
    case 'download':
      return <svg {...common} {...stroke}><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" /></svg>
    case 'help':
      return <svg {...common} {...stroke}><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 2" /><path d="M12 17.2v.01" /></svg>
    case 'pin':
      return <svg {...common} {...stroke}><path d="M12 21s6.5-5.7 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.3 6.5 11 6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
    case 'map':
      return <svg {...common} {...stroke}><path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z" /><path d="M9 4v13.5M15 6.5V20" /></svg>
    case 'search':
      return <svg {...common} {...stroke}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
    case 'info':
      return <svg {...common} fill="currentColor"><rect x="10.6" y="10" width="2.8" height="8.4" rx="1.4" /><circle cx="12" cy="6.4" r="1.7" /></svg>
    case 'shield':
      return <svg {...common} viewBox="0 0 48 56" width={62} height={72} fill="none"><path d="M24 2 5 8.6v15.8C5 38.6 13.4 48.4 24 54c10.6-5.6 19-15.4 19-29.6V8.6z" fill="#14a04b" stroke="#0b7a3a" strokeWidth="2" /><path d="M24 7 9.6 12v12.4c0 11.2 6.6 19.2 14.4 24 7.8-4.8 14.4-12.8 14.4-24V12z" fill="none" stroke="#fff" strokeWidth="2" opacity=".75" /><path d="m15.6 27.4 6 6 11-12.4" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    default:
      return null
  }
}

export default Icon
