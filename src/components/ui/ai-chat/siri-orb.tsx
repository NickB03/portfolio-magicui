"use client";

import { cn } from "@/lib/utils";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";

interface SiriOrbProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    phase?: "idle" | "thinking";
}

export function SiriOrb({ className, size = "md", phase = "idle" }: SiriOrbProps) {
    const sizeClasses = {
        sm: "h-7 w-7", // Compact size for button integration
        md: "h-10 w-10", // Header size with better proportions
        lg: "h-24 w-24",
    };

    return (
        <div className={cn(
            "relative flex items-center justify-center pointer-events-none shrink-0",
            sizeClasses[size],
            className
        )}>
            <div className={cn(
                "w-full h-full animate-pulse-glow",
                size === "sm" && "drop-shadow-[0_0_2px_rgba(139,92,246,0.3)] dark:drop-shadow-[0_0_2px_rgba(159,112,255,0.4)]",
                size === "md" && "drop-shadow-[0_0_4px_rgba(139,92,246,0.35)] dark:drop-shadow-[0_0_4px_rgba(159,112,255,0.45)]",
                size === "lg" && "drop-shadow-[0_0_8px_rgba(139,92,246,0.4)] dark:drop-shadow-[0_0_8px_rgba(159,112,255,0.5)]",
            )}>
                <VoicePoweredOrb
                    phase={phase}
                    hoverIntensity={0.3}
                    rotateSpeed={0.2}
                />
            </div>
        </div>
    );
}
