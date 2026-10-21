import React from 'react'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button className={`ui-button ${variant} ${size} ${className}`} {...props}>{children}</button>
}
