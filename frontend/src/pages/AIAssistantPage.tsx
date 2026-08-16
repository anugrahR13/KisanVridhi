import React, { useState } from 'react';
import { assistantService } from '../services/appServices';
import { ChatMessage } from '../types';
import { Bot, Send, BookOpen, Tractor, User, HelpCircle } from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Ask KisanVridhi, your AI Sustainable Farming Assistant. What do you want to know about your farm today?'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'What should I do today?',
    'Should I irrigate my Wheat crop?',
    'How do I prepare organic Jeevamrut?',
    'What sustainable IPM controls whiteflies?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await assistantService.chat(textToSend);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.reply,
        sources: res.sources,
        farm_context_used: res.farm_context_used
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an issue fetching agricultural advisories. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-green-700" /> Ask KisanVridhi AI Assistant
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Grounded agricultural advisor referencing verified ICAR, KVK, and FAO sustainable farming guidance.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-green-700" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[550px] overflow-hidden shadow-xs">
        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`p-2 rounded text-xs shrink-0 ${
                msg.role === 'user'
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-green-700" />}
              </div>

              <div className={`max-w-xl p-3 rounded text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-green-700 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-900 font-medium'
              }`}>
                {msg.farm_context_used && (
                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                    <Tractor className="w-3 h-3 text-green-700" />
                    <span>Context: {msg.farm_context_used}</span>
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <span className="font-bold text-amber-800 uppercase text-[10px] flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-600" /> Reference Sources ({msg.sources.length})
                    </span>
                    <div className="space-y-1">
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px]">
                          <p className="font-bold text-slate-900">{src.title}</p>
                          <p className="text-slate-500">{src.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold p-2">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-green-700 border-t-transparent" />
              <span>Retrieving grounded agricultural advisories...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Ask KisanVridhi about crops, soil, pests, or irrigation..."
              className="flex-1 px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-green-700 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-green-700 hover:bg-green-800 text-white rounded shadow-xs disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
