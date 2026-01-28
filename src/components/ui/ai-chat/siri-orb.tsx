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
        sm: "h-12 w-12", // Slightly larger to account for canvas padding/glow
        md: "h-20 w-20",
        lg: "h-32 w-32",
    };

    return (
        <div className={cn("relative flex items-center justify-center pointer-events-none", sizeClasses[size], className)}>
            <div className="absolute inset-0">
                <VoicePoweredOrb
                    phase={phase}
                    hoverIntensity={0.6}
                    rotateSpeed={0.2}
                />
            </div>

            {/* Optional: Add a CSS glow if the WebGL one isn't strong enough in the UI context 
                But the shader describes a light emission, so let's verify visual first. 
                Keeping a subtle rounded glow for integration.
            */}
            <div className="absolute inset-0 bg-transparent shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-full pointer-events-none" />
        </div>
    );
}
