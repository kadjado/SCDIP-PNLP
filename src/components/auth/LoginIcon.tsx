function LoginIcon({ name }: { name: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  const c = { viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const
  switch (name) {
    case 'user': return <svg {...c} {...s}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c0-3.9 3.2-6.2 7.2-6.2s7.2 2.3 7.2 6.2" /></svg>
    case 'lock': return <svg {...c} fill="currentColor"><path d="M8 10V7.6a4 4 0 0 1 8 0V10h.8c1 0 1.7.8 1.7 1.7v7.1c0 1-.8 1.7-1.7 1.7H7.2c-1 0-1.7-.8-1.7-1.7v-7.1c0-1 .8-1.7 1.7-1.7zm2 0h4V7.6a2 2 0 0 0-4 0z" /></svg>
    case 'eye': return <svg {...c} {...s}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'eyeOff': return <svg {...c} {...s}><path d="M2 12s3.6-6.5 10-6.5c2 0 3.7.6 5.1 1.5M22 12s-3.6 6.5-10 6.5c-2 0-3.7-.6-5.1-1.5" /><circle cx="12" cy="12" r="3" /><path d="m3.5 3.5 17 17" /></svg>
    case 'login': return <svg {...c} {...s}><path d="M14 4h4.2A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8H14" /><path d="M4 12h11M11.5 8l4 4-4 4" /></svg>
    case 'chart': return <svg {...c} fill="currentColor"><rect x="4" y="11" width="4" height="9" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><rect x="16" y="8" width="4" height="12" rx="1" /></svg>
    case 'shieldCheck': return <svg {...c} {...s}><path d="M12 3 5 5.6v6c0 4.4 3 7.6 7 9.4 4-1.8 7-5 7-9.4v-6z" /><path d="m8.8 12.2 2.2 2.2 4.2-4.6" /></svg>
    case 'shield': return <svg {...c} {...s}><path d="M12 3 5 5.6v6c0 4.4 3 7.6 7 9.4 4-1.8 7-5 7-9.4v-6z" /><path d="m9 12 2.2 2.2L15.2 10" /></svg>
    case 'people': return <svg {...c} fill="currentColor"><circle cx="12" cy="8" r="3.2" /><circle cx="5.2" cy="9.6" r="2.4" /><circle cx="18.8" cy="9.6" r="2.4" /><path d="M6.2 19.5c0-3.3 2.6-5.6 5.8-5.6s5.8 2.3 5.8 5.6z" /><path d="M1.8 18c0-2.3 1.6-4 3.8-4 .9 0 1.7.3 2.3.7-1.1 1-1.8 2.3-2 3.3z" opacity=".85" /><path d="M22.2 18c0-2.3-1.6-4-3.8-4-.9 0-1.7.3-2.3.7 1.1 1 1.8 2.3 2 3.3z" opacity=".85" /></svg>
    case 'pin': return <svg {...c} {...s}><path d="M12 21s6.5-5.7 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.3 6.5 11 6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
    case 'leaf': return <svg {...c} {...s}><path d="M5 19c0-8 5-13 15-14 0 9-4 14-12 14" /><path d="M5 19c2-4 5-7 9-9" /></svg>
    case 'hexagons': return <svg className="lg-hex" viewBox="0 0 220 220" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M150 10l30 17v35l-30 17-30-17V27z" /><path d="M180 62l30 17v35l-30 17-30-17V79z" /><path d="M120 62l30 17v35l-30 17-30-17V79z" /><circle cx="60" cy="40" r="4" fill="currentColor" /><circle cx="95" cy="22" r="3" fill="currentColor" /><circle cx="200" cy="170" r="3" fill="currentColor" /></svg>
    default: return null
  }
}

export default LoginIcon
