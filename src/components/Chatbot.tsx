"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot({ theme = "dark" }: { theme?: string }) {
  const d = theme === "dark";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm **AEGIS Assistant**. I have access to all cases and threat data on this dashboard. Ask me anything — threat summaries, specific cases, attacker IPs, recommendations." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like rendering (bold, bullet points, newlines)
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className={d ? "text-white" : "text-gray-900"}>{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });

      if (line.startsWith("- ")) {
        return <div key={i} className="pl-3 flex gap-1"><span className="text-blue-400">&#8226;</span><span>{parts.slice(0)}</span></div>;
      }
      return <div key={i}>{parts}</div>;
    });
  };

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          open
            ? d ? "bg-gray-700" : "bg-gray-300"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 w-[420px] h-[560px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
              d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b flex items-center gap-3 ${d ? "border-gray-700" : "border-gray-200"}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${d ? "text-white" : "text-gray-900"}`}>AEGIS Assistant</h3>
                <p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>AI-powered threat analyst</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : d
                          ? "bg-gray-800 text-gray-300 rounded-bl-md border border-gray-700"
                          : "bg-gray-100 text-gray-700 rounded-bl-md border border-gray-200"
                    }`}
                  >
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 rounded-2xl rounded-bl-md border ${d ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-2 rounded-full ${d ? "bg-gray-500" : "bg-gray-400"}`}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            <div className={`px-4 py-2 flex gap-2 overflow-x-auto border-t ${d ? "border-gray-800" : "border-gray-100"}`}>
              {["Status overview", "Critical cases", "Top attackers", "What to prioritize?"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition-colors ${
                    d ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={`px-4 py-3 border-t ${d ? "border-gray-700" : "border-gray-200"}`}>
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2 ${d ? "bg-gray-800" : "bg-gray-100"}`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about threats, cases, IPs..."
                  className={`flex-1 bg-transparent text-sm outline-none placeholder-gray-500 ${d ? "text-white" : "text-gray-900"}`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
