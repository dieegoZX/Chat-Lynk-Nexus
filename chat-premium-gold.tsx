"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircleQuestion, Settings, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import AnimatedBackground from "./components/animated-background"
import { useMediaQuery } from "./hooks/use-media-query"
import HelpModal from "./components/help-modal"
import SettingsModal from "./components/settings-modal"

interface Message {
  text: string
  sender: "user" | "bot"
  time: string
}

interface ChatSettings {
  soundEnabled: boolean
  darkMode: boolean
  fontSize: "small" | "medium" | "large"
}

export default function ChatPremiumGold() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [settings, setSettings] = useState<ChatSettings>({
    soundEnabled: true,
    darkMode: true,
    fontSize: "medium",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
    return () => {
      if (notificationSound.current) {
        notificationSound.current = null
      }
    }
  }, [])

  // Play notification sound when new message arrives
  const playNotificationSound = () => {
    if (settings.soundEnabled && notificationSound.current) {
      notificationSound.current.currentTime = 0
      notificationSound.current.play().catch((e) => console.log("Error playing sound:", e))
    }
  }

  // Webhook URL for message processing
  const webhookUrl = "https://n8n-webhooks-s1.staybuy.site/webhook/ac8d4800-b593-4392-a07a-78caacc7955e/chat"

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 50)
  }

  // Add welcome message on component mount
  useEffect(() => {
    setTimeout(() => {
      const welcomeMessage: Message = {
        text: "welcome",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([welcomeMessage])
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 500)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Format links in text
  const formatText = (text: string) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" class="text-purple-400 underline hover:text-purple-300 transition-colors">${url}</a>`
    })
  }

  // Send message to webhook and process response
  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setShowQuickReplies(false)
    setIsTyping(true)

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: text }),
      })

      setIsTyping(false)

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
      }

      const data = await res.json()

      // Extract response text
      let replyText = null

      if (data.resposta) {
        replyText = data.resposta
      } else if (data.mensagem) {
        replyText = data.mensagem
      } else if (data.text) {
        replyText = data.text
      } else if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        const keys = Object.keys(data)
        if (
          keys.length > 0 &&
          Array.isArray(data[keys[0]]) &&
          data[keys[0]].length > 0 &&
          typeof data[keys[0]][0] === "object" &&
          data[keys[0]][0] !== null &&
          data[keys[0]][0].hasOwnProperty("output")
        ) {
          replyText = data[keys[0]][0].output
        } else if (keys.length === 1) {
          replyText = keys[0]
        }
      }

      if (replyText === null || typeof replyText === "object") {
        replyText = JSON.stringify(data)
        console.warn("Couldn't extract a simple text response. Displaying raw data:", data)
      }

      if (typeof replyText === "string") {
        replyText = replyText.replace(/\\n$/, "").trim()
        // Decode HTML entities
        const tempEl = document.createElement("textarea")
        tempEl.innerHTML = replyText
        replyText = tempEl.value
      }

      // Add bot message with a small delay
      setTimeout(() => {
        const botMessage: Message = {
          text: replyText,
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, botMessage])
        playNotificationSound()
      }, 300)
    } catch (err) {
      console.error("Error sending/processing message:", err)
      setIsTyping(false)

      // Add error message with a small delay
      setTimeout(() => {
        const errorMessage: Message = {
          text: "Desculpe, ocorreu um erro ao conectar. Tente novamente mais tarde.",
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, errorMessage])
        playNotificationSound()
      }, 300)
    }
  }

  // Handle quick reply click
  const handleQuickReply = (text: string) => {
    sendMessage(text)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  // Handle settings change
  const handleSettingsChange = (newSettings: ChatSettings) => {
    setSettings(newSettings)
    // Save settings to localStorage if needed
    // localStorage.setItem('chatSettings', JSON.stringify(newSettings))
  }

  // Get font size class based on settings
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-xs sm:text-sm"
      case "large":
        return "text-base sm:text-lg"
      default:
        return "text-sm sm:text-base"
    }
  }

  return (
    <div
      className={`font-sans relative text-white flex justify-center items-center min-h-screen p-2 sm:p-4 box-border overflow-hidden ${settings.darkMode ? "bg-slate-900" : "bg-slate-100"}`}
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-md w-full max-w-[100%] sm:max-w-[90%] md:max-w-[650px] h-[90vh] sm:h-[85vh] max-h-[100vh] sm:max-h-[700px] flex flex-col rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.25)] border border-indigo-500/30 z-10"
      >
        {/* Chat Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center border-b border-indigo-500/30">
          <motion.div
            className="flex items-center font-semibold text-base sm:text-lg"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="bg-white/10 backdrop-blur-sm text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mr-3 flex-shrink-0 border border-white/20 overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mulher-95jZ0Pn3q2YullkIAgX3Q5LjIWOM9r.png"
                alt="Sara Lima"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="flex items-center gap-2">
              Sara Lima
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </span>
          </motion.div>
          <motion.div
            className="flex gap-2 sm:gap-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-full p-2.5 sm:p-2 text-white text-xl cursor-pointer transition-all duration-300"
              title="Ajuda"
              onClick={() => setIsHelpModalOpen(true)}
            >
              <MessageCircleQuestion className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
            <button
              className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-full p-2.5 sm:p-2 text-white text-xl cursor-pointer transition-all duration-300"
              title="Configurações"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Settings className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        </header>

        {/* Chat Messages */}
        <div
          ref={chatMessagesRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-transparent custom-scrollbar"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`max-w-[90%] break-words p-4 rounded-2xl leading-relaxed relative ${
                  message.sender === "user"
                    ? "self-end bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm ml-auto shadow-lg shadow-indigo-500/20"
                    : "self-start bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm text-white rounded-bl-sm mr-auto shadow-lg shadow-slate-700/20 border border-slate-600/30"
                }`}
              >
                {message.text === "welcome" ? (
                  <>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <strong className="font-semibold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-[1em] sm:text-[1.05em]">
                        👋 Olá! Sou Sara Lima, assistente da Lynk Nexus.
                      </strong>
                    </motion.p>
                    <motion.p
                      className={`mb-3 text-slate-200 ${getFontSizeClass()}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      Como posso ajudar você hoje?
                    </motion.p>
                    {showQuickReplies && (
                      <motion.div
                        className="mt-4 flex gap-2 flex-wrap justify-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickReply("Quais são seus serviços?")}
                          className="bg-white/10 py-2.5 px-4 rounded-full text-sm text-white cursor-pointer border border-purple-500/30 transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 hover:border-transparent"
                        >
                          Serviços
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickReply("Quero saber sobre o Trafego Pago")}
                          className="bg-white/10 py-2.5 px-4 rounded-full text-sm text-white cursor-pointer border border-purple-500/30 transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 hover:border-transparent"
                        >
                          Trafego Pago
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickReply("Quero agendar uma Reunião")}
                          className="bg-white/10 py-2.5 px-4 rounded-full text-sm text-white cursor-pointer border border-purple-500/30 transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 hover:border-transparent"
                        >
                          Agendar Reunião
                        </motion.button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <p className={getFontSizeClass()} dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
                )}
                <span
                  className={`text-[10px] sm:text-xs text-slate-400 block mt-1 opacity-80 ${message.sender === "user" ? "text-right" : "text-left"}`}
                >
                  {message.time}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-2 sm:p-3 flex items-center gap-1 self-start h-[25px] sm:h-[30px] bg-slate-800/50 backdrop-blur-sm rounded-full px-3 sm:px-4 border border-slate-700/50"
              >
                <motion.div
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full"
                ></motion.div>
                <span className="text-xs sm:text-sm text-slate-300 ml-2">Digitando...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex p-4 border-t border-slate-700/50 bg-slate-800/70 backdrop-blur-sm gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 border border-slate-600/50 rounded-full py-3 px-4 outline-none bg-slate-700/50 text-white text-base transition-all focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.4)] placeholder-slate-400"
            placeholder="Digite sua mensagem..."
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none text-white rounded-full w-14 h-14 sm:w-12 sm:h-12 text-xl cursor-pointer flex items-center justify-center transition-all hover:shadow-lg hover:shadow-indigo-500/30 flex-shrink-0"
            title="Enviar"
          >
            <Send className="w-6 h-6 sm:w-5 sm:h-5" />
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}
