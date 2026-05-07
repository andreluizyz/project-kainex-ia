import { useState } from "react"
import Message from "./Message"

function Chat() {
  const [messages, setMessages] = useState([
    {
      text: "Olá! Eu sou a Kainex IA 🚀",
      isUser: false,
    },
  ])

  const [input, setInput] = useState("")

  function handleSend() {
    if (!input.trim()) return

    const newMessage = {
      text: input,
      isUser: true,
    }

    setMessages([...messages, newMessage])
    setInput("")
  }

  return (
    <div className="flex flex-col h-screen">

      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold">
          Kainex IA
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            isUser={msg.isUser}
          />
        ))}
      </div>

      <div className="p-6 border-t border-zinc-800 flex gap-4">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-4 outline-none"
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-semibold"
        >
          Enviar
        </button>
      </div>

    </div>
  )
}

export default Chat