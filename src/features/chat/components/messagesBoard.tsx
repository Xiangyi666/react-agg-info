import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ChatMessage } from '@/features/chat/types'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { http } from '@/services/api'

function InputBox() {
  const [streamTxt, setStreamTxt] = useState('')
  const user = useAppSelector((state) => state.auth.user)
  const fetchStream = async (message: string) => {
    const response = await http.stream('/chat-stream', { params: {user_id:'demo_user', message } });
    setStreamTxt('')
    const reader = response?.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Do something with last chunk of data then exit reader
        return;
      }
      const originChunk  = decoder.decode(value)
      const chunk = originChunk ? originChunk.split(':')[1] : ''
      if(chunk && chunk != '[DONE]') setStreamTxt((prev) => prev + chunk.trim())
      // Otherwise do something here to process current chunk
    }
  }
  const [inputValue, setInputValue] = useState('')
  const dispatch = useAppDispatch()
  const genId = () => {
    return Math.random().toString(36).substring(2, 15)
  }
  const addMessage = (message: ChatMessage) => {
    if (!message) return
    dispatch({ type: 'chat/pushMessage', payload: message })
    fetchStream(message.content)
  }
  return <div className="mt-4 mr-4 flex flex-1 flex-col">
    <div className="flex justify-between items-center">
      <div>{streamTxt}</div>
    </div>
    <div className="w-full min-w-full h-[100px] border border-solid border-gray-300 rounded-md">
      <textarea onChange={(e) => setInputValue(e.target.value)} className="min-w-full h-full p-2 rounded-md" placeholder="Type a message..." />
    </div>
    <div className="flex flex-1 justify-end">
      <Button onClick={() => addMessage({ role: 'user', id: genId(), content: inputValue })} className="bg-nav-500 block text-white p-2 px-4 mt-2 rounded-md">Send</Button>
    </div>
  </div>
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
            className={`p-2 px-4 rounded-md ${isUser ? 'self-end bg-[#fafafa] max-w-[60%] ' : 'max-w-[65%] self-start bg-nav-50'}`}
            key={message.id}
          >
            <p>{message.content}</p>
          </div>
        )
      })}
    </div>
    <InputBox />
  </>
}
