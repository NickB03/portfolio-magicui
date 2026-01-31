"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    type ReactNode,
} from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    isError?: boolean;
}

interface AIChatContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    messages: Message[];
    isLoading: boolean;
    sendMessage: (content: string) => Promise<void>;
    clearMessages: () => void;
    retryLastMessage: () => void;
}

const AIChatContext = createContext<AIChatContextType | null>(null);

export function useAIChat() {
    const context = useContext(AIChatContext);
    if (!context) {
        // Return no-op functions when not in provider (e.g., when AI chat is disabled)
        return {
            isOpen: false,
            open: () => {},
            close: () => {},
            toggle: () => {},
            messages: [],
            isLoading: false,
            sendMessage: async () => {},
            clearMessages: () => {},
            retryLastMessage: () => {},
        };
    }
    return context;
}

interface AIChatProviderProps {
    children: ReactNode;
}

const REQUEST_TIMEOUT_MS = 30_000;

export function AIChatProvider({ children }: AIChatProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastUserMessageRef = useRef<string>("");
    const abortControllerRef = useRef<AbortController | null>(null);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    const clearMessages = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
        setMessages([]);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        lastUserMessageRef.current = content.trim();

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: content.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // Create placeholder for assistant response
        const assistantId = `assistant-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: "" },
        ]);

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: content }),
                signal: controller.signal,
            });

            if (!response.ok) {
                clearTimeout(timeoutId);
                // Try to parse error response
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                    const errorData = await response.json();

                    // Handle specific error types
                    if (response.status === 503 && errorData.error === "API quota temporarily exceeded") {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === assistantId
                                    ? {
                                        ...msg,
                                        content: errorData.message || "The AI assistant is temporarily unavailable due to high usage. Please try again in a few minutes.",
                                        isError: true,
                                    }
                                    : msg
                            )
                        );
                        return;
                    }

                    // Handle other structured errors
                    if (errorData.message) {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === assistantId
                                    ? {
                                        ...msg,
                                        content: errorData.message,
                                        isError: true,
                                    }
                                    : msg
                            )
                        );
                        return;
                    }
                }

                throw new Error("Failed to get response");
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();
            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                // Update the assistant message with accumulated content
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    )
                );
            }

            // Flush any remaining bytes from the decoder
            const remaining = decoder.decode();
            if (remaining) {
                accumulatedContent += remaining;
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error("Chat error:", error);

            const isTimeout = error instanceof DOMException && error.name === "AbortError";
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantId
                        ? {
                            ...msg,
                            content: isTimeout
                                ? "Request timed out. Please check your connection and try again."
                                : "Sorry, I couldn't process your request. Please try again.",
                            isError: true,
                        }
                        : msg
                )
            );
        } finally {
            clearTimeout(timeoutId);
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, [isLoading]);

    const retryLastMessage = useCallback(() => {
        if (!lastUserMessageRef.current || isLoading) return;
        // Remove the last assistant (error) message before retrying
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.isError) {
                return prev.slice(0, -1);
            }
            return prev;
        });
        // Use setTimeout to let state update before sending
        const msg = lastUserMessageRef.current;
        setTimeout(() => sendMessage(msg), 0);
    }, [isLoading, sendMessage]);

    return (
        <AIChatContext.Provider
            value={{
                isOpen,
                open,
                close,
                toggle,
                messages,
                isLoading,
                sendMessage,
                clearMessages,
                retryLastMessage,
            }}
        >
            {children}
        </AIChatContext.Provider>
    );
}
