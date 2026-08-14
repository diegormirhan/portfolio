import {
  Bot,
  Box,
  Brain,
  Cloud,
  Code,
  Container,
  Cpu,
  Database,
  FileCode,
  Flame,
  GitBranch,
  Globe,
  Hexagon,
  Layout,
  Layers,
  Scan,
  Server,
  Terminal,
  Triangle,
  Wind,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type SkillConfig = {
  icon: LucideIcon;
  iconClass: string;
  chipClass: string;
};

const cfg = (icon: LucideIcon, iconClass: string, chipClass: string): SkillConfig => ({
  icon,
  iconClass,
  chipClass,
});

export const skillConfig: Record<string, SkillConfig> = {
  // AI & Machine Learning
  "LLMs locais (Ollama, vLLM)": cfg(Brain, "text-violet-400", "bg-violet-400/10"),
  "Local LLMs (Ollama, vLLM)": cfg(Brain, "text-violet-400", "bg-violet-400/10"),
  "HuggingFace Transformers": cfg(Bot, "text-yellow-400", "bg-yellow-400/10"),
  PyTorch: cfg(Flame, "text-orange-400", "bg-orange-400/10"),
  "Quantização (AWQ)": cfg(Cpu, "text-cyan-400", "bg-cyan-400/10"),
  "Quantization (AWQ)": cfg(Cpu, "text-cyan-400", "bg-cyan-400/10"),
  "Visão computacional e OCR": cfg(Scan, "text-blue-400", "bg-blue-400/10"),
  "Computer vision and OCR": cfg(Scan, "text-blue-400", "bg-blue-400/10"),
  "RAG e agentes (CrewAI, LangChain)": cfg(Workflow, "text-emerald-400", "bg-emerald-400/10"),
  "RAG and agents (CrewAI, LangChain)": cfg(Workflow, "text-emerald-400", "bg-emerald-400/10"),

  // Languages & Data
  Python: cfg(Terminal, "text-sky-400", "bg-sky-400/10"),
  TypeScript: cfg(FileCode, "text-blue-500", "bg-blue-500/10"),
  JavaScript: cfg(Code, "text-yellow-400", "bg-yellow-400/10"),
  "Node.js": cfg(Hexagon, "text-green-500", "bg-green-500/10"),
  PHP: cfg(Code, "text-indigo-400", "bg-indigo-400/10"),
  SQL: cfg(Database, "text-slate-400", "bg-slate-400/10"),
  pandas: cfg(Layers, "text-teal-400", "bg-teal-400/10"),
  NumPy: cfg(Box, "text-cyan-500", "bg-cyan-500/10"),

  // Frameworks & Web
  React: cfg(Layout, "text-sky-400", "bg-sky-400/10"),
  "Next.js": cfg(Globe, "text-slate-300", "bg-slate-300/10"),
  Tailwind: cfg(Wind, "text-cyan-400", "bg-cyan-400/10"),
  Streamlit: cfg(Triangle, "text-rose-400", "bg-rose-400/10"),
  "REST APIs": cfg(Server, "text-violet-400", "bg-violet-400/10"),
  asyncio: cfg(Zap, "text-amber-400", "bg-amber-400/10"),

  // Infra & Data
  Docker: cfg(Container, "text-blue-500", "bg-blue-500/10"),
  "Git / CI-CD": cfg(GitBranch, "text-orange-500", "bg-orange-500/10"),
  AWS: cfg(Cloud, "text-amber-500", "bg-amber-500/10"),
  PostgreSQL: cfg(Database, "text-blue-600", "bg-blue-600/10"),
  MongoDB: cfg(Database, "text-green-500", "bg-green-500/10"),
  Redis: cfg(Server, "text-red-500", "bg-red-500/10"),
  Tauri: cfg(Box, "text-purple-400", "bg-purple-400/10"),
  Electron: cfg(Box, "text-cyan-500", "bg-cyan-500/10"),
};

export function getSkillConfig(name: string): SkillConfig {
  return skillConfig[name] ?? cfg(Server, "text-primary", "bg-primary/10");
}
