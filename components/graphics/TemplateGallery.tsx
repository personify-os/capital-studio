import { cn } from '@/lib/utils'
import { type GraphicTemplate } from '@/app/(studio)/graphics/templates'
import TemplateThumbnail from './TemplateThumbnail'

interface Props {
  templates:        GraphicTemplate[]
  selectedTemplate: GraphicTemplate
  onSelect:         (t: GraphicTemplate) => void
  categories:       string[]
  category:         string
  onCategoryChange: (cat: string) => void
}

export default function TemplateGallery({
  templates, selectedTemplate, onSelect, categories, category, onCategoryChange,
}: Props) {
  return (
    <div className="p-6 border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
          Templates
          {selectedTemplate && (
            <span className="ml-2 text-brand-azure normal-case font-normal">— {selectedTemplate.name}</span>
          )}
        </p>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border transition-colors',
                category === cat
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            className={cn(
              'p-3 rounded-card border-2 text-left transition-all hover:shadow-card',
              selectedTemplate.id === t.id
                ? 'border-brand-azure bg-brand-azure/5 shadow-card'
                : 'border-gray-200 hover:border-brand-light bg-white',
            )}
          >
            <div className="w-full aspect-video rounded-lg mb-2 overflow-hidden">
              <TemplateThumbnail id={t.id} active={selectedTemplate.id === t.id} />
            </div>
            <p className={cn('text-xs font-semibold leading-tight', selectedTemplate.id === t.id ? 'text-brand-azure' : 'text-brand-navy')}>
              {t.name}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
