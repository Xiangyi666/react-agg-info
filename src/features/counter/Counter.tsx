import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { increment, decrement, reset } from './counterSlice'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Redux Counter</CardTitle>
        <CardDescription>
          A simple demo showing Redux Toolkit state management.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <span className="text-5xl font-bold tabular-nums">{count}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(decrement())}
          >
            −
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(increment())}
          >
            +
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch(reset())}>
          Reset
        </Button>
      </CardContent>
    </Card>
  )
}
