function Message({ text, isUser }) {
  return (
    <div
      className={`w-full flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] p-4 rounded-2xl mb-4 ${
          isUser
            ? "bg-blue-600"
            : "bg-zinc-800"
        }`}
      >
        {text}
      </div>
    </div>
  )
}

export default Message