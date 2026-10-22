import React from 'react'

interface IProps {
  size?: number
  color?: string
  strokeWidth?: number
  style?: React.CSSProperties
  className?: string
}

const Base: React.FC<IProps & { children: React.ReactNode }> = ({
  size = 22,
  color = 'currentColor',
  strokeWidth = 1.8,
  style,
  className,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const IconHome = (p: IProps) => (
  <Base {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Base>
)
export const IconList = (p: IProps) => (
  <Base {...p}>
    <path d="M8.5 6.5H21M8.5 12H21M8.5 17.5H21" />
    <circle cx="4" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="17.5" r="1" fill="currentColor" stroke="none" />
  </Base>
)
export const IconBudget = (p: IProps) => (
  <Base {...p}>
    <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5" />
    <path d="M12 8v8M9.5 10.2c.4-1 1.3-1.5 2.5-1.5 1.5 0 2.5.8 2.5 2s-1 1.8-2.5 2c1.8.2 2.7.9 2.7 2.1 0 1.3-1.2 2.2-2.7 2.2-1.4 0-2.4-.6-2.8-1.6" />
  </Base>
)
export const IconChart = (p: IProps) => (
  <Base {...p}>
    <path d="M4 20h16" />
    <path d="M6 16v-5M11 16V8M16 16v-3M21 16V4" transform="translate(-1 0)" />
  </Base>
)
export const IconUser = (p: IProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.7 4-5.5 7.5-5.5s6.3 1.8 7.5 5.5" />
  </Base>
)
export const IconWallet = (p: IProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="18" height="14" rx="3.5" />
    <path d="M3 10c0-2.5 1.8-4 4-4h9" />
    <circle cx="16.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" />
  </Base>
)
export const IconPlus = (p: IProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" strokeWidth={p.strokeWidth ?? 2.2} />
  </Base>
)
export const IconArrowLeft = (p: IProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
)
export const IconChevronRight = (p: IProps) => (
  <Base {...p}>
    <path d="M9 5l7 7-7 7" />
  </Base>
)
export const IconSearch = (p: IProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Base>
)
export const IconFilter = (p: IProps) => (
  <Base {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Base>
)
export const IconEdit = (p: IProps) => (
  <Base {...p}>
    <path d="M4 20h4L20 8l-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Base>
)
export const IconTrash = (p: IProps) => (
  <Base {...p}>
    <path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </Base>
)
export const IconCalendar = (p: IProps) => (
  <Base {...p}>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M4 10h16M8 3v4M16 3v4" />
  </Base>
)
export const IconNotes = (p: IProps) => (
  <Base {...p}>
    <path d="M5 3h9l5 5v13H5V3z" />
    <path d="M14 3v5h5M9 13h6M9 16.5h4" />
  </Base>
)
export const IconCard = (p: IProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 10h18" strokeWidth={p.strokeWidth ?? 2} />
  </Base>
)
export const IconCash = (p: IProps) => (
  <Base {...p}>
    <rect x="3" y="7" width="18" height="10" rx="2.5" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M6.5 12h.01M17.5 12h.01" strokeWidth={p.strokeWidth ?? 2.2} />
  </Base>
)
export const IconUpi = (p: IProps) => (
  <Base {...p}>
    <path d="M12 3v7M12 14v7" />
    <path d="M8 10h8l-4 4H8l4-4z" transform="rotate(90 12 12) translate(0 0)" />
  </Base>
)
export const IconTarget = (p: IProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </Base>
)
export const IconTrophy = (p: IProps) => (
  <Base {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
    <path d="M8 5H5.5a2.5 2.5 0 0 0 2.5 5M16 5h2.5a2.5 2.5 0 0 1-2.5 5" />
    <path d="M12 13v3M9 20h6l-.8-3h-4.4L9 20z" />
  </Base>
)
export const IconBell = (p: IProps) => (
  <Base {...p}>
    <path d="M18 16H5.5c1-1.2 1.5-2.5 1.5-4.5V9a5 5 0 0 1 10 0v2.5c0 2 .5 3.3 1.5 4.5z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Base>
)
export const IconShield = (p: IProps) => (
  <Base {...p}>
    <path d="M12 3l7 2.5V11c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V5.5L12 3z" />
    <path d="M9.2 12l2 2 3.6-4" />
  </Base>
)
export const IconMoon = (p: IProps) => (
  <Base {...p}>
    <path d="M19.5 14.5A7.8 7.8 0 0 1 9.5 4.5a7.8 7.8 0 1 0 10 10z" />
  </Base>
)
export const IconSun = (p: IProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
  </Base>
)
export const IconLogout = (p: IProps) => (
  <Base {...p}>
    <path d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4" />
    <path d="M10 8l-4 4 4 4M6 12h9" />
  </Base>
)
export const IconTrendUp = (p: IProps) => (
  <Base {...p}>
    <path d="M4 17l6-6 3.5 3.5L20 8" />
    <path d="M14.5 8H20v5.5" />
  </Base>
)
export const IconSparkle = (p: IProps) => (
  <Base {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
  </Base>
)
export const IconCheck = (p: IProps) => (
  <Base {...p}>
    <path d="M5 13l4.5 4.5L19 7" strokeWidth={p.strokeWidth ?? 2.2} />
  </Base>
)
export const IconClose = (p: IProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)
export const IconEye = (p: IProps) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
)
export const IconEyeOff = (p: IProps) => (
  <Base {...p}>
    <path d="M4 4l16 16" />
    <path d="M9.9 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.6M6.3 6.9A16.4 16.4 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.6-.3 3.7-.8" />
  </Base>
)
export const IconCurrency = (p: IProps) => (
  <Base {...p}>
    <path d="M7.5 20V4h5.2a4.5 4.5 0 0 1 0 9H7.5M7.5 13l7 7M7.5 13l6.5-6" />
  </Base>
)
export const IconAlarm = (p: IProps) => (
  <Base {...p}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13l2.5 1.5M5 4.5L3 6.5M19 4.5l2 2" />
  </Base>
)
export const IconLotus = (p: IProps) => (
  <Base {...p}>
    <path d="M12 20c-5 0-8-3.2-8-8 0 0 3 1 5 3.5C10.5 13 12 9.5 12 6c0 0 1.5 7 3 9.5C17 13 20 12 20 12c0 4.8-3 8-8 8z" />
  </Base>
)
