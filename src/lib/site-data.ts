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
  demo?: string;
  image?: string;
  imageAlt?: string;
  /** "window": mostra o print inteiro, como uma janela flutuando no card */
  imageFit?: "bleed" | "window";
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
      items: [
        "Docker",
        "Git / CI-CD",
        "AWS",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Tauri",
        "Electron",
      ],
    },
  ],
  languages: ["Inglês — Avançado (C1)", "Francês — Iniciante (A1)"],
  experience: [
    {
      period: "Jul 2024 — Mar 2025",
      title: "Desenvolvedor de Software",
      org: "Comando Geek Marketplace",
      description:
        "Administração, manutenção e desenvolvimento de funcionalidades da plataforma de marketplace geek, com aumento e retenção de usuários em 50%. Otimizações de performance e melhorias de UI/UX.",
      tags: ["WordPress", "PHP", "JavaScript", "UI/UX", "Marketplace"],
    },
    {
      period: "Nov 2019 — Jun 2026",
      title: "Atendimento e Gestão",
      org: "Empreendimento Familiar",
      description:
        "Atendimento ao cliente online e presencial no ramo hoteleiro: comunicação direta, trabalho em equipe, gestão de tarefas e reservas e resolução de problemas.",
      tags: ["Atendimento", "Gestão", "Resolução de problemas", "Hospitalidade"],
    },
  ],
  education: [
    {
      period: "Fev 2025 — Presente",
      title: "Bacharelado em Ciência da Computação",
      org: "Universidade Cruzeiro do Sul Virtual (Polo UNIFRAN)",
      description:
        "4º semestre. Foco em IA, Data Science e Machine Learning. Disciplinas: Cálculo 1 e 2, Álgebra Linear, Cálculo Numérico, Matemática Discreta, Algoritmos e Estruturas de Dados.",
      tags: ["Data Science", "Machine Learning", "Pesquisa em IA", "Algoritmos"],
    },
  ],
  featuredProjects: [
    {
      name: "toolhaven-desktop",
      year: "2026",
      title: "ToolHaven — central de ferramentas para Windows",
      description:
        "App desktop que reúne FFmpeg, yt-dlp, ImageMagick e mais 22 ferramentas numa interface só: baixar e converter mídia, editar imagens e PDFs, reconhecer músicas — sem linha de comando.",
      url: "https://github.com/diegormirhan/toolhaven-desktop",
      image: "/projects/toolhaven.webp",
      imageAlt: "Catálogo do ToolHaven no tema escuro",
      demo: "https://toolhaven-kohl.vercel.app/",
      tags: ["Tauri", "Rust", "React", "FFmpeg"],
    },
    {
      name: "polyrag",
      year: "2026",
      title: "PolyRAG — RAG federado e local",
      description:
        "Escolhe o armazenamento certo (grafo, vetorial ou relacional) por cálculo, não por agente, e mostra a rota e cada etapa do pipeline. Roda localmente em GPU AMD via Vulkan.",
      url: "https://github.com/diegormirhan/polyrag",
      image: "/projects/polyrag.webp",
      imageAlt: "Chat do PolyRAG com o placar de rotas e a cascata de spans",
      tags: ["FastAPI", "Qdrant", "llama.cpp", "SvelteKit"],
    },
    {
      name: "rasterscope",
      year: "2026",
      title: "RasterScope — mudança de cobertura do solo por satélite",
      description:
        "Workbench local de segmentação com U-Net e ONNX Runtime: mapas de incerteza, inspeção por pixel, benchmark de modelos, matriz de transição e relatórios offline.",
      url: "https://github.com/diegormirhan/rasterscope",
      image: "/projects/rasterscope.webp",
      imageAlt: "Comparação antes e depois no RasterScope",
      demo: "https://rasterscope.onrender.com/",
      tags: ["U-Net", "ONNX", "FastAPI", "React"],
    },
    {
      name: "aeropulse",
      year: "2026",
      title: "AeroPulse — manutenção preditiva de turbinas",
      description:
        "Previsão de vida útil restante para os motores turbofan NASA C-MAPSS com XGBoost, incerteza calibrada e IA explicável, de ponta a ponta e totalmente local.",
      url: "https://github.com/diegormirhan/aeropulse",
      image: "/projects/aeropulse.webp",
      imageAlt: "Dashboard de frota do AeroPulse",
      tags: ["XGBoost", "FastAPI", "React", "Docker"],
    },
    {
      name: "manim-editor",
      year: "2026",
      title: "Manim Editor — animações matemáticas visuais",
      description:
        "Editor desktop para criar animações matemáticas com Manim sem escrever código: biblioteca de elementos, inspetor de propriedades, linha do tempo e renderização local.",
      url: "https://github.com/diegormirhan/manim-editor",
      image: "/projects/manim-editor.webp",
      imageAlt: "Editor com uma integral renderizada e a linha do tempo",
      demo: "https://manim-editor-alpha.vercel.app/",
      tags: ["Tauri", "React", "Python", "Manim"],
    },
    {
      name: "voice-assistant",
      year: "2026",
      title: "Voice Assistant — IA de voz 100% local",
      description:
        "Assistente de voz full-duplex com visão de tela para Windows: conversa com interrupção e respostas conscientes do que está na tela, totalmente offline, sem nuvem e sem API keys.",
      url: "https://github.com/diegormirhan/voice-assistant",
      image: "/projects/voice-assistant.webp",
      imageFit: "window",
      imageAlt: "Interface do assistente de voz",
      tags: ["GGML", "Vulkan", "whisper.cpp", "llama.cpp"],
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
      items: [
        "Docker",
        "Git / CI-CD",
        "AWS",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Tauri",
        "Electron",
      ],
    },
  ],
  languages: ["English — Advanced (C1)", "French — Beginner (A1)"],
  experience: [
    {
      period: "Jul 2024 — Mar 2025",
      title: "Software Developer",
      org: "Comando Geek Marketplace",
      description:
        "Administration, maintenance and feature development for the geek marketplace platform, growing and retaining users by 50%. Performance optimizations and UI/UX improvements.",
      tags: ["WordPress", "PHP", "JavaScript", "UI/UX", "Marketplace"],
    },
    {
      period: "Nov 2019 — Jun 2026",
      title: "Customer Service and Management",
      org: "Family Business",
      description:
        "Online and in-person customer service in the hospitality industry: direct communication, teamwork, task and booking management and problem solving.",
      tags: ["Customer service", "Management", "Problem solving", "Hospitality"],
    },
  ],
  education: [
    {
      period: "Feb 2025 — Present",
      title: "BSc in Computer Science",
      org: "Universidade Cruzeiro do Sul Virtual (UNIFRAN campus)",
      description:
        "4th semester. Focus on AI, Data Science and Machine Learning. Subjects: Calculus 1 and 2, Linear Algebra, Numerical Methods, Discrete Mathematics, Algorithms and Data Structures.",
      tags: ["Data Science", "Machine Learning", "AI research", "Algorithms"],
    },
  ],
  featuredProjects: [
    {
      name: "toolhaven-desktop",
      year: "2026",
      title: "ToolHaven — a toolbox app for Windows",
      description:
        "Desktop app that brings FFmpeg, yt-dlp, ImageMagick and 22 more tools into one interface: download and convert media, edit images and PDFs, recognize music — no command line.",
      url: "https://github.com/diegormirhan/toolhaven-desktop",
      image: "/projects/toolhaven.webp",
      imageAlt: "The ToolHaven catalog in its dark theme",
      demo: "https://toolhaven-kohl.vercel.app/",
      tags: ["Tauri", "Rust", "React", "FFmpeg"],
    },
    {
      name: "polyrag",
      year: "2026",
      title: "PolyRAG — local federated RAG",
      description:
        "Picks the right store (graph, vector or relational) with arithmetic, not an agent, and shows the route and every pipeline step. Runs locally on AMD GPUs via Vulkan.",
      url: "https://github.com/diegormirhan/polyrag",
      image: "/projects/polyrag.webp",
      imageAlt: "PolyRAG chat with the route scoreboard and span waterfall",
      tags: ["FastAPI", "Qdrant", "llama.cpp", "SvelteKit"],
    },
    {
      name: "rasterscope",
      year: "2026",
      title: "RasterScope — satellite land-cover change",
      description:
        "Local segmentation workbench with U-Net and ONNX Runtime: uncertainty maps, pixel inspection, model benchmarking, transition matrices and offline reports.",
      url: "https://github.com/diegormirhan/rasterscope",
      image: "/projects/rasterscope.webp",
      imageAlt: "Before and after comparison in RasterScope",
      demo: "https://rasterscope.onrender.com/",
      tags: ["U-Net", "ONNX", "FastAPI", "React"],
    },
    {
      name: "aeropulse",
      year: "2026",
      title: "AeroPulse — turbofan predictive maintenance",
      description:
        "Remaining-useful-life forecasting for NASA C-MAPSS turbofan engines with XGBoost, calibrated uncertainty and explainable AI — end to end and fully local.",
      url: "https://github.com/diegormirhan/aeropulse",
      image: "/projects/aeropulse.webp",
      imageAlt: "AeroPulse fleet dashboard",
      tags: ["XGBoost", "FastAPI", "React", "Docker"],
    },
    {
      name: "manim-editor",
      year: "2026",
      title: "Manim Editor — visual math animations",
      description:
        "Desktop editor for building mathematical animations with Manim without writing code: element library, property inspector, timeline and local rendering.",
      url: "https://github.com/diegormirhan/manim-editor",
      image: "/projects/manim-editor.webp",
      imageAlt: "The editor with a rendered integral and the timeline",
      demo: "https://manim-editor-alpha.vercel.app/",
      tags: ["Tauri", "React", "Python", "Manim"],
    },
    {
      name: "voice-assistant",
      year: "2026",
      title: "Voice Assistant — 100% local voice AI",
      description:
        "Full-duplex voice assistant with screen vision for Windows: interruptible conversation and screen-aware answers, fully offline, no cloud and no API keys.",
      url: "https://github.com/diegormirhan/voice-assistant",
      image: "/projects/voice-assistant.webp",
      imageFit: "window",
      imageAlt: "The voice assistant interface",
      tags: ["GGML", "Vulkan", "whisper.cpp", "llama.cpp"],
    },
  ],
};

export const contentByLang: Record<Lang, SiteContent> = { pt, en };

export const { skillGroups, languages, experience, education, featuredProjects } = pt;
