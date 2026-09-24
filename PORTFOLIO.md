---
# Fonte única de conteúdo do portfólio. O site (src/) importa este arquivo no build.
# Edite aqui; textos em pt e en ficam lado a lado.

profile:
  name: Diego Mirhan
  email: mirhan.diego@gmail.com
  phone: "(12) 99141-0569"
  site: https://diegomirhan.com
  resume: /diego-mirhan-cv.pdf
  logo: /logo.png
  github: https://github.com/diegormirhan
  githubUser: diegormirhan
  linkedin: https://www.linkedin.com/in/diegomirhan
  linkedinHandle: /in/diegomirhan
  medium: https://medium.com/@diegomirhan
  mediumUser: "@diegomirhan"

pt:
  role: IA & Desenvolvimento de Software
  headline: Estudante de Ciência da Computação com foco em Data Science e Machine Learning, construindo soluções de IA local de ponta a ponta.
  lede: Construo soluções de IA local de ponta a ponta, do modelo à interface.
  summary: Desenvolvo soluções de IA local ponta a ponta (LLMs locais, visão computacional, OCR e pipelines de dados assíncronos), além de interfaces web full-stack. Participo de pesquisas em Inteligência Artificial e já otimizei plataformas reais de e-commerce. Inglês avançado (C1).
  about: Participo de pesquisas em Inteligência Artificial e gosto de levar modelos do papel para o mundo real, rodando localmente, com dados privados, boa performance e uma interface que qualquer pessoa consiga usar.
  focus: Pesquisa em IA generativa aplicada, inferência local de modelos e engenharia de dados.
  highlights:
    - title: IA aplicada
      description: LLMs locais, visão computacional e OCR levados a produção com foco em privacidade e desempenho.
    - title: Engenharia de dados
      description: Pipelines assíncronos, modelagem e automações que transformam dados brutos em decisão.
    - title: Produto ponta a ponta
      description: Do experimento à interface, aplicações web full-stack pensadas para quem usa, não só para quem programa.
  languages:
    - "Inglês: avançado (C1)"
    - "Francês: iniciante (A1)"
  skillGroups:
    - title: IA & Machine Learning
      items: ["LLMs locais (Ollama, vLLM)", HuggingFace Transformers, PyTorch, Quantização (AWQ), Visão computacional e OCR, "RAG e agentes (CrewAI, LangChain)"]
    - title: Linguagens & Dados
      items: [Python, TypeScript, JavaScript, Node.js, PHP, SQL, pandas, NumPy]
    - title: Frameworks & Web
      items: [React, Next.js, Tailwind, Streamlit, REST APIs, asyncio]
    - title: Infra & Dados
      items: [Docker, Git / CI-CD, AWS, PostgreSQL, MongoDB, Redis, Tauri, Electron]
  experience:
    - period: Jul 2024 - Mar 2025
      title: Desenvolvedor de Software
      org: Comando Geek Marketplace
      description: Administração, manutenção e desenvolvimento de funcionalidades da plataforma de marketplace geek, com aumento e retenção de usuários em 50%. Otimizações de performance e melhorias de UI/UX.
      tags: [WordPress, PHP, JavaScript, UI/UX, Marketplace]
    - period: Nov 2019 - Jun 2026
      title: Atendimento e Gestão
      org: Empreendimento Familiar
      description: Atendimento ao cliente online e presencial no ramo hoteleiro, com comunicação direta, trabalho em equipe, gestão de tarefas e reservas e resolução de problemas.
      tags: [Atendimento, Gestão, Resolução de problemas, Hospitalidade]
  education:
    - period: Fev 2025 - Presente
      title: Bacharelado em Ciência da Computação
      org: Universidade Cruzeiro do Sul Virtual (Polo UNIFRAN)
      description: "4º semestre. Foco em IA, Data Science e Machine Learning. Disciplinas: Cálculo 1 e 2, Álgebra Linear, Cálculo Numérico, Matemática Discreta, Algoritmos e Estruturas de Dados."
      tags: [Data Science, Machine Learning, Pesquisa em IA, Algoritmos]
  projects:
    toolhaven-desktop:
      title: ToolHaven
      tagline: Central de ferramentas para Windows
      description: App desktop que reúne FFmpeg, yt-dlp, ImageMagick e mais 22 ferramentas numa interface só, para baixar e converter mídia, editar imagens e PDFs e reconhecer músicas sem linha de comando.
      imageAlt: Catálogo do ToolHaven no tema escuro
    polyrag:
      title: PolyRAG
      tagline: RAG federado e local
      description: Escolhe o armazenamento certo (grafo, vetorial ou relacional) por cálculo, não por agente, e mostra a rota e cada etapa do pipeline. Roda localmente em GPU AMD via Vulkan.
      imageAlt: Chat do PolyRAG com o placar de rotas e a cascata de spans
    rasterscope:
      title: RasterScope
      tagline: Mudança de cobertura do solo por satélite
      description: Workbench local de segmentação com U-Net e ONNX Runtime, com mapas de incerteza, inspeção por pixel, benchmark de modelos, matriz de transição e relatórios offline.
      imageAlt: Comparação antes e depois no RasterScope
    aeropulse:
      title: AeroPulse
      tagline: Manutenção preditiva de turbinas
      description: Previsão de vida útil restante para os motores turbofan NASA C-MAPSS com XGBoost, incerteza calibrada e IA explicável, de ponta a ponta e totalmente local.
      imageAlt: Dashboard de frota do AeroPulse
    manim-editor:
      title: Manim Editor
      tagline: Animações matemáticas visuais
      description: Editor desktop para criar animações matemáticas com Manim sem escrever código, com biblioteca de elementos, inspetor de propriedades, linha do tempo e renderização local.
      imageAlt: Editor com uma integral renderizada e a linha do tempo
    voice-assistant:
      title: Voice Assistant
      tagline: IA de voz 100% local
      description: Assistente de voz full-duplex com visão de tela para Windows, com conversa interrompível e respostas conscientes do que está na tela, totalmente offline, sem nuvem e sem API keys.
      imageAlt: Interface do assistente de voz

