import React from 'react'
import { NavLink } from 'react-router-dom'
import { IconBudget, IconHome, IconList, IconUser } from '../icons'

const items = [
  { to: '/', icon: IconHome, label: 'Home' },
  { to: '/transactions', icon: IconList, label: 'Transactions' },
  { to: '/budgets', icon: IconBudget, label: 'Budgets' },
  { to: '/profile', icon: IconUser, label: 'Profile' },
]

export const BottomNav: React.FC = () => (
  <nav className="bottom-nav" aria-label="Primary">
    {items.map(({ to, icon: Icon, label }) => (
      <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>
        <Icon size={22} />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
)
