import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, BriefcaseIcon } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import { Kubernetes } from "@/components/ui/svgs/kubernetes";
import { Java } from "@/components/ui/svgs/java";
import { Csharp } from "@/components/ui/svgs/csharp";

export const DATA = {
  name: "Nick Bohmer",
  initials: "NB",
  url: "https://www.linkedin.com/in/nickbohmer",
  location: "Dallas, TX",
  locationLink: "https://www.google.com/maps/place/Dallas,+TX",
  description:
    "",
  summary:
    "Product leader with 16+ years in enterprise networking spanning sales, solutions architecture, and product management. Proven ability to translate complex technical concepts into compelling narratives for executive and technical audiences. Currently building full-stack AI applications hands-on, from vana.bot (AI chat platform with 630+ commits & CI/CD workflows) to enterprise platforms replacing legacy systems with modern, AI tools. This practical experience bridges product vision and technical implementation, enabling deeper collaboration with engineering teams and more informed decisions for AI-powered products. Self-driven learner who validates ideas through prototyping and iteration.",
  avatarUrl: "/me.jpg",
  competencies: [],
  skills: [],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/#projects", icon: NotebookIcon, label: "Projects" },
    { href: "/#use-cases", icon: BriefcaseIcon, label: "Use Cases" },
  ],
  contact: {
    email: "nbohmer@gmail.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/nickbohmer",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/nickbohmer",
        icon: Icons.linkedin,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:nbohmer@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "AT&T",
      href: "https://att.com",
      badges: [],
      location: "Dallas, TX",
      title: "Associate Director (Value Added Solutions)",
      logoUrl: "/globe.png",
      start: "August 2025",
      end: "Current",
      description:
        "$400M Product Portfolio Leadership: Responsible for AT&T Global Solution Center, Network Function Virtualization, and Product Showcase teams. Partner closely with VP+ leadership to drive strategic portfolio decisions and align product roadmaps with business objectives.\n\nAI Platform Development: Led end-to-end product development replacing a critical legacy system nearing collapse. Developed solution, secured funding, directed development team, and delivered a solution (Next.js, React, TypeScript, Python, PostgreSQL) that streamlined complex workflows, reduced cycle time, and significantly improved seller experience.\n\nLLM & AI Workflow Innovation: Initiated and secured approval to develop LLM-powered workflow integrations using LangSmith, driving AI adoption across Value Added Solutions to enhance operational efficiency and user experience.\n\nAI Product Strategy & Innovation: Selected for AT&T Growth Council through innovation submission for Network Fabric Project, an AI-focused product evolution initiative for AT&T Business network and products.",
    },
    {
      company: "AT&T",
      href: "https://att.com",
      badges: [],
      location: "Dallas, TX",
      title: "Lead Product Management & Development (Edge Solutions – MNS)",
      logoUrl: "/globe.png",
      start: "August 2022",
      end: "August 2025",
      description:
        "AT&T Network Integrated SD-WAN: Took network-integrated SD-WAN solution from concept to market launch. Defined the product vision, managed $10M budget, and coordinated cross-functional teams across engineering, operations, and field sales. Deployed 16,000 devices generating $144M revenue over three years.\n\nGo-To-Market (GTM) Strategy & Product Positioning: Collaborated with stakeholders and vendors to develop GTM strategies and position AT&T’s Edge solutions effectively within the market. Created customer-facing collateral and ensured consistent, targeted messaging to align with customer needs and AT&T’s strategic vision.\n\nProduct Messaging & Differentiation: Worked across functional groups to develop differentiators for AT&T’s Edge Solutions that communicated value to both business and technical audiences. Served as a key speaker at AT&T Executive Briefing Center and TechForum events.\n\nIndustry Recognition: Engaged with industry analysts to secure AT&T’s position as the #1 Managed SD-WAN provider, recognized by Frost & Sullivan, Vertical Systems Group, and others.",
    },
    {
      company: "AT&T",
      href: "https://att.com",
      badges: [],
      location: "Dallas, TX",
      title: "Solutions Architect",
      logoUrl: "/globe.png",
      start: "August 2020",
      end: "July 2022",
      description:
        "Global Enterprise Solutions: Designed network and security solutions for global enterprise clients by understanding their unique requirements and translating them into tailored offerings. Drove 15% increase in SD-WAN, SASE, and security product adoption through consultative engagements.\n\nExecutive Relationship Management: Built executive-level relationships with key clients, generating over $150M in annual revenue. Served as trusted advisor on network transformations, gathering insights that informed product positioning and roadmap priorities.\n\nCross-Functional Sales Collaboration: Partnered with engineering, marketing, and sales teams to ensure solutions met customer needs and aligned with AT&T’s strategic vision.",
    },
    {
      company: "AT&T",
      href: "https://att.com",
      badges: [],
      location: "Dallas, TX",
      title: "Sr. Edge Solutions Specialist (SD-WAN & MNS SME)",
      logoUrl: "/globe.png",
      start: "January 2019",
      end: "July 2020",
      description:
        "Edge Specialist Team Launch: Played a key role in launching the Edge Specialist team, driving a 25% increase in service adoption by positioning SD-WAN and network security solutions to align with enterprise client needs and differentiate AT&T’s offerings.\n\nSD-WAN Workshops & Revenue Generation: Led over 20 SD-WAN workshops, generating $8M in new revenue by translating complex technical concepts for executive and non-technical stakeholders.\n\nTechnical Sales Training: Developed and delivered targeted technical training for sales teams, partnering with engineering to enhance understanding of SD-WAN and Managed Network Services.",
    },
  ],
  education: [],
  projects: [
    {
      title: "vana.bot",
      href: "https://vana.bot",
      dates: "",
      active: true,
      description:
        "Full-stack AI chat application with interactive artifacts (React components, SVG, Mermaid diagrams) rendering live in-browser.",
      technologies: [
        "React",
        "TypeScript",
        "Vite",
        "OpenRouter",
        "Supabase",
        "PostgreSQL",
        "Deno",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/nickbohmer/vana",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/vana-preview.jpg",
      video: "",
    },
    {
      title: "AnalystAI",
      href: "",
      dates: "",
      active: true,
      description:
        "Document analysis app with PDF extraction, OCR, AI summarization (Gemini API). Containerized with Docker, deployed to Google Cloud Run.",
      technologies: [
        "Docker",
        "Google Cloud Run",
        "Gemini API",
        "OCR",
      ],
      links: [],
      image: "/analystai-preview.jpg",
      video: "",
    },
    {
      title: "ChatPDF-style Q&A tool",
      href: "",
      dates: "",
      active: true,
      description:
        "Document ingestion backend with text extraction, chunking, vector indexing, and retrieval-based Q&A. Google OAuth, FastAPI.",
      technologies: [
        "FastAPI",
        "Vector Indexing",
        "Google OAuth",
        "Retrieval-Augmented Generation",
      ],
      links: [],
      image: "/chatpdf-cli.png",
      video: "",
    },
  ],
  useCases: [
    {
      title: "BreeziNet",
      href: "/use-cases/breezinet",
      dates: "",
      active: true,
      description: "",
      technologies: [],
      links: [],
      image: "/breezi-preview.jpg",
      video: "",
    },
    {
      title: "MNS Order Automation",
      href: "/use-cases/mns-order-automation",
      dates: "",
      active: true,
      description: "",
      technologies: [],
      links: [],
      image: "/mns-preview.jpg",
      video: "",
    },
    {
      title: "Business Virtual Agent",
      href: "/use-cases/business-virtual-agent",
      dates: "",
      active: true,
      description: "",
      technologies: [],
      links: [],
      image: "/bva-preview.jpg",
      video: "",
    },
  ],
  hackathons: [],
} as const;
