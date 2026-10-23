import MessagesBoard from './components/messagesBoard'
import { getMessageHistory } from './api'
import { useEffect } from 'react'
import {useDispatch} from 'react-redux'
type chatProps = {
  userId: string
}

export default function Chat({ userId }: chatProps) {
  const dispatch = useDispatch()

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    getMessageHistory(userId, controller.signal)
      .then((data) => {
        // 后端返回结构不符合预期时兜底为空数组，避免 undefined 流入渲染导致整树崩溃
        if (!cancelled) {
          dispatch({ type: 'chat/fullfillMessages', payload: data })
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
