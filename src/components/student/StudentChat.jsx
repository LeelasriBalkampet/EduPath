import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { speak, stopSpeaking, startListening, stopListening } from "../../utils/chatbot";
import { Send, Volume2, VolumeX, Mic, MicOff, Bot, User } from "lucide-react";

export default function StudentChat() {
  const { currentStudent } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState(null); // id of message currently being spoken
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const language = currentStudent?.preferredLanguage || "en";

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: "Hello! Ask me anything about Data Structures & Algorithms."
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening(recognitionRef.current);
    };
  }, []);

  // ─── Send message ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const { default: api } = await import("../../utils/api");
      let aiReply = "No response from AI.";

      const data = await api.chat.sendMessage(userMessage, language);

      if (data?.candidates?.length > 0) {
        const parts = data.candidates[0].content.parts;
        if (parts?.length > 0) aiReply = parts[0].text;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: aiReply }]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error.message || (typeof error === "string" ? error : error.error) || "An error occurred. Please try again.";
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: `Error: ${errorMessage}` }
      ]);
    }

    setIsTyping(false);
  };

  // ─── TTS ─────────────────────────────────────────────────────────────────────
  const handleSpeak = (msg) => {
    if (speakingId === msg.id) {
      // Stop current speech
      stopSpeaking();
      setSpeakingId(null);
    } else {
      // Stop any previous speech first
      stopSpeaking();
      setSpeakingId(msg.id);
      speak(msg.content, language, () => setSpeakingId(null));
    }
  };

  // ─── STT ─────────────────────────────────────────────────────────────────────
  const handleMicToggle = () => {
    if (isListening) {
      stopListening(recognitionRef.current);
      recognitionRef.current = null;
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current = startListening(
        (transcript) => {
          setInput(prev => (prev ? prev + " " + transcript : transcript));
        },
        () => {
          setIsListening(false);
          recognitionRef.current = null;
        },
        language
      );
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden" style={{ background: "var(--background, #fff)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: "var(--muted, #f5f5f5)" }}>
        <Bot size={20} className="text-primary" />
        <span className="font-semibold text-sm">DSA Tutor</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {language === "hi" ? "हिंदी" : language === "te" ? "తెలుగు" : "English"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-white" />
              </div>
            )}

            <div className={`group relative max-w-[75%]`}>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                  }`}
                dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, "<br>") }}
              />

              {/* TTS button — only for assistant messages */}
              {m.role === "assistant" && (
                <button
                  onClick={() => handleSpeak(m)}
                  title={speakingId === m.id ? "Stop speaking" : "Read aloud"}
                  className={`mt-1 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all
                    ${speakingId === m.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                >
                  {speakingId === m.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  {speakingId === m.id ? "Stop" : "Listen"}
                </button>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-muted-foreground flex gap-1 items-center">
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="px-4 py-1 flex items-center gap-2 text-xs text-red-500 bg-red-50 border-t border-red-100">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Listening… speak now
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t flex gap-2 items-center">
        {/* Mic button */}
        <button
          onClick={handleMicToggle}
          title={isListening ? "Stop listening" : "Speak your question"}
          className={`p-2 rounded-full transition-all flex-shrink-0 ${isListening
              ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
              : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={isListening ? "Listening…" : "Ask about DSA…"}
          disabled={isListening}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isListening}
          className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
