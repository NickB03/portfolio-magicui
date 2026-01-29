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
            className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 rounded-full border border-border/20 bg-gradient-to-br from-card/95 via-card/90 to-card/95 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 px-6 py-3.5 text-base sm:text-sm font-medium text-foreground shadow-lg shadow-primary/10 backdrop-blur-xl transition-all hover:border-border/40 hover:shadow-xl hover:shadow-primary/25"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <SiriOrb size="sm" />
            <span className="transition-colors group-hover:text-foreground/90">Ask AI</span>
        </motion.button>
    );
}
