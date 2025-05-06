import { useEffect, useRef, useState } from "react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function ChatPremiumGold() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToN8N = async (message: string) => {
    try {
      const response = await fetch(
        "https://n8n-webhooks-s1.staybuy.site/webhook/ac8d4800-b593-4392-a07a-78caacc7955e/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: message }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem para o n8n");
      }

      const data = await response.json();

      // Supondo que a resposta do n8n seja { reply: "texto da resposta" }
      if (data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "Sem resposta do assistente.", sender: "bot" },
        ]);
      }
    } catch (error) {
      console.error("Erro ao conectar ao n8n:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Desculpe, ocorreu um erro ao conectar. Tente novamente mais tarde.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInputValue("");
    sendMessageToN8N(userMessage);
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
}
