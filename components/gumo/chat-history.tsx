"use client"

import { type ChatSession } from "@/lib/chat-history"
import { X, MessageCircle, Trash2 } from "lucide-react"
import { chatHistoryDB } from "@/lib/chat-history"

interface ChatHistoryProps {
    sessions: ChatSession[]
    onSelectSession: (sessionId: string) => void
    onClose: () => void
    onDeleteSession?: (sessionId: string) => void
}

export function ChatHistory({ sessions, onSelectSession, onClose, onDeleteSession }: ChatHistoryProps) {
    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('Delete this chat session?')) {
            try {
                await chatHistoryDB.deleteSession(sessionId)
                onDeleteSession?.(sessionId)
            } catch (error) {
                console.error('Failed to delete session:', error)
            }
        }
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return 'Today'
        } else if (diffDays === 1) {
            return 'Yesterday'
        } else if (diffDays < 7) {
            return `${diffDays} days ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    return (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute left-0 top-0 h-full w-80 bg-[color:var(--gumo-surface)] border-r border-white/10">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Chat History</h2>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center hover:bg-white/20 transition-colors"
                        aria-label="Close history"
                    >
                        <X className="size-4 text-white/70" />
                    </button>
                </div>

                <div className="overflow-y-auto h-full pb-20">
                    {sessions.length === 0 ? (
                        <div className="p-4 text-center text-white/60">
                            <MessageCircle className="size-8 mx-auto mb-2 opacity-50" />
                            <p>No chat history yet</p>
                            <p className="text-sm">Start a new conversation!</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => onSelectSession(session.id)}
                                    className="group flex items-start justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors mb-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white/90 truncate">
                                            {session.title}
                                        </h3>
                                        <p className="text-xs text-white/60 mt-1">
                                            {formatDate(session.updatedAt)} • {session.messages.length} messages
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-red-500/20 transition-all"
                                        aria-label="Delete session"
                                    >
                                        <Trash2 className="size-3 text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
