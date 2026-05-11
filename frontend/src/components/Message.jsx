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
            ? "bg-green-700"
            : "bg-zinc-800"
        }`}
      >
        <div className="whitespace-pre-wrap leading-6">{text}</div>
      </div>
    </div>
  )
}

export default Message