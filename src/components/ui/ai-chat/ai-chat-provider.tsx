"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
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
}

const AIChatContext = createContext<AIChatContextType | null>(null);

export function useAIChat() {
    const context = useContext(AIChatContext);
    if (!context) {
        throw new Error("useAIChat must be used within an AIChatProvider");
    }
    return context;
}

interface AIChatProviderProps {
    children: ReactNode;
}

export function AIChatProvider({ children }: AIChatProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    const clearMessages = useCallback(() => setMessages([]), []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

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

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: content }),
            });

            if (!response.ok) {
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
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantId
                        ? {
                            ...msg,
                            content:
                                "Sorry, I couldn't process your request. Please try again.",
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

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
            }}
        >
            {children}
        </AIChatContext.Provider>
    );
}
