"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Send, Loader2, ArrowLeft } from "lucide-react";
import { useAIChat } from "./ai-chat-provider";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";
import { SiriOrb } from "./siri-orb";
import { cn } from "@/lib/utils";

export function AIChatPopup() {
    const { isOpen, close, messages, isLoading, sendMessage, clearMessages } = useAIChat();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 z-40 bg-black/10"
                    />

                    {/* Chat panel */}
                    <motion.div
                        layoutId="ai-chat-container"
                        className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-zinc-950/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] shadow-primary/10 backdrop-blur-2xl"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{ height: "min(600px, calc(100vh - 6rem))" }}
                    >
                        {/* Header */}
                        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <div className="flex items-center gap-2 pl-8 transition-all">
                                <button
                                    onClick={clearMessages}
                                    className={cn(
                                        "absolute left-4 rounded-full p-1 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
                                        messages.length > 0 ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                                    )}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <SiriOrb size="md" phase={isLoading ? "thinking" : "idle"} />
                                <span className="font-medium text-zinc-100">Ask about Nick</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">⌘ Enter</span>
                                <button
                                    onClick={close}
                                    className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea ref={scrollRef} className="flex-1 p-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
                                    <p>👋 Hi! Ask me anything about Nick&apos;s experience:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {[
                                            "What's Nick's SD-WAN experience?",
                                            "Tell me about his AI projects",
                                            "What technologies does he use?",
                                        ].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => sendMessage(suggestion)}
                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${message.role === "user"
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "bg-white/5 text-zinc-100"
                                                    }`}
                                            >
                                                {message.role === "assistant" ? (
                                                    message.content ? (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                                            <Markdown>{message.content}</Markdown>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 py-2">
                                                            <span className="text-zinc-400 text-sm animate-pulse">
                                                                Thinking...
                                                            </span>
                                                        </div>
                                                    )
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <div className="border-t border-white/10 p-4 bg-black/40">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    rows={1}
                                    className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-white/20 focus:outline-none focus:ring-0 focus:bg-zinc-900 transition-colors pr-12"
                                    disabled={isLoading}
                                    style={{ minHeight: "44px" }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
