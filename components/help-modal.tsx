"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-indigo-500/30 z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Ajuda</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 text-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-1">Como usar o chat</h3>
                <p className="text-base">
                  Digite sua mensagem na caixa de texto na parte inferior e pressione o botão de enviar ou a tecla Enter
                  para enviar.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-1">Perguntas frequentes</h3>
                <ul className="list-disc pl-5 text-base space-y-3">
                  <li>
                    <strong>O que a Sara Lima pode fazer?</strong>
                    <p className="mt-1">
                      Sara Lima pode responder perguntas sobre serviços, agendar reuniões e fornecer informações sobre
                      tráfego pago.
                    </p>
                  </li>
                  <li>
                    <strong>Como agendar uma reunião?</strong>
                    <p className="mt-1">
                      Basta perguntar "Quero agendar uma reunião" e Sara irá guiá-lo pelo processo.
                    </p>
                  </li>
                  <li>
                    <strong>Posso enviar arquivos?</strong>
                    <p className="mt-1">No momento, o envio de arquivos não está disponível nesta versão do chat.</p>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-1">Contato</h3>
                <p className="text-base">
                  Se precisar de mais ajuda, entre em contato pelo email:{" "}
                  <a href="mailto:suporte@lynknexus.com" className="text-purple-400 hover:text-purple-300 underline">
                    suporte@lynknexus.com
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-base font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
