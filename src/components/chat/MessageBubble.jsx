const MessageBubble = ({ message, isUser }) => {
    return (
        <div id={`message-container-${isUser ? 'user' : 'ai'}`}>
            <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
                <p className="message-text">{message.content}</p>
                <div className="message-time">
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