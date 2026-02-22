import { Check } from 'lucide-react'
import { PREDEFINED_COLORS } from '@expenses-tracker/shared'

type Props = {
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PREDEFINED_COLORS.map((color) => {
        const isSelected = value === color
        return (
          <button
            key={color}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(color)}
            className={[
              'flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110',
              isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : '',
            ].join(' ')}
            style={{ backgroundColor: color }}
          >
            {isSelected && <Check size={16} color="#fff" strokeWidth={2.5} />}
          </button>
        )
      })}
    </div>
  )
}
