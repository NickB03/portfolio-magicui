"use client";

import { Dock, DockIcon, DockItem } from "@/components/magicui/dock";
import BlurFade from "@/components/magicui/blur-fade";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useAIChat } from "@/components/ui/ai-chat/ai-chat-provider";
import { SiriOrb } from "@/components/ui/ai-chat/siri-orb";
import { ModeToggle } from "@/components/mode-toggle";

const AI_LABEL_SEEN_KEY = "ai-chat-label-seen";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [showAILabel, setShowAILabel] = useState(false);
  const { open: openAIChat } = useAIChat();

  const collapseLabel = useCallback(() => {
    setShowAILabel(false);
    try {
      localStorage.setItem(AI_LABEL_SEEN_KEY, "1");
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Show label on first visit, auto-collapse after 4s
  useEffect(() => {
    try {
      if (!localStorage.getItem(AI_LABEL_SEEN_KEY)) {
        setShowAILabel(true);
        const timer = setTimeout(collapseLabel, 4000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable — don't show label
    }
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
                  <button
                    onClick={openAIChat}
                    type="button"
                    aria-label="Ask AI"
                    className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl"
                  >
                    <DockItem className="rounded-3xl cursor-pointer bg-background text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors overflow-hidden">
                      <div className="flex items-center justify-center h-full aspect-square shrink-0">
                        <SiriOrb size="sm" />
                      </div>
                      <div
                        className="grid transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none"
                        style={{
                          gridTemplateColumns: showAILabel ? "1fr" : "0fr",
                        }}
                      >
                        <span
                          className={cn(
                            "overflow-hidden whitespace-nowrap text-xs font-medium pr-3 transition-opacity duration-150 ease-out motion-reduce:transition-none",
                            showAILabel ? "opacity-100" : "opacity-0"
                          )}
                        >
                          Ask AI
                        </span>
                      </div>
                    </DockItem>
                  </button>
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
