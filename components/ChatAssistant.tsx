
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Chat } from '@google/genai';
import { DisplayMessage } from '../types';
import { ai } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { Spinner } from './icons/Spinner';

const ChatAssistant: React.FC = () => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = () => {
            const chat = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    systemInstruction: "You are a friendly and knowledgeable gardening assistant. Your name is 'Bloom'. Answer questions about plants, gardening techniques, pest control, and anything related to horticulture. Keep your answers concise and helpful."
                }
            });
            setChatSession(chat);
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chatSession || isLoading) return;

        const userMessage: DisplayMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const stream = await chatSession.sendMessageStream({ message: userInput });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { sender: 'model', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    modelResponse += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = modelResponse;
                        return newMessages;
                    });
                }
            }
        } catch (err) {
            setError("Sorry, I couldn't get a response. Please try again.");
            // remove the empty model message placeholder
             setMessages(prev => prev.slice(0, prev.length -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[70vh]">
            <h2 className="text-3xl font-bold text-gray-700 mb-4 text-center">Chat with Bloom</h2>
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length-1]?.sender === 'user' && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                           <div className="flex items-center justify-center">
                               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:-0.15s] mx-1"></div>
                               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>

            {error && <p className="text-red-500 text-center mb-2">{error}</p>}

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 border-t pt-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your garden..."
                    className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? <Spinner /> : <SendIcon className="w-6 h-6" />}
                </button>
            </form>
        </div>
    );
};

export default ChatAssistant;
