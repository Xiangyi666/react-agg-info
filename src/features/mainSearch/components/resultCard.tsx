import type { result } from '@/types'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, Bomb } from 'lucide-react'
import { collect } from '@/features/mainSearch/api'
export default function ResultCard(resultProp: result) {
  const { title, description, url, source, keywords, country } = resultProp
  const navigate = useNavigate()
  return (
    <Card className="flex gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-xs font-medium">
            {source}
          </span>
          <span className="text-muted-foreground text-xs">{country}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-ink hover:text-brand line-clamp-2 leading-snug font-semibold hover:underline"
        >
          {title}
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-brand/70 block truncate text-xs hover:underline"
        >
          {url}
        </a>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span
              key={k}
              className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="收藏"
          onClick={() => collect(resultProp.id)}
        >
          <Bookmark className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="发散"
          onClick={() => navigate(`/resume/${resultProp.id}`)}
        >
          <Bomb className="size-5" />
        </Button>
      </div>
    </Card>
  )
}
