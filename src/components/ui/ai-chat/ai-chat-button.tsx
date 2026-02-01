"use client";

import { motion } from "motion/react";
import { useAIChat } from "./ai-chat-provider";
import { SiriOrb } from "./siri-orb";

export function AIChatButton() {
    const { isOpen, open } = useAIChat();

    if (isOpen) return null;

    return (
        <motion.button
            onClick={open}
            className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 rounded-full border border-chat-border bg-chat-bg px-5 py-2 text-base sm:text-[15px] font-medium text-chat-text shadow-lg transition-all hover:shadow-xl hover:border-chat-text-secondary/50"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <SiriOrb size="sm" />
            <span className="transition-colors">Ask AI</span>
        </motion.button>
    );
}
