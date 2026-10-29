import MessagesBoard from './components/messagesBoard'
import { getMessageHistory } from './api'
import { fullfillMessages } from './chatSlice'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

export default function Chat() {
  const dispatch = useAppDispatch()
  const userId = useAppSelector((state) => state.auth.user?.id)
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    getMessageHistory(userId || '', controller.signal)
      .then((data) => {
        // 后端返回结构不符合预期时兜底为空数组，避免 undefined 流入渲染导致整树崩溃
        if (!cancelled) {
          dispatch(fullfillMessages(data))
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        console.error(err)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [userId])

  return (
    <div className='w-full'>
      <MessagesBoard />
    </div>
  )
}
