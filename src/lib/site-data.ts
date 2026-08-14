import type { Lang } from "@/lib/i18n";

export const profile = {
  name: "Diego Mirhan",
  role: "IA & Desenvolvimento de Software",
  headline:
    "Estudante de Ciência da Computação com foco em Data Science e Machine Learning, construindo soluções de IA local de ponta a ponta.",
  summary:
    "Desenvolvo soluções de IA local ponta a ponta — LLMs locais, visão computacional, OCR e pipelines de dados assíncronos — além de interfaces web full-stack. Participo de pesquisas em Inteligência Artificial e já otimizei plataformas reais de e-commerce. Inglês avançado (C1).",
  location: "",
  phone: "(12) 99141-0569",
  email: "mirhan.diego@gmail.com",
  site: "https://diegomirhan.com",
  resume: "/diego-mirhan-cv.pdf",
  github: "https://github.com/diegormirhan",
  githubUser: "diegormirhan",
  linkedin: "https://www.linkedin.com/in/diegomirhan",
  medium: "https://medium.com/@diegomirhan",
  mediumUser: "@diegomirhan",
};

export type TimelineEntry = {
  period: string;
  title: string;
  org: string;
  description: string;
  tags?: string[];
};

export type FeaturedProject = {
  name: string;
  year: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
};

export type SkillIcon = "ai" | "code" | "web" | "infra";

export type SiteContent = {
  role: string;
  headline: string;
  summary: string;
  location: string;
  skillGroups: { title: string; icon: SkillIcon; items: string[] }[];
  languages: string[];
  experience: TimelineEntry[];
  education: TimelineEntry[];
  featuredProjects: FeaturedProject[];
};

const pt: SiteContent = {
  role: profile.role,
  headline: profile.headline,
  summary: profile.summary,
  location: "",
  skillGroups: [
    {
      title: "IA & Machine Learning",
      icon: "ai",
      items: [
        "LLMs locais (Ollama, vLLM)",
        "HuggingFace Transformers",
        "PyTorch",
        "Quantização (AWQ)",
        "Visão computacional e OCR",
        "RAG e agentes (CrewAI, LangChain)",
      ],
    },
    {
      title: "Linguagens & Dados",
      icon: "code",
      items: ["Python", "TypeScript", "JavaScript", "Node.js", "PHP", "SQL", "pandas", "NumPy"],
    },
    {
      title: "Frameworks & Web",
      icon: "web",
      items: ["React", "Next.js", "Tailwind", "Streamlit", "REST APIs", "asyncio"],
    },
    {
      title: "Infra & Dados",
      icon: "infra",
      items: ["Docker", "Git / CI-CD", "AWS", "PostgreSQL", "MongoDB", "Redis", "Tauri", "Electron"],
    },
  ],
  languages: [
    "Inglês — Avançado (C1)",
    "Francês — Iniciante (A1)",
  ],
  experience: [
    {
      period: "Jul 2024 — Mar 2025",
      title: "Desenvolvedor de Software",
      org: "Comando Geek Marketplace",
      description:
        "Administração, manutenção e desenvolvimento de funcionalidades da plataforma de marketplace geek, com aumento e retenção de usuários em 50%. Otimizações de performance e melhorias de UI/UX.",
      tags: ["WordPress", "PHP", "JavaScript", "UI/UX"],
    },
    {
      period: "Nov 2019 — Jun 2026",
      title: "Atendimento e Gestão",
      org: "Empreendimento Familiar",
      description:
        "Atendimento ao cliente online e presencial no ramo hoteleiro: comunicação direta, trabalho em equipe, gestão de tarefas e reservas e resolução de problemas.",
      tags: ["Atendimento", "Gestão", "Resolução de problemas"],
    },
  ],
  education: [
    {
      period: "Fev 2025 — Presente",
      title: "Bacharelado em Ciência da Computação",
      org: "Universidade Cruzeiro do Sul Virtual (Polo UNIFRAN)",
      description:
        "4º semestre. Cálculo 1 e 2, Álgebra Linear, Cálculo Numérico e Matemática Discreta, entre outras disciplinas.",
      tags: ["Data Science", "Machine Learning", "Pesquisa em IA"],
    },
  ],
  featuredProjects: [
    {
      name: "voice-assistant",
      year: "2026",
      title: "Voice Assistant — IA de voz 100% local",
      description:
        "Assistente de voz full-duplex com visão de tela para Windows: conversa com interrupção e respostas conscientes do que está na tela, totalmente offline, sem nuvem e sem API keys.",
      url: "https://github.com/diegormirhan/voice-assistant",
      tags: ["GGML", "Vulkan", "LLM local", "Speech"],
    },
    {
      name: "llm-inference-benchmark",
      year: "2026",
      title: "LLM Inference Benchmark — GPU AMD/ROCm",
      description:
        "Benchmark comparativo de 4 engines de inferência de LLMs (HuggingFace, vLLM, AWQ e speculative decoding) em hardware AMD, com telemetria de throughput, latência e VRAM em tempo real e dashboard em Streamlit.",
      url: "https://github.com/diegormirhan/llm-inference-benchmark",
      tags: ["vLLM", "ROCm", "AWQ", "Streamlit"],
    },
    {
      name: "intelligence-ocr",
      year: "2026",
      title: "Intelligence OCR — pipeline local de documentos com IA",
      description:
        "Pipeline assíncrono que extrai dados estruturados de notas, contratos e recibos com visão + LLMs locais (GLM-OCR, Qwen 2.5 via Ollama), cache instantâneo em PostgreSQL/JSONB e Docker.",
      url: "https://github.com/diegormirhan/intelligence-ocr",
      tags: ["asyncio", "Ollama", "PostgreSQL", "Docker"],
    },
    {
      name: "all-in-one-downloader-bot",
      year: "2023 — 2025",
      title: "All-in-One Downloader Bot — bot de Telegram",
      description:
        "Bot de Telegram para download de mídia de múltiplas redes sociais, com 61 estrelas no GitHub.",
      url: "https://github.com/diegormirhan/all-in-one-downloader-bot",
      tags: ["Python", "Telegram API"],
    },
    {
      name: "all-in-one-download-app",
      year: "2024",
      title: "Best Media Tool — website React/Next.js",
      description:
        "Ferramenta web gratuita para download de vídeos, fotos e músicas de redes sociais; front-end em React e Next.js hospedado na AWS Amplify.",
      url: "https://github.com/diegormirhan/all-in-one-download-app",
      tags: ["React", "Next.js", "AWS Amplify"],
    },
  ],
};

