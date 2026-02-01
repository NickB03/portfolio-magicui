"use client";

import { cn } from "@/lib/utils";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";

interface SiriOrbProps {
    className?: string;
    size?: "xs" | "sm" | "md" | "lg" | "auto";
    phase?: "idle" | "thinking";
}

export function SiriOrb({ className, size = "md", phase = "idle" }: SiriOrbProps) {
    const sizeClasses = {
        xs: "size-5", // Dock icon size (20px) — matches DockIcon inner area
        sm: "size-9", // Compact size for button integration
        md: "size-10", // Header size with better proportions
        lg: "size-24",
        auto: "w-full h-full", // Fills parent — size controlled externally
    };

    return (
        <div className={cn(
            "relative flex items-center justify-center pointer-events-none shrink-0",
            sizeClasses[size],
            className
        )}>
            <div className={cn(
                "w-full h-full animate-pulse-glow",
                (size === "sm" || size === "auto") && "drop-shadow-[0_0_2px_rgba(20,184,166,0.25)] dark:drop-shadow-[0_0_2px_rgba(45,212,191,0.3)]",
                size === "md" && "drop-shadow-[0_0_4px_rgba(20,184,166,0.3)] dark:drop-shadow-[0_0_4px_rgba(45,212,191,0.35)]",
                size === "lg" && "drop-shadow-[0_0_8px_rgba(20,184,166,0.3)] dark:drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]",
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
