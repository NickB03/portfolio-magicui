"use client";

import { motion, AnimatePresence, useDragControls } from "motion/react";
import { X, Send, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { useAIChat } from "./ai-chat-provider";
import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type PointerEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";
import { SiriOrb } from "./siri-orb";
import { cn } from "@/lib/utils";

function useIsTouchDevice() {
    const [isTouch, setIsTouch] = useState(false);
    useEffect(() => {
        setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }, []);
    return isTouch;
}

function useKeyboardOffset() {
    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;
        const update = () => {
            setOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
        };
        vv.addEventListener("resize", update);
        vv.addEventListener("scroll", update);
        return () => {
            vv.removeEventListener("resize", update);
            vv.removeEventListener("scroll", update);
        };
    }, []);
    return offset;
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return reduced;
}

export function AIChatPopup() {
    const { isOpen, close, messages, isLoading, sendMessage, clearMessages, retryLastMessage } = useAIChat();
    const [input, setInput] = useState("");
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const desktopScrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const dragControls = useDragControls();
    const isTouch = useIsTouchDevice();
    const keyboardOffset = useKeyboardOffset();
    const prefersReducedMotion = usePrefersReducedMotion();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        const el = mobileScrollRef.current ?? desktopScrollRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = useCallback(() => {
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput("");
        }
    }, [input, isLoading, sendMessage]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (isTouch) {
            // Mobile: Enter sends, Shift+Enter for newline
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        } else {
            // Desktop: Cmd/Ctrl+Enter sends
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
            }
        }
    };

    const onHeaderPointerDown = (e: PointerEvent) => {
        if (isTouch) dragControls.start(e);
    };

    const messagesContent = messages.length === 0 ? (
        <motion.div
            className="flex flex-col items-center gap-4 text-center min-w-0 w-full"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex flex-col gap-1.5 min-w-0">
                <p className="text-sm sm:text-sm font-medium text-muted-foreground break-words">Hi, I&apos;m Nicks AI and I&apos;m here to answer your questions about him!</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 min-w-0">
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
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="group rounded-xl border border-border/30 sm:border-border/10 bg-muted/[0.02] px-3.5 py-2.5 text-sm sm:px-3.5 sm:py-2.5 sm:text-sm text-muted-foreground transition-all hover:border-border/40 sm:hover:border-border/20 hover:bg-muted/10 hover:text-foreground active:scale-95"
                    >
                        {suggestion}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    ) : (
        <div className="flex flex-col gap-4">
            {messages.map((message, index) => {
                const isLatest = index === messages.length - 1;
                const alignClass = `flex ${message.role === "user" ? "justify-end" : "justify-start"}`;
                const bubbleContent = (
                    <div
                        className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-[15px] sm:text-sm leading-relaxed ${message.role === "user"
                            ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/30"
                            : "border border-border/30 sm:border-border/10 bg-gradient-to-b from-muted/[0.07] to-muted/[0.03] text-foreground shadow-sm"
                            }`}
                    >
                        {message.role === "assistant" ? (
                            message.content ? (
                                <>
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-2 prose-li:my-0.5">
                                        <Markdown>{message.content}</Markdown>
                                    </div>
                                    {message.isError && (
                                        <button
                                            onClick={retryLastMessage}
                                            className="mt-2 flex items-center gap-1.5 rounded-lg border border-border/30 sm:border-border/10 bg-muted/10 px-2.5 py-1.5 text-sm sm:text-xs text-muted-foreground transition-all hover:bg-muted/20 hover:text-foreground active:scale-95"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Retry
                                        </button>
                                    )}
                                </>
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
                );

                // Only animate the latest message for performance
                if (isLatest && !prefersReducedMotion) {
                    return (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={alignClass}
                        >
                            {bubbleContent}
                        </motion.div>
                    );
                }

                return (
                    <div key={message.id} className={alignClass}>
                        {bubbleContent}
                    </div>
                );
            })}
        </div>
    );

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
                        className="fixed inset-2 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-3rem))] z-50 flex w-auto sm:w-[420px] sm:max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 sm:border-border/20 bg-gradient-to-b from-popover/98 via-popover/95 to-popover/98 shadow-2xl shadow-primary/15 backdrop-blur-2xl"
                        style={{
                            bottom: isTouch && keyboardOffset > 0 ? `calc(0.5rem + ${keyboardOffset}px)` : undefined,
                            paddingBottom: isTouch ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                        }}
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
                        transition={prefersReducedMotion ? { duration: 0.1 } : { type: "spring", stiffness: 300, damping: 30 }}
                        drag={isTouch ? "y" : false}
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                close();
                            }
                        }}
                    >
                        {/* Mobile drag handle */}
                        <div className="sm:hidden flex justify-center pt-2 pb-0"
                            onPointerDown={onHeaderPointerDown}
                            style={{ touchAction: "none" }}
                        >
                            <div className="h-1 w-8 rounded-full bg-muted-foreground/20" />
                        </div>

                        {/* Header */}
                        <div
                            className="relative flex items-center justify-between border-b border-border/30 sm:border-border/10 bg-muted/[0.02] px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-sm"
                            onPointerDown={onHeaderPointerDown}
                            style={isTouch ? { touchAction: "none" } : undefined}
                        >
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
                                <SiriOrb size="sm" className="sm:!h-10 sm:!w-10" phase={isLoading ? "thinking" : "idle"} />
                                <div className="flex flex-col">
                                    <span className="text-sm sm:text-sm font-semibold text-foreground">Ask about Nick</span>
                                    <span className="text-xs sm:text-xs text-muted-foreground">Portfolio Assistant</span>
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

                        {/* Messages — mobile: native scroll, desktop: Radix ScrollArea */}
                        <div
                            ref={mobileScrollRef}
                            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:hidden"
                        >
                            {messagesContent}
                        </div>
                        <ScrollArea ref={desktopScrollRef} className="hidden sm:flex flex-1 p-6">
                            {messagesContent}
                        </ScrollArea>

                        {/* Input */}
                        <div className="border-t border-border/30 sm:border-border/10 bg-gradient-to-b from-background/20 to-background/40 p-4 sm:p-4 sm:pb-4 backdrop-blur-sm">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    rows={1}
                                    className="w-full resize-none rounded-2xl border border-border/30 sm:border-border/10 bg-background/[0.02] px-4 py-3 pr-12 sm:px-4 sm:py-3 sm:pr-12 text-[15px] sm:text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-border/40 sm:focus:border-border/20 focus:bg-background/[0.04] focus:outline-none focus:ring-0 disabled:opacity-50"
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
