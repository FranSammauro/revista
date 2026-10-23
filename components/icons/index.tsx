// Minimal science SVG icons — clean, geometric, no emojis

export function IconQuimica({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Erlenmeyer flask */}
      <path d="M9 3h6M9 3v7L4 18a1 1 0 00.9 1.5h14.2A1 1 0 0020 18l-5-8V3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="15" r="1" fill={color}/>
      <circle cx="14" cy="17" r="0.75" fill={color}/>
      <circle cx="12" cy="13.5" r="0.5" fill={color}/>
    </svg>
  )
}

export function IconFisica({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Atom */}
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke={color} strokeWidth="1.5"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke={color} strokeWidth="1.5" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke={color} strokeWidth="1.5" transform="rotate(120 12 12)"/>
      <circle cx="12" cy="12" r="2" fill={color}/>
    </svg>
  )
}

export function IconTierra({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Globe with layers */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
      <path d="M3 12h18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3c-3 3-3 6 0 9s3 6 0 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3c3 3 3 6 0 9s-3 6 0 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBiologia({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* DNA double helix simplified */}
      <path d="M8 3c0 0 4 3 4 6s-4 6-4 6s4 3 4 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 3c0 0-4 3-4 6s4 6 4 6s-4 3-4 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8.5" y1="6" x2="15.5" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5.5" y1="12" x2="18.5" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8.5" y1="18" x2="15.5" y2="18" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function getCategoryIcon(category: string, size = 20, color = 'currentColor') {
  switch (category) {
    case 'quimica': return <IconQuimica size={size} color={color} />
    case 'fisica': return <IconFisica size={size} color={color} />
    case 'ciencias-de-la-tierra': return <IconTierra size={size} color={color} />
    case 'biologia': return <IconBiologia size={size} color={color} />
    default: return null
  }
}
