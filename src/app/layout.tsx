import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import {
  AIChatProvider,
  AIChatButton,
  AIChatPopup,
} from "@/components/ui/ai-chat";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  openGraph: {
    title: `${DATA.name}`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: `${DATA.name}`,
    card: "summary_large_image",
  },
  verification: {
    google: "",
    yandex: "",
  },
  icons: {
    icon: "/nb-logo.png?v=1",
    apple: "/nb-logo.png?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased max-w-[100vw] overflow-hidden",
          geist.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          <TooltipProvider delayDuration={0}>
            {process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === "true" ? (
              <AIChatProvider>
                <div className="fixed inset-0 top-0 left-0 right-0 h-[100px] overflow-hidden z-0">
                  <FlickeringGrid
                    className="h-full w-full"
                    squareSize={2}
                    gridGap={2}
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, black, transparent)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black, transparent)",
                    }}
                  />
                </div>
                <Navbar />
                <div
                  className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden scroll-smooth scroll-pt-28 md:scroll-pt-32"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 100px)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 100px)",
                  }}
                >
                  <div className="max-w-2xl mx-auto pt-24 pb-12 sm:pt-32 sm:pb-24 px-6">
                    {children}
                  </div>
                </div>
                <AIChatButton />
                <AIChatPopup />
              </AIChatProvider>
            ) : (
              <>
                <div className="fixed inset-0 top-0 left-0 right-0 h-[100px] overflow-hidden z-0">
                  <FlickeringGrid
                    className="h-full w-full"
                    squareSize={2}
                    gridGap={2}
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, black, transparent)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black, transparent)",
                    }}
                  />
                </div>
                <Navbar />
                <div
                  className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden scroll-smooth scroll-pt-28 md:scroll-pt-32"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 100px)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 100px)",
                  }}
                >
                  <div className="max-w-2xl mx-auto pt-24 pb-12 sm:pt-32 sm:pb-24 px-6">
                    {children}
                  </div>
                </div>
              </>
            )}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