en:
  role: AI & Software Development
  headline: Computer Science student focused on Data Science and Machine Learning, building end-to-end local AI solutions.
  lede: I build local AI solutions end to end, from the model to the interface.
  summary: I build end-to-end local AI solutions (local LLMs, computer vision, OCR and async data pipelines), plus full-stack web interfaces. I take part in Artificial Intelligence research and have optimized real e-commerce platforms. Advanced English (C1).
  about: I take part in Artificial Intelligence research and love moving models from paper to the real world, running locally, with private data, solid performance and an interface anyone can use.
  focus: Research on applied generative AI, local model inference and data engineering.
  highlights:
    - title: Applied AI
      description: Local LLMs, computer vision and OCR shipped to production with privacy and performance in mind.
    - title: Data engineering
      description: Async pipelines, modeling and automation that turn raw data into decisions.
    - title: End-to-end product
      description: From experiment to interface, full-stack web apps built for the people who use them.
  languages:
    - "English: advanced (C1)"
    - "French: beginner (A1)"
  skillGroups:
    - title: AI & Machine Learning
      items: ["Local LLMs (Ollama, vLLM)", HuggingFace Transformers, PyTorch, Quantization (AWQ), Computer vision and OCR, "RAG and agents (CrewAI, LangChain)"]
    - title: Languages & Data
      items: [Python, TypeScript, JavaScript, Node.js, PHP, SQL, pandas, NumPy]
    - title: Frameworks & Web
      items: [React, Next.js, Tailwind, Streamlit, REST APIs, asyncio]
    - title: Infra & Data
      items: [Docker, Git / CI-CD, AWS, PostgreSQL, MongoDB, Redis, Tauri, Electron]
  experience:
    - period: Jul 2024 - Mar 2025
      title: Software Developer
      org: Comando Geek Marketplace
      description: Administration, maintenance and feature development for the geek marketplace platform, growing and retaining users by 50%. Performance optimizations and UI/UX improvements.
      tags: [WordPress, PHP, JavaScript, UI/UX, Marketplace]
    - period: Nov 2019 - Jun 2026
      title: Customer Service and Management
      org: Family Business
      description: Online and in-person customer service in the hospitality industry, with direct communication, teamwork, task and booking management and problem solving.
      tags: [Customer service, Management, Problem solving, Hospitality]
  education:
    - period: Feb 2025 - Present
      title: BSc in Computer Science
      org: Universidade Cruzeiro do Sul Virtual (UNIFRAN campus)
      description: "4th semester. Focus on AI, Data Science and Machine Learning. Subjects: Calculus 1 and 2, Linear Algebra, Numerical Methods, Discrete Mathematics, Algorithms and Data Structures."
      tags: [Data Science, Machine Learning, AI research, Algorithms]
  projects:
    toolhaven-desktop:
      title: ToolHaven
      tagline: A toolbox app for Windows
      description: Desktop app that brings FFmpeg, yt-dlp, ImageMagick and 22 more tools into one interface to download and convert media, edit images and PDFs and recognize music with no command line.
      imageAlt: The ToolHaven catalog in its dark theme
    polyrag:
      title: PolyRAG
      tagline: Local federated RAG
      description: Picks the right store (graph, vector or relational) with arithmetic, not an agent, and shows the route and every pipeline step. Runs locally on AMD GPUs via Vulkan.
      imageAlt: PolyRAG chat with the route scoreboard and span waterfall
    rasterscope:
      title: RasterScope
      tagline: Satellite land-cover change
      description: Local segmentation workbench with U-Net and ONNX Runtime, with uncertainty maps, pixel inspection, model benchmarking, transition matrices and offline reports.
      imageAlt: Before and after comparison in RasterScope
    aeropulse:
      title: AeroPulse
      tagline: Turbofan predictive maintenance
      description: Remaining-useful-life forecasting for NASA C-MAPSS turbofan engines with XGBoost, calibrated uncertainty and explainable AI, end to end and fully local.
      imageAlt: AeroPulse fleet dashboard
    manim-editor:
      title: Manim Editor
      tagline: Visual math animations
      description: Desktop editor for building mathematical animations with Manim without writing code, with an element library, property inspector, timeline and local rendering.
      imageAlt: The editor with a rendered integral and the timeline
    voice-assistant:
      title: Voice Assistant
      tagline: 100% local voice AI
      description: Full-duplex voice assistant with screen vision for Windows, with interruptible conversation and screen-aware answers, fully offline, no cloud and no API keys.
      imageAlt: The voice assistant interface

