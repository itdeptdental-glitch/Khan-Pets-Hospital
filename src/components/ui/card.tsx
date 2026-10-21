import React from 'react'
interface CardProps { children: React.ReactNode; className?: string }
export function Card({ children, className = '' }: CardProps) { return <div className={`ui-card ${className}`}>{children}</div> }
export function CardHeader({ children, className = '' }: CardProps) { return <div className={`ui-card-header ${className}`}>{children}</div> }
export function CardContent({ children, className = '' }: CardProps) { return <div className={`ui-card-content ${className}`}>{children}</div> }
