"use client";

import { motion } from "motion/react";
import { useAIChat } from "./ai-chat-provider";
import { SiriOrb } from "./siri-orb";

export function AIChatButton() {
    const { isOpen, open } = useAIChat();

    if (isOpen) return null;

    return (
        <motion.button
            layoutId="ai-chat-container"
            onClick={open}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/20 bg-zinc-900/90 px-5 py-3 text-sm font-medium text-white shadow-2xl shadow-primary/20 backdrop-blur-xl transition-all hover:scale-105 hover:bg-zinc-800 hover:shadow-primary/30"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <SiriOrb size="sm" />
            <span>Ask AI</span>
        </motion.button>
    );
}
