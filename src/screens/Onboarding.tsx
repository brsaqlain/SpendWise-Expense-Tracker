import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChart, IconBudget, IconTarget, IconCheck } from '../icons'

const SLIDES = [
  {
    emoji: '🧾',
    title: 'Track every rupee',
    sub: 'Log expenses in seconds with smart categories, payment modes and notes built for Indian wallets — UPI, cash and cards.',
    art: 'rgba(232, 89, 12, .14)',
  },
  {
    emoji: '🎯',
    title: 'Budgets that stick',
    sub: 'Set monthly limits per category. SpendWise warns you before you cross the line — not after.',
    art: 'rgba(8, 127, 91, .14)',
  },
  {
    emoji: '📈',
    title: 'See your real habits',
    sub: 'Clean charts, category breakdowns and monthly trends show exactly where your money goes.',
    art: 'rgba(25, 113, 194, .12)',
  },
]

export const Onboarding: React.FC = () => {
  const nav = useNavigate()
  const [i, setI] = useState(0)
  const s = SLIDES[i]

  const finish = () => {
    localStorage.setItem('spendwise.onboarded', '1')
    nav('/dashboard', { replace: true })
  }

  return (
    <div className="onboard">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 0' }}>
        <button className="link" onClick={finish}>
          Skip
        </button>
      </div>

      <div className="onboard-art">
        <div
          style={{
            width: 'min(78vw, 240px)',
            aspectRatio: '1',
            borderRadius: 40,
            background: `var(--surface)`,
            boxShadow: 'var(--shadow-card)',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid var(--border)',
          }}
          key={i}
        >
          <div
            style={{
              position: 'absolute',
              inset: 30,
              borderRadius: 28,
              background: s.art,
              animation: 'screenIn .4s ease',
            }}
          />
          <div style={{ fontSize: 84, position: 'relative', animation: 'rise .5s ease both' }}>{s.emoji}</div>
        </div>
      </div>

      <div style={{ padding: '0 28px 12px', textAlign: 'center' }}>
        <h2 className="h1" key={'t' + i} style={{ animation: 'screenIn .35s ease' }}>
          {s.title}
        </h2>
        <p className="muted" key={'s' + i} style={{ marginTop: 10, fontSize: 14.5, animation: 'screenIn .45s ease' }}>
          {s.sub}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '18px 0 22px' }}>
        {SLIDES.map((_, k) => (
          <span
            key={k}
            style={{
              width: k === i ? 22 : 7,
              height: 7,
              borderRadius: 99,
              background: k === i ? 'var(--primary)' : 'var(--border)',
              transition: 'all .25s ease',
            }}
          />
        ))}
      </div>

      <div style={{ padding: '0 24px calc(24px + env(safe-area-inset-bottom))', display: 'grid', gap: 10 }}>
        {i < SLIDES.length - 1 ? (
          <button className="btn btn-primary btn-block" onClick={() => setI(i + 1)}>
            Next — Understand your money
          </button>
        ) : (
          <button className="btn btn-primary btn-block" onClick={finish}>
            Get Started
          </button>
        )}
        <button className="btn btn-ghost btn-block" onClick={finish}>
          I already have an account — Login
        </button>
        <div style={{ textAlign: 'center' }} className="small muted">
          <IconCheck size={13} style={{ verticalAlign: -2 }} /> Your data stays on this device
        </div>
      </div>
    </div>
  )
}

export const OnboardingIcons = { IconChart, IconBudget, IconTarget }
