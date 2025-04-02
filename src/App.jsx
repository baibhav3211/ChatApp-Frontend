import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import EmojiPicker from 'emoji-picker-react';
import { FaSmile } from 'react-icons/fa';

const socket = io('http://localhost:3000');

const App = () => {
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Reference to the chat box div for auto-scrolling
    const chatBoxRef = useRef(null);

    useEffect(() => {
        socket.on('joined', (room) => {
            setRoomId(room);
            setConnected(true);
        });

        socket.on('receive_message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        return () => {
            socket.off('joined');
            socket.off('receive_message');
        };
    }, []);

    useEffect(() => {
        // Auto-scroll to the bottom when messages update
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const joinQueue = () => {
        socket.emit('join_queue');
    };

    const sendMessage = () => {
      if (message.trim() !== '' && connected) {
          const messageData = { roomId, message, sender: socket.id };
          
          socket.emit('send_message', messageData); // Emit only, do not add to state directly
  
          setMessage('');
      }
  };

    const handleEmojiClick = (emojiObject) => {
        setMessage(prevMessage => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="col-md-6">
                <div className="card shadow">
                    <div className="card-body">
                        {!connected ? (
                            <div className="text-center">
                                <h3 className="mb-4">Welcome to Chat App</h3>
                                <button className="btn btn-primary w-100" onClick={joinQueue}>Join</button>
                            </div>
                        ) : (
                            <>
                                <div className="card mt-3 mb-3">
                                    <div 
                                        ref={chatBoxRef} // Attach the ref here
                                        className="card-body" 
                                        style={{ height: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
                                    >
                                        {messages.map((msg, index) => (
                                            <div 
                                                key={index} 
                                                className={`d-flex mb-2 ${msg.sender === socket.id ? 'justify-content-end' : 'justify-content-start'}`}
                                            >
                                                <div className={`p-2 rounded ${msg.sender === socket.id ? 'bg-primary text-white' : 'bg-light'}`}>
                                                    {msg.sender === socket.id ? `You: ${msg.message}` : `Stranger: ${msg.message}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {showEmojiPicker && (
                                    <div className="mb-2">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                                
                                <div className="input-group mb-3">
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <FaSmile />
                                    </button>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter your message"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                    />
                                    <button className="btn btn-success" onClick={sendMessage}>Send</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
