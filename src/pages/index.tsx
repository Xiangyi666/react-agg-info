import { Counter } from '@/features/counter/Counter'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to react-info-agg
        </h1>
        <p className="text-muted-foreground mt-2">
          Edit{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
            src/App.tsx
          </code>{' '}
          to get started.
        </p>
      </div>
      <Counter />
    </div>
  )
}
