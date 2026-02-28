'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Loader2, User, Bot, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'

export default function AIPage() {
  const [conversationId] = useState(() => 'conv-' + Date.now())
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: { conversation_id: conversationId },
    }),
    onError: (err: Error) => console.error('Chat error:', err),
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  const EXAMPLE_PROMPTS = [
    'Summarize my recent highlights',
    'What are the main themes in my notes?',
    'Find connections between my ideas',
    'What have I learned about productivity?',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--color-accent-300)]" />
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">AI Chat</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Chat with your knowledge base</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="gap-1.5">
          <PlusCircle className="h-3.5 w-3.5" /> New chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-6 text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-[var(--color-accent-300)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Chat with your knowledge</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-sm">
                Ask questions about your notes, highlights, and saved articles. Meridian searches your knowledge base to give you relevant answers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-sm px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-accent-300)]'
                  )}>
                    {message.role === 'user'
                      ? <User className="h-4 w-4" />
                      : <Sparkles className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-tr-sm'
                      : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-sm'
                  )}>
                    <p className="whitespace-pre-wrap">
                      {(message.parts as unknown as Array<{ type: string; text?: string }>)
                        ?.filter((p) => p.type === 'text')
                        .map((p) => p.text ?? '')
                        .join('') || (message as unknown as { content?: string }).content || ''}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-[var(--color-accent-300)]" />
                  </div>
                  <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-tertiary)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">Searching your knowledge base…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your knowledge base…"
                className="min-h-[52px] max-h-[160px] pr-4 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
            </div>
            <Button type="submit" disabled={isLoading || !input.trim()} className="h-[52px] px-4">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2 text-center">
            Answers are grounded in your saved articles, highlights, and notes.
          </p>
        </form>
      </div>
    </div>
  )
}
