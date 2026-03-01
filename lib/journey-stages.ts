import { LucideIcon, Cpu, SlidersHorizontal, FileText, Search, Wrench, Users, Plug, BarChart3, Shield, Rocket, Home } from 'lucide-react';

export interface JourneyStage {
    title: string;
    href: string;
    description: string;
    stage: number;
    icon: LucideIcon;
}

export const journeyStages: JourneyStage[] = [
    {
        title: "Transformers",
        href: "/foundations/transformers",
        description: "How do we turn math into language? Start with attention, embeddings, and the decoder-only architecture.",
        stage: 1,
        icon: Cpu,
    },
    {
        title: "Model Adaptation",
        href: "/models/adaptation",
        description: "How do we specialize a pre-trained model? Explore fine-tuning, LoRA, and training trade-offs.",
        stage: 2,
        icon: SlidersHorizontal,
    },
    {
        title: "Context Engineering",
        href: "/context/engineering",
        description: "How do we design effective inputs? Master prompting patterns, templates, and context windows.",
        stage: 3,
        icon: FileText,
    },
    {
        title: "RAG",
        href: "/systems/rag",
        description: "How do we stop the model from forgetting or hallucinating? Ground responses with external knowledge.",
        stage: 4,
        icon: Search,
    },
    {
        title: "Agents & Tool Use",
        href: "/agents/basic",
        description: "How do we give the model hands? Enable autonomous action through tool calling and planning.",
        stage: 5,
        icon: Wrench,
    },
    {
        title: "Multi-Agent Systems",
        href: "/agents/multi",
        description: "How do we give the model partners? Coordinate multiple agents for complex workflows.",
        stage: 6,
        icon: Users,
    },
    {
        title: "MCP",
        href: "/protocols/mcp",
        description: "How do we standardize model interactions? Learn the Model Context Protocol for interoperability.",
        stage: 7,
        icon: Plug,
    },
    {
        title: "Eval & Observability",
        href: "/ops/observability",
        description: "How do we measure what matters? Build evaluation pipelines and trace model behavior.",
        stage: 8,
        icon: BarChart3,
    },
    {
        title: "Safety & Security",
        href: "/ops/safety",
        description: "How do we build guardrails? Implement safety boundaries and security constraints.",
        stage: 9,
        icon: Shield,
    },
    {
        title: "Deployment",
        href: "/ops/deployment",
        description: "How do we go to production? Deploy, scale, and operate LLM applications reliably.",
        stage: 10,
        icon: Rocket,
    },
];

// Home navigation item (separate from journey stages)
export const homeNavItem = {
    title: "Home",
    href: "/",
    icon: Home,
};
