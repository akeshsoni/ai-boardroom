'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender: 'You' | 'Claude' | 'ChatGPT';
  text: string;
  timestamp: string;
}

interface Mention {
  id: string;
  display: string;
  name: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mentions: Mention[] = [
    { id: 'claude', display: '@claude', name: 'Claude' },
    { id: 'gpt', display: '@gpt', name: 'ChatGPT' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect @ mentions for autocomplete
  useEffect(() => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = inputValue.slice(lastAtIndex + 1);
      const hasSpaceAfter = textAfterAt.includes(' ');
      
      if (!hasSpaceAfter) {
        setMentionFilter(textAfterAt.toLowerCase());
        setShowMentions(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [inputValue]);

  const getFilteredMentions = () => {
    return mentions.filter(mention => 
      mention.id.includes(mentionFilter) || 
      mention.name.toLowerCase().includes(mentionFilter)
    );
  };

  const insertMention = (mention: Mention) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const newValue = inputValue.slice(0, lastAtIndex) + mention.display + ' ';
    setInputValue(newValue);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const parseMessage = (text: string) => {
    const lowerText = text.toLowerCase();
    const mentionsClaude = lowerText.includes('@claude');
    const mentionsGPT = lowerText.includes('@gpt') || lowerText.includes('@chatgpt');
    
    return {
      mentionsClaude,
      mentionsChatGPT: mentionsGPT,
      bothMentioned: mentionsClaude && mentionsGPT,
      neitherMentioned: !mentionsClaude && !mentionsGPT
    };
  };

  const buildConversationHistory = () => {
    return messages.map(msg => ({
      role: msg.sender === 'You' ? 'user' : 'assistant',
      content: `[${msg.sender}]: ${msg.text}`
    }));
  };

  const callClaudeAPI = async (userMessage: string) => {
    const conversationHistory = buildConversationHistory();

    try {
      const response = await fetch('/api/chat/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Claude');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Claude API error:', error);
      return "Sorry, I'm having trouble connecting right now.";
    }
  };

  const callChatGPTAPI = async (userMessage: string) => {
    const conversationHistory = buildConversationHistory();

    try {
      const response = await fetch('/api/chat/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from ChatGPT');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('ChatGPT API error:', error);
      return "Sorry, I'm having trouble connecting right now.";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    
    const newUserMessage: Message = {
      id: Date.now(),
      sender: 'You',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    setIsLoading(true);

    const { mentionsClaude, mentionsChatGPT, bothMentioned, neitherMentioned } = parseMessage(userMessage);

    try {
      if (bothMentioned || neitherMentioned) {
        const [claudeResponse, chatGPTResponse] = await Promise.all([
          callClaudeAPI(userMessage),
          callChatGPTAPI(userMessage)
        ]);

        setMessages(prev => [...prev, 
          {
            id: Date.now() + 1,
            sender: 'Claude',
            text: claudeResponse,
            timestamp: new Date().toLocaleTimeString()
          },
          {
            id: Date.now() + 2,
            sender: 'ChatGPT',
            text: chatGPTResponse,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } else if (mentionsClaude) {
        const claudeResponse = await callClaudeAPI(userMessage);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'Claude',
          text: claudeResponse,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else if (mentionsChatGPT) {
        const chatGPTResponse = await callChatGPTAPI(userMessage);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ChatGPT',
          text: chatGPTResponse,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showMentions) {
      const filteredMentions = getFilteredMentions();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMentions.length > 0) {
          insertMention(filteredMentions[selectedMentionIndex]);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSenderColor = (sender: string) => {
    switch(sender) {
      case 'You': return 'bg-blue-100 border-blue-300';
      case 'Claude': return 'bg-amber-100 border-amber-300';
      case 'ChatGPT': return 'bg-emerald-100 border-emerald-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getSenderIcon = (sender: string) => {
    switch(sender) {
      case 'You': return '👤';
      case 'Claude': return '🤖';
      case 'ChatGPT': return '💬';
      default: return '•';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-800">AI Boardroom</h1>
        <p className="text-sm text-slate-600 mt-1">
          Use @claude or @gpt to direct questions, or ask both at once
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-12">
            <p className="text-lg">Welcome to the AI Boardroom! 🎯</p>
            <p className="text-sm mt-2">Start the conversation below...</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl w-full border-2 rounded-lg p-4 ${getSenderColor(message.sender)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getSenderIcon(message.sender)}</span>
                <span className="font-semibold text-slate-800">{message.sender}</span>
                <span className="text-xs text-slate-500 ml-auto">{message.timestamp}</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-2xl w-full border-2 rounded-lg p-4 bg-gray-100 border-gray-300">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-slate-600">AIs are thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex gap-3 max-w-4xl mx-auto relative">
          {/* Mention Autocomplete Dropdown */}
          {showMentions && getFilteredMentions().length > 0 && (
            <div className="absolute bottom-full mb-2 left-0 bg-white border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden z-10">
              {getFilteredMentions().map((mention, index) => (
                <div
                  key={mention.id}
                  onClick={() => insertMention(mention)}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
                    index === selectedMentionIndex 
                      ? 'bg-blue-100' 
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">
                    {mention.id === 'claude' ? '🤖' : '💬'}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800">{mention.name}</div>
                    <div className="text-xs text-slate-500">{mention.display}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here... Use @claude or @gpt to direct your question"
            className="flex-1 border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
