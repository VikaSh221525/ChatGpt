import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaUser, FaPaperPlane, FaRobot, FaTrash, FaEdit, FaBars, FaTimes, FaCopy } from 'react-icons/fa';
import axios from 'axios'
import { io } from "socket.io-client";

// Component to format AI messages with proper styling
const FormattedMessage = ({ content, type }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatText = (text) => {
        // First, handle code blocks properly
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        // Extract code blocks and regular text
        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index)
                });
            }

            // Add code block
            parts.push({
                type: 'code',
                language: match[1] || '',
                content: match[2].trim()
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex)
            });
        }

        // If no code blocks found, treat entire text as regular text
        if (parts.length === 0) {
            parts.push({
                type: 'text',
                content: text
            });
        }

        return parts.map((part, partIndex) => {
            if (part.type === 'code') {
                return (
                    <div key={partIndex} className="my-4 relative group">
                        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                            {/* Code header with language and copy button */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-xs text-gray-300 font-medium ml-2">
                                        {part.language || 'code'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(part.content);
                                        // You could add a toast notification here
                                    }}
                                    className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-700 flex items-center gap-1.5"
                                >
                                    <FaCopy className="text-xs" />
                                    Copy
                                </button>
                            </div>
                            {/* Code content */}
                            <div className="p-4 overflow-x-auto code-block bg-gray-900">
                                <pre className="text-sm leading-relaxed">
                                    <code className="text-gray-100 whitespace-pre block">
                                        {part.content}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                );
            }

            // Handle regular text formatting
            const paragraphs = part.content.split('\n\n');

            return paragraphs.map((paragraph, pIndex) => {
                if (!paragraph.trim()) return null;

                const lines = paragraph.split('\n');

                return (
                    <div key={`${partIndex}-${pIndex}`} className={pIndex > 0 ? 'mt-4' : ''}>
                        {lines.map((line, lIndex) => {
                            // Check for different line types
                            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                                // Bullet points
                                return (
                                    <div key={lIndex} className="flex items-start gap-2 my-1">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                                    </div>
                                );
                            } else if (line.match(/^\d+\./)) {
                                // Numbered lists
                                return (
                                    <div key={lIndex} className="flex items-start gap-2 my-1">
                                        <span className="text-purple-400 font-medium">{line.match(/^\d+\./)[0]}</span>
                                        <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                    </div>
                                );
                            } else if (line.trim().startsWith('#')) {
                                // Headers
                                const headerLevel = line.match(/^#+/)[0].length;
                                const headerText = line.replace(/^#+\s*/, '');
                                const headerClass = headerLevel === 1 ? 'text-xl font-bold text-white mt-4 mb-2' :
                                    headerLevel === 2 ? 'text-lg font-semibold text-white mt-3 mb-2' :
                                        'text-base font-medium text-white mt-2 mb-1';

                                return (
                                    <div key={lIndex} className={headerClass}>
                                        {headerText}
                                    </div>
                                );
                            } else if (line.includes('`') && line.split('`').length > 2) {
                                // Inline code
                                const parts = line.split('`');
                                return (
                                    <div key={lIndex} className={lIndex > 0 ? 'mt-1' : ''}>
                                        {parts.map((part, partIndex) =>
                                            partIndex % 2 === 1 ? (
                                                <code key={partIndex} className="bg-gray-800/80 text-emerald-400 px-2 py-0.5 rounded-md text-sm font-mono border border-gray-700">
                                                    {part}
                                                </code>
                                            ) : (
                                                <span key={partIndex}>{part}</span>
                                            )
                                        )}
                                    </div>
                                );
                            } else if (line.trim() === '') {
                                // Empty lines
                                return <div key={lIndex} className="h-2"></div>;
                            } else {
                                // Regular text with bold/italic formatting
                                let formattedLine = line;

                                // Bold text **text**
                                formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');

                                // Italic text *text*
                                formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

                                return (
                                    <div
                                        key={lIndex}
                                        className={lIndex > 0 ? 'mt-1' : ''}
                                        dangerouslySetInnerHTML={{ __html: formattedLine }}
                                    />
                                );
                            }
                        })}
                    </div>
                );
            }).filter(Boolean);
        }).flat();
    };

    if (type === 'user') {
        return <div className="whitespace-pre-wrap">{content}</div>;
    }

    return (
        <div className="relative group">
            <div className="prose prose-invert max-w-none">
                {formatText(content)}
            </div>
            {/* Copy button for AI messages */}
            <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                title="Copy message"
            >
                {copied ? (
                    <span className="text-xs">✓</span>
                ) : (
                    <FaCopy className="text-xs" />
                )}
            </button>
        </div>
    );
};

