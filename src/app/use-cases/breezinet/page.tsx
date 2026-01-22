import BlurFade from "@/components/magicui/blur-fade";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

export default function BreeziNetPage() {
    return (
        <div className="flex flex-col gap-8 md:gap-12 font-sans selection:bg-foreground selection:text-background pb-10">
            {/* Navigation */}
            <BlurFade delay={BLUR_FADE_DELAY}>
                <Link href="/#use-cases" className="inline-flex items-center text-sm font-medium hover:underline text-muted-foreground transition-colors hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Use Cases
                </Link>
            </BlurFade>

            {/* Hero Card */}
            <BlurFade delay={BLUR_FADE_DELAY * 2} className="relative w-full overflow-hidden rounded-3xl border bg-background shadow-sm flex flex-col p-6 md:p-8">
                <div className="absolute inset-0 z-0">
                    <FlickeringGrid
                        className="z-0 absolute inset-0 size-full"
                        squareSize={3}
                        gridGap={5}
                        color="#6B7280"
                        maxOpacity={0.15}
                        flickerChance={0.2}
                        width={800}
                        height={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
                </div>

                <div className="relative z-20 space-y-4">
                    <Badge variant="secondary" className="px-3 py-1 text-xs tracking-wide uppercase rounded-full w-fit bg-background/50 backdrop-blur border text-foreground">
                        Prototype & Pitch
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                        BreeziNet
                    </h1>
                    <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                        From pitch to prototype in <span className="text-foreground font-semibold">two hours</span>.
                    </p>
                </div>
            </BlurFade>




            {/* Main Content - Vertical Stack */}
            <div className="space-y-12">

                {/* Summary Section */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">01 — Overview</span>

                    </div>
                    <BlurFade delay={BLUR_FADE_DELAY * 4}>
                        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                <p>
                                    BreeziNet is a new way for small business customers to purchase internet & mobile services for a leading US telecom.
                                </p>
                                <p>
                                    The goal: a unified fiber & fixed wireless internet offering with zero friction. The project went from idea to idea to live demo in 2 hours securing buy-in from senior leadership and was selected for further development.
                                </p>
                            </div>
                        </div>
                    </BlurFade>
                </section>




                {/* Context Section */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">02 — Context</span>

                    </div>

                    <BlurFade delay={BLUR_FADE_DELAY * 6}>
                        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                <p>
                                    This concept came out of a two-day innovation workshop which included senior leadership across multiple business units. The session focused on unlocking growth for the business in new or underserved markets. Ideas were pitched and developed within small working groups, then vetted and voted on by participants. The most promising concepts moved forward for final review, and our group focused on <span className="text-foreground font-medium">simplifying how business customers buy internet and wireless service.</span>
                                </p>
                                <p>
                                    The idea was simple: treat fiber and fixed wireless access (FWA) as one product, delivered through a fast, digital experience.
                                </p>
                                <blockquote className="text-lg font-serif font-medium text-foreground italic border-l-2 pl-4 py-2 my-6">
                                    “No bundles. No sales reps. Just one plan, one price.”
                                </blockquote>
                                <p>
                                    Service qualified in under three minutes made possible by leveraging AI and automation to drive simplicity at scale and hit aggressive price points.
                                </p>
                            </div>
                        </div>
                    </BlurFade>

                </section>


                {/* Process Section */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">03 — Role</span>

                    </div>

                    <BlurFade delay={BLUR_FADE_DELAY * 7}>
                        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                <p>
                                    Worked closely with a cross-functional group to shape and refine the concept throughout the session. As ideas started to take form, I built a <strong className="text-foreground bg-primary/10 px-1 rounded-sm">live prototype alongside the discussion</strong> designing and iterating in real time as we pitched and evolved the story.
                                </p>
                                <p>
                                    The process of rapid prototyping accelerated the group’s ability to collaborate. Seeing the experience take shape made it easier to connect with the vision and move the idea forward with more clarity and confidence.
                                </p>
                            </div>
                        </div>
                    </BlurFade>
                </section>




                {/* Design & Research Section */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">04 — Foundations</span>

                    </div>

                    <BlurFade delay={BLUR_FADE_DELAY * 8}>
                        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                <p>
                                    Ahead of the session, we completed market research across the small, mid-size, and enterprise segments. This included direct customer interviews and surveys to understand how priorities shift by segment. That input helped rank buying factors and gave us a clear sense of what mattered most in the purchase decision.
                                </p>
                                <p>
                                    In parallel, I reviewed industry analyst reports and studies to supplement the qualitative data. I used AI tools to help synthesize research across firms and identify broader patterns and trends. That work helped anchor the concept in what customers were actually looking for simplicity, speed, and confidence in what they were getting.
                                </p>
                                <p>
                                    During the session, the rapid prototype process happened alongside the discussion. As the idea took shape the prototype created a clear picture of the intended experience. It helped align the group and gave downstream design and development teams a clear vision to build from.
                                </p>
                            </div>
                        </div>
                    </BlurFade>
                </section>


                {/* Outcome Section */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">05 — Results</span>

                    </div>

                    <BlurFade delay={BLUR_FADE_DELAY * 9}>
                        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2 p-5 bg-background border border-gray-200 rounded-xl shadow-sm">
                                    <span className="text-4xl font-bold text-primary/20">01</span>
                                    <h4 className="font-semibold text-foreground">Selected for Dev</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed text-balance">One of top workshop ideas to move forward.</p>
                                </div>
                                <div className="flex flex-col gap-2 p-5 bg-background border border-gray-200 rounded-xl shadow-sm">
                                    <span className="text-4xl font-bold text-primary/20">02</span>
                                    <h4 className="font-semibold text-foreground">Executive Buy-in</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed text-balance">Delivered live pitch to BU execs with prototype.</p>
                                </div>
                                <div className="flex flex-col gap-2 p-5 bg-background border border-gray-200 rounded-xl shadow-sm">
                                    <span className="text-4xl font-bold text-primary/20">03</span>
                                    <h4 className="font-semibold text-foreground">Cultural Shift</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed text-balance">Sparked support for AI-driven rapid prototyping.</p>
                                </div>
                            </div>
                        </div>
                    </BlurFade>
                </section>


                {/* Reflection */}
                <BlurFade delay={BLUR_FADE_DELAY * 10}>
                    <section className="rounded-2xl border border-dashed p-8 text-center space-y-4 bg-secondary/5">
                        <h2 className="text-xl font-bold tracking-tight">Reflection & Learnings</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm max-w-lg mx-auto">
                            This work reinforced how much opportunity exists in small business and mid-market when you remove friction. It also showed the value of building early—prototyping during the session helped the group align faster.
                        </p>
                    </section>
                </BlurFade>

            </div>
        </div>
    );
}
