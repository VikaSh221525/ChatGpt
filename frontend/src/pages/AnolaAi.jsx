import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaUser, FaPaperPlane, FaRobot, FaTrash, FaEdit, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios'

// API base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:3000/api'

// API functions
const chatAPI = {
    // Get all chats for the user
    getChats: async () => {
        try {
            const token = localStorage.getItem('token') // Assuming you store JWT token in localStorage
            const response = await axios.get(`${API_BASE_URL}/chat/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data.chats
        } catch (error) {
            console.error('Error fetching chats:', error)
            throw error
        }
    },

    // Create a new chat
    createChat: async (title) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_BASE_URL}/chat/`,
                { title },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            return response.data.chat
        } catch (error) {
            console.error('Error creating chat:', error)
            throw error
        }
    }
}

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

    const [currentChatId, setCurrentChatId] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
    const [isTyping, setIsTyping] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
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

    // Load chats on component mount
    useEffect(() => {
        fetchChats()
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
        if (!inputMessage.trim()) return

        // If no chat is active, start a new one
        if (!currentChatId) {
            startNewChat()
        }

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsTyping(true)

        // Simulate AI response with typing animation
        setTimeout(() => {
            setIsTyping(false)
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Thank you for your message! This is a simulated response from Anola AI. In a real implementation, this would be connected to your AI backend.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
        }, 2000)
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

            console.log('Chat created:', response.data)

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

    const selectChat = (chatId) => {
        setCurrentChatId(chatId)
        // In a real app, you'd load messages for this chat
        setMessages([])
        setIsTyping(false)
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
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 lg:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.type === 'ai' && (
                                        <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0'>
                                            <FaRobot className='text-white text-sm' />
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] lg:max-w-3xl ${message.type === 'user' ? 'order-1' : ''}`}>
                                        <div
                                            className={`p-3 lg:p-4 rounded-2xl ${message.type === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white ml-auto'
                                                : 'bg-white/10 text-white border border-purple-500/20'
                                                }`}
                                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}
                                        >
                                            {message.content}
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
                            ))}

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

                {/* Input Area */}
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
            </div>
        </div>
    )
}

export default AnolaAi