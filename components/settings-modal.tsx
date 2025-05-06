"use client"

import { useState } from "react"
import { X, Volume2, VolumeX, Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    soundEnabled: boolean
    darkMode: boolean
    fontSize: "small" | "medium" | "large"
  }
  onSettingsChange: (settings: any) => void
}

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-5 shadow-2xl border border-indigo-500/30 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Configurações</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 text-slate-200">
              {/* Som */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {localSettings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  <span>Som de notificações</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => handleChange("soundEnabled", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Modo escuro */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {localSettings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Modo escuro</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.darkMode}
                    onChange={(e) => handleChange("darkMode", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Tamanho da fonte */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span>Tamanho da fonte</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm flex-1 transition-all ${
                      localSettings.fontSize === "small"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                    onClick={() => handleChange("fontSize", "small")}
                  >
                    Pequena
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm flex-1 transition-all ${
                      localSettings.fontSize === "medium"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                    onClick={() => handleChange("fontSize", "medium")}
                  >
                    Média
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm flex-1 transition-all ${
                      localSettings.fontSize === "large"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                    onClick={() => handleChange("fontSize", "large")}
                  >
                    Grande
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
