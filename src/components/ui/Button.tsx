import Link from 'next/link'

interface ButtonProps {
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

const styles = {
  primary: { backgroundColor: 'var(--accent)', color: 'white', border: 'none' },
  secondary: { backgroundColor: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)' },
  ghost: { backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
}

const sizes = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-sm',
}

export default function Button({
  href, onClick, variant = 'primary', size = 'md', children, className = '', type = 'button', disabled,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 tracking-widest transition-opacity hover:opacity-85 disabled:opacity-50 ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={cls} style={styles[variant]}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={styles[variant]}>
      {children}
    </button>
  )
}
