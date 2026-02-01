"use client";

import { Dock, DockIcon, useDockContext, BASE_SIZE, SPRING } from "@/components/magicui/dock";
import BlurFade from "@/components/magicui/blur-fade";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useAIChat } from "@/components/ui/ai-chat/ai-chat-provider";
import { SiriOrb } from "@/components/ui/ai-chat/siri-orb";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";

const AI_LABEL_SEEN_KEY = "ai-chat-label-seen";

// Extra width added when the "Ask AI" label is visible (text ~36px + right padding ~12px)
const LABEL_EXPANDED_WIDTH = 48;

/**
 * A dock-aware AI button using a two-zone layout:
 * - Left zone: a square area (containerSize × containerSize) that centers the orb,
 *   with the orb scaling from BASE_ICON_SIZE → magnification*ICON_SIZE_RATIO (same as DockIcon).
 * - Right zone: "Ask AI" text, revealed/hidden via overflow-hidden + animated width.
 *
 * Collapsed: totalWidth = containerSize (identical to DockIcon).
 * Expanded:  totalWidth = containerSize + labelExtra.
 */
function DockAIButton({
  showLabel,
  onClick,
  className,
}: {
  showLabel: boolean;
  onClick: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX, magnification, distance } = useDockContext();

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Height / square-zone width — same formula as DockIcon
  const containerSize = useSpring(
    useTransform(distanceCalc, [-distance, 0, distance], [BASE_SIZE, magnification, BASE_SIZE]),
    SPRING
  );

  // Animate label extra width
  const labelTarget = useMotionValue(0);
  const labelExtra = useSpring(labelTarget, {
    mass: 0.1,
    stiffness: 170,
    damping: 18,
  });

  useEffect(() => {
    labelTarget.set(showLabel ? LABEL_EXPANDED_WIDTH : 0);
  }, [showLabel, labelTarget]);

  // Combine square zone + label expansion
  const totalWidth = useTransform(
    [containerSize, labelExtra],
    ([size, extra]: number[]) => size + extra
  );

  return (
    <motion.div
      ref={ref}
      style={{ width: totalWidth, height: containerSize }}
      className={cn(
        "relative flex items-center rounded-full shrink-0 overflow-hidden",
        className
      )}
    >
      <button
        onClick={onClick}
        type="button"
        aria-label="Ask AI"
        className="flex items-center w-full h-full rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
      >
        {/* Left zone: square orb area — orb fills the full container */}
        <motion.div
          style={{ width: containerSize, height: containerSize }}
          className="shrink-0 flex items-center justify-center"
        >
          <SiriOrb size="auto" />
        </motion.div>

        {/* Right zone: label text, clipped when collapsed */}
        <span className="text-xs font-medium text-foreground whitespace-nowrap pr-3">
          Ask AI
        </span>
      </button>
    </motion.div>
  );
}

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [showAILabel, setShowAILabel] = useState(false);
  const { open: openAIChat } = useAIChat();
  const expandTimerRef = useRef<NodeJS.Timeout | null>(null);

  const collapseLabel = useCallback(() => {
    setShowAILabel(false);
    try {
      sessionStorage.setItem(AI_LABEL_SEEN_KEY, "1");
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Staged animation: orb only -> expand "Ask AI" -> linger -> collapse
  useEffect(() => {
    try {
      if (sessionStorage.getItem(AI_LABEL_SEEN_KEY)) return;
    } catch {
      return; // sessionStorage unavailable -- don't show label
    }

    // Delay before expanding so the orb is visible alone first
    const expandTimer = setTimeout(() => {
      setShowAILabel(true);
      // Linger with label visible, then collapse
      const collapseTimer = setTimeout(collapseLabel, 3000);
      // Store collapse timer ref for cleanup
      expandTimerRef.current = collapseTimer;
    }, 1500);

    return () => {
      clearTimeout(expandTimer);
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };
  }, [collapseLabel]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      setIsVisible(false);
      // Collapse label immediately on scroll
      if (showAILabel) collapseLabel();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 150);
    };

    const scrollContainer = document.querySelector(".overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      clearTimeout(timeoutId);
    };
  }, [showAILabel, collapseLabel]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-30">
      <BlurFade delay={0} yOffset={-6} className="pointer-events-auto">
        <Dock
          className={cn(
            "z-50 relative h-14 p-2 w-fit mx-auto flex gap-2 border bg-card/90 backdrop-blur-3xl shadow-[0_0_10px_3px] shadow-primary/5 transition-opacity duration-200",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {DATA.navbar.map((item) => {
            const isExternal = item.href.startsWith("http");
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <a
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      if (item.href.includes("#")) {
                        const id = item.href.split("#")[1];
                        if (id) {
                          window.dispatchEvent(new CustomEvent("trigger-section-animation", { detail: id }));
                        }
                      }
                    }}
                  >
                    <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
                      <item.icon className="size-full rounded-sm overflow-hidden object-contain" />
                    </DockIcon>
                  </a>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={8}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                >
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          <Separator
            orientation="vertical"
            className="h-2/3 m-auto w-px bg-border"
          />
          {Object.entries(DATA.contact.social)
            .filter(([_, social]) => social.navbar)
            .map(([name, social], index) => {
              const isExternal = social.url.startsWith("http");
              const IconComponent = social.icon;
              return (
                <Tooltip key={`social-${name}-${index}`}>
                  <TooltipTrigger asChild>
                    <a
                      href={social.url}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
                        <IconComponent className="size-full rounded-sm overflow-hidden object-contain" />
                      </DockIcon>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={8}
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                  >
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          {process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === "true" && (
            <>
              <Separator
                orientation="vertical"
                className="h-2/3 m-auto w-px bg-border"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <DockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
                    <ModeToggle className="size-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl" />
                  </DockIcon>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={8}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                >
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DockAIButton
                    showLabel={showAILabel}
                    onClick={openAIChat}
                    className="bg-background text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors rounded-3xl"
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={8}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                >
                  <p>Ask AI</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </Dock>
      </BlurFade>
    </div>
  );
}
