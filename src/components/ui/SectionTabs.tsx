import { classNames } from '../../lib/classNames'

type SectionTabItem = {
  id: string
  label: string
}

type SectionTabsProps = {
  activeId: string
  ariaLabel: string
  items: SectionTabItem[]
  onChange: (id: string) => void
}

export function SectionTabs({
  activeId,
  ariaLabel,
  items,
  onChange,
}: SectionTabsProps) {
  return (
    <div
      aria-label={ariaLabel}
      className="-mx-1 overflow-x-auto pb-1"
      role="tablist"
    >
      <div className="inline-flex min-w-full gap-1 px-1 sm:min-w-0">
        {items.map((item) => {
          const isActive = item.id === activeId

          return (
            <button
              aria-selected={isActive}
              className={classNames(
                'shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950',
              )}
              key={item.id}
              onClick={() => onChange(item.id)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
