import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const GovAIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'agent', content: 'Secure Channel Established. I am ready to query the ledger.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg.content })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'agent', content: data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'agent', content: "Error: Uplink failed." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all ${isOpen ? 'hidden' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
            >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <Bot className="w-6 h-6" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-96 h-[500px] z-50 bg-[#0a0a0a] border border-amber-500/30 rounded-xl shadow-2xl flex flex-col font-mono overflow-hidden backdrop-blur-sm"
                    >
                        {/* Header */}
                        <div className="bg-slate-900/80 p-3 border-b border-white/10 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(false)}>
                            <div className="flex items-center space-x-2 text-amber-500">
                                <Terminal className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">GovIntel Local Node</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/50" ref={scrollRef}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded p-3 text-xs leading-relaxed border ${msg.role === 'user'
                                            ? 'bg-amber-900/20 border-amber-500/30 text-amber-100'
                                            : 'bg-slate-900 border-slate-700 text-slate-300'
                                        }`}>
                                        {msg.role === 'agent' ? (
                                            <div className="prose prose-invert prose-xs max-w-none">
                                                {/* Simple formatting for table-like output */}
                                                <pre className="whitespace-pre-wrap font-mono text-[10px] bg-transparent p-0 m-0 border-0">{msg.content}</pre>
                                            </div>
                                        ) : msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-900 border border-slate-700 rounded p-2 flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
                            <input
                                autoFocus
                                className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                                placeholder="Query ledger (e.g., 'sanctioned procurement')..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black p-2 rounded transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GovAIChat;