const en: SiteContent = {
  role: "AI & Software Development",
  headline:
    "Computer Science student focused on Data Science and Machine Learning, building end-to-end local AI solutions.",
  summary:
    "I build end-to-end local AI solutions — local LLMs, computer vision, OCR and async data pipelines — plus full-stack web interfaces. I take part in Artificial Intelligence research and have optimized real e-commerce platforms. Advanced English (C1).",
  location: "",
  skillGroups: [
    {
      title: "AI & Machine Learning",
      icon: "ai",
      items: [
        "Local LLMs (Ollama, vLLM)",
        "HuggingFace Transformers",
        "PyTorch",
        "Quantization (AWQ)",
        "Computer vision and OCR",
        "RAG and agents (CrewAI, LangChain)",
      ],
    },
    {
      title: "Languages & Data",
      icon: "code",
      items: ["Python", "TypeScript", "JavaScript", "Node.js", "PHP", "SQL", "pandas", "NumPy"],
    },
    {
      title: "Frameworks & Web",
      icon: "web",
      items: ["React", "Next.js", "Tailwind", "Streamlit", "REST APIs", "asyncio"],
    },
    {
      title: "Infra & Data",
      icon: "infra",
      items: ["Docker", "Git / CI-CD", "AWS", "PostgreSQL", "MongoDB", "Redis", "Tauri", "Electron"],
    },
  ],
  languages: [
    "English — Advanced (C1)",
    "French — Beginner (A1)",
  ],
  experience: [
    {
      period: "Jul 2024 — Mar 2025",
      title: "Software Developer",
      org: "Comando Geek Marketplace",
      description:
        "Administration, maintenance and feature development for the geek marketplace platform, growing and retaining users by 50%. Performance optimizations and UI/UX improvements.",
      tags: ["WordPress", "PHP", "JavaScript", "UI/UX"],
    },
    {
      period: "Nov 2019 — Jun 2026",
      title: "Customer Service and Management",
      org: "Family Business",
      description:
        "Online and in-person customer service in the hospitality industry: direct communication, teamwork, task and booking management and problem solving.",
      tags: ["Customer service", "Management", "Problem solving"],
    },
  ],
  education: [
    {
      period: "Feb 2025 — Present",
      title: "BSc in Computer Science",
      org: "Universidade Cruzeiro do Sul Virtual (UNIFRAN campus)",
      description:
        "4th semester. Calculus 1 and 2, Linear Algebra, Numerical Methods and Discrete Mathematics, among other subjects.",
      tags: ["Data Science", "Machine Learning", "AI research"],
    },
  ],
  featuredProjects: [
    {
      name: "voice-assistant",
      year: "2026",
      title: "Voice Assistant — 100% local voice AI",
      description:
        "Full-duplex voice assistant with screen vision for Windows: interruptible conversation and screen-aware answers, fully offline, no cloud and no API keys.",
      url: "https://github.com/diegormirhan/voice-assistant",
      tags: ["GGML", "Vulkan", "Local LLM", "Speech"],
    },
    {
      name: "llm-inference-benchmark",
      year: "2026",
      title: "LLM Inference Benchmark — AMD/ROCm GPU",
      description:
        "Comparative benchmark of 4 LLM inference engines (HuggingFace, vLLM, AWQ and speculative decoding) on AMD hardware, with real-time throughput, latency and VRAM telemetry and a Streamlit dashboard.",
      url: "https://github.com/diegormirhan/llm-inference-benchmark",
      tags: ["vLLM", "ROCm", "AWQ", "Streamlit"],
    },
    {
      name: "intelligence-ocr",
      year: "2026",
      title: "Intelligence OCR — local AI document pipeline",
      description:
        "Async pipeline that extracts structured data from invoices, contracts and receipts using vision + local LLMs (GLM-OCR, Qwen 2.5 via Ollama), instant PostgreSQL/JSONB cache and Docker.",
      url: "https://github.com/diegormirhan/intelligence-ocr",
      tags: ["asyncio", "Ollama", "PostgreSQL", "Docker"],
    },
    {
      name: "all-in-one-downloader-bot",
      year: "2023 — 2025",
      title: "All-in-One Downloader Bot — Telegram bot",
      description:
        "Telegram bot for downloading media from multiple social networks, with 61 stars on GitHub.",
      url: "https://github.com/diegormirhan/all-in-one-downloader-bot",
      tags: ["Python", "Telegram API"],
    },
    {
      name: "all-in-one-download-app",
      year: "2024",
      title: "Best Media Tool — React/Next.js website",
      description:
        "Free web tool to download videos, photos and music from social networks; React and Next.js front-end hosted on AWS Amplify.",
      url: "https://github.com/diegormirhan/all-in-one-download-app",
      tags: ["React", "Next.js", "AWS Amplify"],
    },
  ],
};

export const contentByLang: Record<Lang, SiteContent> = { pt, en };

export const { skillGroups, languages, experience, education, featuredProjects } = pt;
