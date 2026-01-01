import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { generateResponse, speak, stopSpeaking } from "../../utils/chatbot";
import { Send, Volume2, VolumeX, Mic, MicOff, Bot, User } from "lucide-react";

export default function StudentChat() {
  const { currentStudent } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: input }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateResponse(input, language);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col border rounded-xl">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
            <div className={`p-3 rounded-lg ${m.role === "user" ? "bg-primary text-white" : "bg-muted"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <p className="text-sm text-muted-foreground">AI is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask about DSA..."
        />
        <button onClick={handleSend} className="bg-primary text-white px-4 rounded">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
