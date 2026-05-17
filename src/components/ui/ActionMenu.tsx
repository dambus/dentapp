import { MoreHorizontal } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from 'react'

import { classNames } from '../../lib/classNames'
import { IconButton } from './IconButton'

export type ActionMenuItem = {
  disabled?: boolean
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
}

type ActionMenuProps = {
  align?: 'left' | 'right'
  disabled?: boolean
  items: ActionMenuItem[]
  label?: string
}

export function ActionMenu({
  align = 'right',
  disabled = false,
  items,
  label = 'More actions',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <IconButton
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        disabled={disabled || items.length === 0}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        variant="secondary"
      >
        <MoreHorizontal aria-hidden className="h-4 w-4" />
      </IconButton>

      {isOpen ? (
        <div
          className={classNames(
            'absolute top-full z-30 mt-2 min-w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          role="menu"
        >
          {items.map((item) => {
            const Icon = item.icon

            return (
              <button
                className={classNames(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                  item.tone === 'danger'
                    ? 'text-red-700 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-50',
                  item.disabled ? 'cursor-not-allowed opacity-50' : '',
                )}
                disabled={item.disabled}
                key={item.label}
                onClick={() => {
                  item.onSelect()
                  setIsOpen(false)
                }}
                role="menuitem"
                type="button"
              >
                {Icon ? <Icon aria-hidden className="h-4 w-4" /> : null}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
