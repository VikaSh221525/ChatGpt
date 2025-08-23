import React, { useState } from 'react'
import { FaPlus, FaUser, FaPaperPlane, FaRobot, FaTrash, FaEdit, FaBars, FaTimes } from 'react-icons/fa'

const AnolaAi = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Hello! I\'m Anola, your AI assistant. How can I help you today?',
            timestamp: new Date()
        }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: 'Welcome Chat', lastMessage: 'Hello! I\'m Anola...', timestamp: new Date() },
        { id: 2, title: 'React Development', lastMessage: 'How to create components...', timestamp: new Date(Date.now() - 86400000) },
        { id: 3, title: 'JavaScript Tips', lastMessage: 'Best practices for...', timestamp: new Date(Date.now() - 172800000) }
    ])
    const [currentChatId, setCurrentChatId] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!inputMessage.trim()) return

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])

        // Simulate AI response
        setTimeout(() => {
            const aiMessage = {
                id: messages.length + 2,
                type: 'ai',
                content: 'Thank you for your message! This is a simulated response from Anola AI. In a real implementation, this would be connected to your AI backend.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
        }, 1000)

        setInputMessage('')
    }

    const startNewChat = () => {
        const newChatId = chatHistory.length + 1
        const newChat = {
            id: newChatId,
            title: 'New Chat',
            lastMessage: 'Started new conversation',
            timestamp: new Date()
        }
        setChatHistory(prev => [newChat, ...prev])
        setCurrentChatId(newChatId)
        setMessages([{
            id: 1,
            type: 'ai',
            content: 'Hello! I\'m Anola, your AI assistant. How can I help you today?',
            timestamp: new Date()
        }])
    }

    return (
        <div className='flex h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900'>
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-black/50 backdrop-blur-sm border-r border-purple-500/20 flex flex-col overflow-hidden`}>
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
                    <h3 className='text-gray-400 text-sm font-medium mb-3 px-2'
                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 500 }}>
                        Recent Chats
                    </h3>
                    {chatHistory.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
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
                </div>
            </div>

            {/* Main Chat Area */}
            <div className='flex-1 flex flex-col'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-purple-500/20 bg-black/30 backdrop-blur-sm'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className='p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5'
                        >
                            {sidebarOpen ? <FaTimes /> : <FaBars />}
                        </button>
                        <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center'>
                                <FaRobot className='text-white text-sm' />
                            </div>
                            <h1 className='text-xl font-bold text-white'
                                style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 700 }}>
                                Anola AI
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.type === 'ai' && (
                                <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0'>
                                    <FaRobot className='text-white text-sm' />
                                </div>
                            )}

                            <div className={`max-w-3xl ${message.type === 'user' ? 'order-1' : ''}`}>
                                <div
                                    className={`p-4 rounded-2xl ${message.type === 'user'
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
                </div>

                {/* Input Area */}
                <div className='p-6 border-t border-purple-500/20 bg-black/30 backdrop-blur-sm'>
                    <form onSubmit={handleSendMessage} className='flex gap-4 items-center'>
                        <div className='flex-1 relative'>
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder='Message Anola AI...'
                                className='w-full p-4 pr-12 bg-white/10 border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none min-h-[60px] max-h-32'
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
                            disabled={!inputMessage.trim()}
                            className='p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0'
                        >
                            <FaPaperPlane className='text-lg' />
                        </button>
                    </form>
                    <p className='text-xs text-gray-400 mt-2 text-center'
                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 300 }}>
                        Anola AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AnolaAi