import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ChatMessage } from '@/features/chat/types'
import { pushMessage, refreshMessage } from '@/features/chat/chatSlice'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { http } from '@/services/api'

function InputBox() {
  const user = useAppSelector((state) => state.auth.user)
  const [inputValue, setInputValue] = useState('')
  const dispatch = useAppDispatch()
  const genId = () => {
    return Math.random().toString(36).substring(2, 15)
  }
  const fetchStream = async (message: string) => {
    const response = await http.stream('/chat-stream', { params: {user_id: user?.id || '', message } });
    setInputValue('')
    const currentServerId = genId()
    dispatch(pushMessage({ role: 'assistant', id: currentServerId, content: '', status: 'pending' }))
    const reader = response?.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = ''
    // 闭包里的 streamTxt 是发送那一刻的快照，流式累积必须用局部变量
    let received = ''
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Do something with last chunk of data then exit reader
        return;
      }
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n|\r/g, '\n')
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || ''
      let acc = ''
      parts.forEach((chunk) => {
        console.log(chunk)
        if(chunk.indexOf('data')!==-1) chunk = chunk.split(':')[1]
        if(chunk && !chunk.includes('[DONE]')) acc += chunk.trim()
      });
      received += acc.trim()
      dispatch(refreshMessage({ role: 'assistant', id: currentServerId, content: received, status: 'success' }))
      // Otherwise do something here to process current chunk
    }
  }
 
  const sendMessage = (message: ChatMessage) => {
    if (!message) return
    // 如果接口响应失败 此处需要标记此条信息失败 TODO
    dispatch(pushMessage(message))
    fetchStream(message.content)
  }
  const handleSend = () => {
    const content = inputValue.trim()
    if (!content) return
    sendMessage({ role: 'user', id: genId(), content, status: 'pending' })
  }
  // Enter 发送，Shift+Enter 换行；输入法组合期间不触发（否则拼音候选确认会被误发送）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return
    e.preventDefault()
    handleSend()
  }
  return <div className="mt-4 mr-4 flex flex-1 flex-col">
    <div className="w-full min-w-full h-[100px] border border-solid border-gray-300 rounded-md">
      <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="min-w-full h-full p-2 rounded-md" placeholder="Type a message..." />
    </div>
    <div className="flex flex-1 justify-end">
      <Button onClick={handleSend} className="bg-nav-500 block text-white p-2 px-4 mt-2 rounded-md">Send</Button>
    </div>
  </div>
}
// 助手消息占位期间的三点输入动画
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="正在输入...">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2 rounded-full bg-nav-400 motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

export default function MessagesBoard() {

  const messages = useAppSelector((state) => state.chat.messages)
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messageEndRef.current) {
      const el = messageEndRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])
  return <>
    <div ref={messageEndRef} className="[65vh] flex flex-1 flex-col gap-2 min-w-[full] w-full h-[65vh] overflow-y-auto">
      {messages && messages.map((message) => {
        const isUser = message.role === 'user'
        return (
          <div
            className={`p-2 px-4 rounded-md ${isUser ? 'self-end bg-[#fafafa] max-w-[60%] ' : 'min-w-[100px] max-w-[65%] self-start bg-nav-50'}`}
            key={message.id}
          >
            {!isUser && message.status === 'pending' && !message.content ? (
              <TypingDots />
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        )
      })}
    </div>
    <InputBox />
  </>
}
