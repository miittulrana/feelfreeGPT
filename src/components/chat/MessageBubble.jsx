const MessageBubble = ({ message, isUser }) => {
    return (
      <div 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in mb-4`}
      >
        <div
          className={`message-bubble max-w-[80%] rounded-2xl p-4 ${
            isUser 
              ? 'chat-message-user rounded-br-none' 
              : 'chat-message-ai rounded-bl-none'
          }`}
        >
          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          <div 
            className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </div>
      </div>
    );
  };
  
  export default MessageBubble;