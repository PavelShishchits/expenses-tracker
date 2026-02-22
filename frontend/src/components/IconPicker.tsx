'use client'

import { PREDEFINED_ICONS } from '@expenses-tracker/shared'
import { ICON_MAP, type PredefinedIcon } from '@/lib/icons'

type Props = {
  value: PredefinedIcon
  color: string
  onChange: (icon: PredefinedIcon) => void
}

export default function IconPicker({ value, color, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2 overflow-y-auto max-h-48">
      {PREDEFINED_ICONS.map((icon) => {
        const Icon = ICON_MAP[icon]
        const isSelected = value === icon
        return (
          <button
            key={icon}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(icon)}
            className={[
              'flex items-center justify-center rounded-lg p-2 transition-all',
              isSelected ? 'bg-gray-100' : 'hover:bg-gray-100',
            ].join(' ')}
            style={isSelected ? { outline: `2px solid ${color}`, outlineOffset: '2px' } : undefined}
          >
            <Icon size={20} strokeWidth={1.8} style={{ color }} />
          </button>
        )
      })}
    </div>
  )
}