# Dados que não mudam por idioma. A ordem aqui é a ordem no site.
projects:
  - slug: toolhaven-desktop
    year: "2026"
    repo: diegormirhan/toolhaven-desktop
    image: /projects/toolhaven.webp
    demo: https://toolhaven-kohl.vercel.app/
    tags: [Tauri, Rust, React, FFmpeg]
  - slug: polyrag
    year: "2026"
    repo: diegormirhan/polyrag
    image: /projects/polyrag.webp
    tags: [FastAPI, Qdrant, llama.cpp, SvelteKit]
  - slug: rasterscope
    year: "2026"
    repo: diegormirhan/rasterscope
    image: /projects/rasterscope.webp
    demo: https://rasterscope.onrender.com/
    tags: [U-Net, ONNX, FastAPI, React]
  - slug: aeropulse
    year: "2026"
    repo: diegormirhan/aeropulse
    image: /projects/aeropulse.webp
    tags: [XGBoost, FastAPI, React, Docker]
  - slug: manim-editor
    year: "2026"
    repo: diegormirhan/manim-editor
    image: /projects/manim-editor.webp
    demo: https://manim-editor-alpha.vercel.app/
    tags: [Tauri, React, Python, Manim]
  - slug: voice-assistant
    year: "2026"
    repo: diegormirhan/voice-assistant
    image: /projects/voice-assistant.webp
    tags: [GGML, Vulkan, whisper.cpp, llama.cpp]
---

# Portfólio: Diego Mirhan

Todo o conteúdo do site está no frontmatter acima. Este corpo documenta de onde vêm os dados que não ficam aqui.

## Dados buscados no build

- **README de cada projeto**: `https://raw.githubusercontent.com/<repo>/HEAD/README.md`, renderizado na página `/projetos/<slug>`.
- **Repositórios fixados do GitHub**: `https://pinned.berrysauce.dev/get/diegormirhan`. Se falhar, cai para os 6 repositórios com mais estrelas via `https://api.github.com/users/diegormirhan/repos` (ignorando forks e arquivados).
- **Artigos do Medium**: feed `https://medium.com/feed/@diegomirhan` via `https://api.rss2json.com/v1/api.json`. O Medium não informa o idioma do post, então ele é inferido pela frequência de stopwords PT/EN, e cada idioma do site mostra só os seus artigos.

## Arquivos estáticos (`public/`)

- `diego-mirhan-cv.pdf`: currículo para download.
- `logo.png` / `favicon.png`: monograma "D".
- `projects/*.webp`: prints dos projetos em destaque.

## Contexto do produto

- **Missão:** mostrar Diego Mirhan como engenheiro de software especializado em IA, dados e desenvolvimento web, numa experiência imersiva e rápida.
- **Público:** recrutadores técnicos e gestores de engenharia (profundidade técnica, apresentação profissional), outros desenvolvedores (curiosidade técnica) e possíveis clientes ou colaboradores.
- **Valores:** tecnologia de ponta (IA e inferência local), acabamento em cada detalhe, desempenho inegociável, sensação de aplicação e não de página estática.

## Direção de design (redesign 2026)

- Tema escuro único, azul cobalto (primária) e azul cerúleo (secundária).
- Referências principais: emotion-agency.com e portfolio.widehue.co/rezonbio.
- Nuvem de partículas em Three.js fixa ao fundo que forma o monograma "D" e vira esfera, rede neural e onda conforme o scroll; brilho de hover no fundo que empurra as partículas.
- Preloader com contador em %, transições de scroll (GSAP + Lenis), bolhas flutuantes, menu hambúrguer em tela cheia no canto superior direito.
- Sem cards e sem frases de apoio nas seções; listas são linhas tipográficas com preview no hover.
- Páginas: início, projetos (+ uma por projeto, com README), blog, experiência/skills, contato (sem formulário). PT na raiz, EN em `/en/`, troca por bandeira.
