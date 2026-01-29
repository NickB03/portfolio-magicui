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
                        transition={{ duration: 0.15 }}
                        onClick={close}
                        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]"
                    />

                    {/* Chat panel */}
                    <motion.div
                        className="fixed top-2 bottom-2 right-2 left-2 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto sm:h-[min(640px,calc(100dvh-3rem))] z-50 flex w-auto sm:w-[420px] max-w-full sm:max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/20 bg-gradient-to-b from-popover/98 via-popover/95 to-popover/98 shadow-2xl shadow-primary/15 backdrop-blur-2xl"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="relative flex items-center justify-between border-b border-border/10 bg-muted/[0.02] px-3 py-3 sm:px-6 sm:py-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 pl-8 sm:pl-8 transition-all">
                                <button
                                    onClick={clearMessages}
                                    className={cn(
                                        "absolute left-2 sm:left-4 rounded-lg p-2 sm:p-3 text-muted-foreground transition-all duration-200 hover:bg-muted/20 hover:text-foreground",
                                        messages.length > 0 ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                                    )}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <SiriOrb size="sm" className="sm:hidden" phase={isLoading ? "thinking" : "idle"} />
                                <SiriOrb size="md" className="hidden sm:block" phase={isLoading ? "thinking" : "idle"} />
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-semibold text-foreground">Ask about Nick</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">Portfolio Assistant</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={close}
                                    className="rounded-lg p-2 sm:p-3 text-muted-foreground transition-all hover:bg-muted/20 hover:text-foreground hover:scale-110"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea ref={scrollRef} className="flex-1 p-3 sm:p-6">
                            {messages.length === 0 ? (
                                <motion.div
                                    className="flex flex-col gap-4 text-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Hi, I&apos;m Nicks AI and I&apos;m here to answer your questions about him!</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {[
                                            "What's Nick's SD-WAN experience?",
                                            "Tell me about his AI projects",
                                            "What are Nick's creative hobbies?",
                                            "How does Nick approach problem-solving?",
                                            "What does Nick do for fun?",
                                        ].map((suggestion, i) => (
                                            <motion.button
                                                key={suggestion}
                                                onClick={() => sendMessage(suggestion)}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 + i * 0.05 }}
                                                className="group rounded-xl border border-border/10 bg-muted/[0.02] px-3 py-2 text-xs sm:px-3.5 sm:py-2.5 sm:text-sm text-muted-foreground transition-all hover:border-border/20 hover:bg-muted/10 hover:text-foreground active:scale-95"
                                            >
                                                {suggestion}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 }}
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === "user"
                                                    ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/30"
                                                    : "border border-border/10 bg-gradient-to-b from-muted/[0.07] to-muted/[0.03] text-foreground shadow-sm"
                                                    }`}
                                            >
                                                {message.role === "assistant" ? (
                                                    message.content ? (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-2 prose-li:my-0.5">
                                                            <Markdown>{message.content}</Markdown>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 py-1">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                                            <span className="text-muted-foreground text-xs">
                                                                Thinking...
                                                            </span>
                                                        </div>
                                                    )
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <div className="border-t border-border/10 bg-gradient-to-b from-background/20 to-background/40 p-3 sm:p-4 backdrop-blur-sm">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    rows={1}
                                    className="w-full resize-none rounded-2xl border border-border/10 bg-background/[0.02] px-3 py-2.5 pr-11 sm:px-4 sm:py-3 sm:pr-12 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-border/20 focus:bg-background/[0.04] focus:outline-none focus:ring-0 disabled:opacity-50"
                                    disabled={isLoading}
                                    style={{ minHeight: "44px" }}
                                />
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={!input.trim() || isLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg transition-all hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
