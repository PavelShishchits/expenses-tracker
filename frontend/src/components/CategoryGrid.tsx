'use client'

import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Heart,
  Film,
  Book,
  Briefcase,
  Coffee,
  Gift,
  Music,
  Plane,
  Dumbbell,
  Wifi,
  Phone,
  Zap,
  Star,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { type Category } from '@/services/category.service'

const ICON_MAP: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  'utensils': Utensils,
  'car': Car,
  'home': Home,
  'heart': Heart,
  'film': Film,
  'book': Book,
  'briefcase': Briefcase,
  'coffee': Coffee,
  'gift': Gift,
  'music': Music,
  'plane': Plane,
  'dumbbell': Dumbbell,
  'wifi': Wifi,
  'phone': Phone,
  'zap': Zap,
  'star': Star,
  'tag': Tag,
}

type Props = {
  categories: Category[]
  selectedId: string | null
  onSelect: (category: Category) => void
}

export default function CategoryGrid({ categories, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {categories.map((category) => {
        const Icon = ICON_MAP[category.icon] ?? Tag
        const isSelected = category.id === selectedId
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category)}
            className={[
              'flex flex-col items-center gap-2 rounded-xl p-3 transition-all',
              isSelected
                ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                : 'hover:bg-gray-100',
            ].join(' ')}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: category.iconColor }}
            >
              <Icon size={22} color="#fff" strokeWidth={1.8} />
            </div>
            <span className="text-center text-xs font-medium text-gray-700 leading-tight">
              {category.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