const TypingAnimation = () => (
    <div className="flex space-x-1 p-4">
        <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
    </div>
)

const AnolaAi = () => {
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [socket, setSocket] = useState(null)
    const [socketConnected, setSocketConnected] = useState(false)

    const [currentChatId, setCurrentChatId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
    const [isTyping, setIsTyping] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)

    // Scroll to bottom function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Fetch chats from backend
    const fetchChats = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('http://localhost:3000/api/chat/', {
                withCredentials: true
            })

            console.log('Chats fetched:', response.data)

            const chats = response.data.chats.map(chat => ({
                id: chat._id,
                title: chat.title,
                lastMessage: 'Click to view conversation',
                timestamp: new Date(chat.lastActivity)
            }))

            setChatHistory(chats.reverse())
        } catch (error) {
            console.error('Failed to fetch chats:', error)
            setError('Failed to load chats. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Load chats on component mount and initialize socket
    useEffect(() => {
        fetchChats();

        const tempSocket = io("http://localhost:3000", {
            withCredentials: true
        })

        // Socket event listeners
        tempSocket.on("connect", () => {
            console.log("Connected to server-socket");
            setSocketConnected(true)
        })

        tempSocket.on("ai-response", (response) => {
            console.log("AI message received: ", response);
            setIsTyping(false)

            // Add AI response to messages
            const aiMessage = {
                id: Date.now(),
                type: 'ai',
                content: response.content,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
        })

        tempSocket.on("ai-error", (error) => {
            console.error("AI Error:", error);
            setIsTyping(false)
            alert("Error: " + error.message)
        })

        tempSocket.on("disconnect", () => {
            console.log("Disconnected from server");
            setSocketConnected(false)
        })

        tempSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setSocketConnected(false)
        })

        setSocket(tempSocket);

        // Cleanup on unmount
        return () => {
            tempSocket.disconnect()
        }
    }, [])

    // Auto scroll when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Handle window resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!inputMessage.trim() || !currentChatId) return

        // Check if socket is connected
        if (!socket || !socket.connected) {
            alert("Not connected to server. Please refresh the page.")
            return
        }

        const messageContent = inputMessage.trim()

        // Add user message to UI immediately
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageContent,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsTyping(true)

        // Send message to AI via socket
        socket.emit("ai-message", {
            chat: currentChatId,
            content: messageContent
        })
    }

    const startNewChat = async () => {
        const title = window.prompt('Enter a title for your new chat:', 'New Chat')

        // If user cancels the prompt or enters empty title, don't create chat
        if (!title || title.trim() === '') {
            return
        }

        try {
            const response = await axios.post('http://localhost:3000/api/chat/', {
                title: title.trim()
            }, { withCredentials: true })

            // console.log('Chat created:', response.data)

            // Use the actual response data from backend
            const newChat = {
                id: response.data.chat._id,
                title: response.data.chat.title,
                lastMessage: 'Started new conversation',
                timestamp: new Date(response.data.chat.lastActivity)
            }

            setChatHistory(prev => [newChat, ...prev])
            setCurrentChatId(response.data.chat._id)
            setMessages([])
            setIsTyping(false)
        } catch (error) {
            console.error('Failed to create chat:', error)
            alert('Failed to create chat. Please try again.')
        }
    }

    const selectChat = async (chatId) => {
        setCurrentChatId(chatId)
        setMessages([]) // Clear current messages
        setIsTyping(false)
        setMessagesLoading(true)

        try {
            // Load messages for this chat
            const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, {
                withCredentials: true
            })

            console.log('Messages loaded:', response.data)

            // Convert backend messages to frontend format
            const loadedMessages = response.data.messages.map(msg => ({
                id: msg._id,
                type: msg.role === 'user' ? 'user' : 'ai',
                content: msg.content,
                timestamp: new Date(msg.createdAt)
            }))

            setMessages(loadedMessages)
        } catch (error) {
            console.error('Failed to load messages:', error)
            // Don't show error to user, just keep empty messages
        } finally {
            setMessagesLoading(false)
        }

        // Close sidebar on mobile after selection
        if (window.innerWidth <= 768) {
            setSidebarOpen(false)
        }
    }

    return (
        <div className='flex h-screen bg-gradient-to-br from-black via-gray-950 to-gray-950 overflow-hidden'>
            {/* Mobile Overlay */}
            {sidebarOpen && window.innerWidth <= 768 && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80 lg:w-80 md:w-72 sm:w-64' : 'w-0'} ${window.innerWidth <= 768 ? 'fixed left-0 top-0 h-full z-50' : 'relative'} transition-all duration-300 bg-black/50 backdrop-blur-sm border-r border-purple-500/20 flex flex-col overflow-hidden`}>
                {/* Sidebar Header */}
                <div className='p-4 border-b border-purple-500/20'>
                    <button
                        onClick={startNewChat}
                        className='w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 font-medium'
                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 500 }}
                    >
                        <FaPlus className='text-sm' />
                        New Chat
                    </button>
                </div>

                {/* Chat History */}
                <div className='flex-1 overflow-y-auto p-4 space-y-2'>
                    <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-gray-400 text-sm font-medium px-2'
                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 500 }}>
                            Recent Chats
                        </h3>
                        {loading && (
                            <div className='text-purple-400 text-xs'>Loading...</div>
                        )}
                    </div>

                    {error && (
                        <div className='p-3 bg-red-500/20 border border-red-500/30 rounded-xl'>
                            <p className='text-red-400 text-sm'>{error}</p>
                            <button
                                onClick={fetchChats}
                                className='text-red-300 hover:text-red-200 text-xs mt-1 underline'
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && chatHistory.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => selectChat(chat.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${currentChatId === chat.id
                                ? 'bg-purple-600/20 border border-purple-500/30'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className='flex items-center justify-between'>
                                <div className='flex-1 min-w-0'>
                                    <h4 className='text-white text-sm font-medium truncate'
                                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 500 }}>
                                        {chat.title}
                                    </h4>
                                    <p className='text-gray-400 text-xs truncate mt-1'>
                                        {chat.lastMessage}
                                    </p>
                                </div>
                                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <button className='p-1 text-gray-400 hover:text-white transition-colors'>
                                        <FaEdit className='text-xs' />
                                    </button>
                                    <button className='p-1 text-gray-400 hover:text-red-400 transition-colors'>
                                        <FaTrash className='text-xs' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {!loading && !error && chatHistory.length === 0 && (
                        <div className='text-center py-8'>
                            <p className='text-gray-400 text-sm'>No chats yet</p>
                            <p className='text-gray-500 text-xs mt-1'>Create your first chat to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className='flex-1 flex flex-col'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/30 backdrop-blur-sm'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className='p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 lg:hidden'
                        >
                            <FaBars />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className='p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 hidden lg:block'
                        >
                            {sidebarOpen ? <FaTimes /> : <FaBars />}
                        </button>
                        <h1 className='text-lg lg:text-xl font-bold text-white leading-none mt-1'
                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 900 }}>
                            Anola AI
                        </h1>
                        <div className={`text-xs px-2 py-1 rounded-full ${socketConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {socketConnected ? '● Connected' : '● Disconnected'}
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={messagesContainerRef}
                    className='flex-1 overflow-y-auto'
                >
                    {messages.length === 0 && !currentChatId ? (
                        // Welcome Screen
                        <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                            <h2 className='text-4xl md:text-5xl font-black text-white mb-4 tracking-tight'
                                style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 900 }}>
                                Welcome to <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600'>Anola AI</span>
                            </h2>
                            <p className='text-gray-300 text-lg md:text-xl max-w-2xl mb-8'
                                style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}>
                                Your intelligent AI companion ready to assist you with any questions or tasks. Start a conversation below!
                            </p>
                        </div>
                    ) : (
                        // Chat Messages
                        <div className='p-4 lg:p-6 space-y-6'>
                            {messagesLoading ? (
                                <div className='flex justify-center items-center py-8'>
                                    <div className='text-purple-400'>
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <p className='text-sm mt-2 text-center'>Loading messages...</p>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className='flex justify-center items-center py-8'>
                                    <p className='text-gray-400 text-center'>
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 lg:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.type === 'ai' && (
                                            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-purple-400/30'>
                                                <FaRobot className='text-white text-base' />
                                            </div>
                                        )}

                                        <div className={`max-w-[85%] lg:max-w-4xl ${message.type === 'user' ? 'order-1' : ''}`}>
                                            <div
                                                className={`relative p-4 lg:p-5 rounded-2xl ${message.type === 'user'
                                                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white ml-auto shadow-lg'
                                                    : 'bg-gray-800/50 text-gray-100 border border-gray-700/50 shadow-xl backdrop-blur-sm'
                                                    }`}
                                                style={{
                                                    fontFamily: 'Agrandir, sans-serif',
                                                    fontWeight: 400,
                                                    lineHeight: '1.6'
                                                }}
                                            >
                                                <FormattedMessage content={message.content} type={message.type} />
                                            </div>
                                            <div className={`text-xs text-gray-400 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>

                                        {message.type === 'user' && (
                                            <div className='w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 order-2'>
                                                <FaUser className='text-white text-sm' />
                                            </div>
                                        )}
                                    </div>
                                )))}

                            {/* Typing Animation */}
                            {isTyping && (
                                <div className="flex gap-3 lg:gap-4 justify-start">
                                    <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0'>
                                        <FaRobot className='text-white text-sm' />
                                    </div>
                                    <div className="bg-white/10 border border-purple-500/20 rounded-2xl">
                                        <TypingAnimation />
                                    </div>
                                </div>
                            )}

                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area - Only show when chat is active */}
                {currentChatId ? (
                    <div className='p-4 lg:p-6 border-t border-purple-500/20 bg-black/30 backdrop-blur-sm'>
                        <form onSubmit={handleSendMessage} className='flex gap-3 lg:gap-4 items-center'>
                            <div className='flex-1 relative'>
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder='Message Anola AI...'
                                    className='w-full p-3 lg:p-4 bg-white/10 border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none min-h-[50px] lg:min-h-[60px] max-h-32'
                                    style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage(e)
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type='submit'
                                disabled={!inputMessage.trim() || isTyping}
                                className='p-3 lg:p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0'
                            >
                                <FaPaperPlane className='text-sm lg:text-lg' />
                            </button>
                        </form>
                        <p className='text-xs text-gray-400 mt-2 text-center px-2'
                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 300 }}>
                            Anola AI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                ) : (
                    // Placeholder when no chat is selected
                    <div className='p-4 lg:p-6 border-t border-purple-500/20 bg-black/30 backdrop-blur-sm'>
                        <div className='text-center py-4'>
                            <p className='text-gray-400 text-sm mb-2'
                                style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}>
                                Select a chat or create a new one to start messaging
                            </p>
                            <button
                                onClick={startNewChat}
                                className='px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 text-sm font-medium'
                                style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 500 }}
                            >
                                Start New Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AnolaAi