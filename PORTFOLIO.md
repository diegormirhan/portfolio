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
      overview:
        - "O ToolHaven reúne 25 ferramentas open source (FFmpeg, yt-dlp, qpdf, ImageMagick, Tesseract e outras) numa única janela, com uma fila de tarefas só. Nove já vêm no instalador; as demais o app baixa, verifica e instala sozinho, mostrando o tamanho do download antes."
        - "Além delas, traz cerca de noventa ferramentas rápidas embutidas (texto, hashes, datas, calculadoras, cores, QR codes e mockups de conversa) que funcionam sem instalar nada. Tudo roda na sua máquina, em português ou inglês, sem conta, nuvem ou telemetria."
      highlights:
        - title: "Sem shell"
          text: "Cada operação é um pedido tipado que vira executável e lista de argumentos. Nenhuma string passa por um shell, então um arquivo chamado \"; rm -rf\" é só um nome de arquivo."
        - title: "Downloads verificados"
          text: "Cada ferramenta é fixada por URL, versão e SHA-256. Um download que não bate com o hash é recusado, e nada pede permissão de administrador."
        - title: "Fila que não para"
          text: "Feche a ferramenta e o job continua. Parar um job encerra toda a árvore de processos, e o histórico sobrevive a reinícios."
        - title: "Organizado por resultado"
          text: "As categorias têm o nome do que você quer obter (um vídeo menor, um PDF unido, o texto de um scan), não do projeto que faz o trabalho."
    polyrag:
      title: PolyRAG
      tagline: RAG federado e local
      description: Escolhe o armazenamento certo (grafo, vetorial ou relacional) por cálculo, não por agente, e mostra a rota e cada etapa do pipeline. Roda localmente em GPU AMD via Vulkan.
      imageAlt: Chat do PolyRAG com o placar de rotas e a cascata de spans
      overview:
        - "Coloque uma planilha, um recibo escaneado e um documento de política numa pasta. O PolyRAG lê cada arquivo, divide em trechos e decide, trecho a trecho, se ele vai para uma tabela SQL, um índice vetorial ou um grafo de conhecimento. Na hora da pergunta, a mesma decisão escolhe onde procurar."
        - "A premissa é o oposto dos RAGs baseados em agentes: usar matemática determinística sempre que ela consegue decidir e deixar o modelo só para escrever a resposta. Cada etapa se reporta ao vivo, então dá para ver a rota escolhida e os números por trás dela."
      highlights:
        - title: "Roteamento por cálculo"
          text: "Similaridade de cosseno com margem contra âncoras de configuração, uma heurística de tabularidade antes e a evidência das seções de cada base só em caso de empate."
        - title: "Três bases, um motor"
          text: "SQLite com Text-to-SQL, Qdrant com HNSW e um grafo em networkx consultado por PageRank personalizado."
        - title: "Tudo observável"
          text: "Spans do OpenTelemetry chegam por WebSocket à interface: o placar de cada rota, a margem que decidiu e a latência de cada passo."
        - title: "100% local"
          text: "Três modelos servidos pelo llama.cpp em GPU AMD via Vulkan, sem CUDA, Docker ou nuvem. Funciona entre idiomas graças aos embeddings do BGE-M3."
    rasterscope:
      title: RasterScope
      tagline: Mudança de cobertura do solo por satélite
      description: Workbench local de segmentação com U-Net e ONNX Runtime, com mapas de incerteza, inspeção por pixel, benchmark de modelos, matriz de transição e relatórios offline.
      imageAlt: Comparação antes e depois no RasterScope
      overview:
        - "Aponte o RasterScope para duas imagens de satélite alinhadas do mesmo lugar, com anos de diferença. Uma U-Net compacta classifica cada pixel em uma de sete classes de cobertura do solo, e código determinístico transforma esses rótulos em hectares, variações e uma matriz de transição completa."
        - "A ideia é que só uma etapa do sistema é incerta, a rede neural, e a interface deixa claro qual é. Todo o resto é aritmética que dá para ler, testar e reproduzir. Roda localmente em CPU com ONNX Runtime, sem GPU, chave de API ou nuvem."
      highlights:
        - title: "Comparação lado a lado"
          text: "Um divisor arrastável entre as duas datas e um clique em qualquer pixel para ver classe, confiança e entropia."
        - title: "Honesto sobre o modelo"
          text: "O laboratório de modelo mostra mIoU, Dice, calibração e a matriz de confusão, incluindo as classes que a rede nunca prevê."
        - title: "Cálculo auditável"
          text: "Área por classe é contagem de pixels × 10 m × 10 m; transições são uma contagem 7 × 7 entre as duas máscaras. Esses testes rodam em milissegundos, sem modelo."
        - title: "Relatório portátil"
          text: "Exporta a análise como um único arquivo HTML autocontido, gerado a partir dos mesmos dados que aparecem na tela."
    aeropulse:
      title: AeroPulse
      tagline: Manutenção preditiva de turbinas
      description: Previsão de vida útil restante para os motores turbofan NASA C-MAPSS com XGBoost, incerteza calibrada e IA explicável, de ponta a ponta e totalmente local.
      imageAlt: Dashboard de frota do AeroPulse
      overview:
        - "O AeroPulse transforma a telemetria de motores turbofan (dataset NASA C-MAPSS) num espaço de trabalho de manutenção. Estima a vida útil restante de cada motor, ordena a frota por urgência, mostra a incerteza de cada estimativa e explica quais sinais pesaram na previsão."
        - "É um produto de machine learning de ponta a ponta, não um notebook: aquisição de dados reproduzível, features temporais sem vazamento, comparação de modelos, intervalos de incerteza calibrados, uma API FastAPI tipada e uma interface React, tudo servido localmente."
      highlights:
        - title: "Frota por prioridade"
          text: "Os 100 motores de teste ordenados pela vida útil prevista, separados nas faixas crítica, atenção e estável."
        - title: "XGBoost com janelas"
          text: "RMSE de 17,2 ciclos no conjunto de teste oficial, comparado a uma baseline Ridge usada como referência."
        - title: "Incerteza sem maquiagem"
          text: "Intervalo de ±29,9 ciclos a partir dos resíduos de validação. A cobertura medida no teste foi de 82%, abaixo dos 90% nominais, e o app mostra essa diferença."
        - title: "Previsões explicáveis"
          text: "Importância global das features e as contribuições locais do XGBoost para cada motor."
    manim-editor:
      title: Manim Editor
      tagline: Animações matemáticas visuais
      description: Editor desktop para criar animações matemáticas com Manim sem escrever código, com biblioteca de elementos, inspetor de propriedades, linha do tempo e renderização local.
      imageAlt: Editor com uma integral renderizada e a linha do tempo
      overview:
        - "Uma ideia matemática pode ser simples de esboçar e trabalhosa de traduzir em Python: achar a classe certa, lembrar os parâmetros, posicionar os objetos, sequenciar as animações e renderizar de novo. O Manim Editor torna visual a parte repetitiva desse processo."
        - "Você monta o gráfico, escreve a equação, sombreia a integral e decide numa linha do tempo quando cada peça aparece. O editor transforma isso num projeto versionado e em Python legível, e o Manim renderiza o vídeo de verdade na sua máquina."
      highlights:
        - title: "Linha do tempo"
          text: "Clips arrastáveis e redimensionáveis, grupos paralelos, tempos em segundos e ajuste fino pelo teclado."
        - title: "17 elementos, 13 animações"
          text: "Texto, LaTeX, formas, eixos, planos, gráficos de funções e áreas, com entradas, movimento, ênfase e saídas."
        - title: "O projeto é dado, não código"
          text: "Um JSON versionado, validado por um schema compartilhado entre TypeScript, Rust e Python. O código Manim é gerado a partir dele."
        - title: "Expressões seguras"
          text: "Digite sin(2x)/2 ou (x - 2)^2 + 1. Um parser próprio aceita só notação matemática, aponta a coluna do erro e nunca executa Python arbitrário."
    voice-assistant:
      title: Voice Assistant
      tagline: IA de voz 100% local
      description: Assistente de voz full-duplex com visão de tela para Windows, com conversa interrompível e respostas conscientes do que está na tela, totalmente offline, sem nuvem e sem API keys.
      imageAlt: Interface do assistente de voz
      overview:
        - "Um assistente de voz para Windows com áudio full-duplex de verdade: dá para interrompê-lo no meio de uma frase, e a interrupção vira a próxima pergunta. No instante em que você fala, ele captura a tela e usa a imagem como contexto para responder."
        - "Todo o pipeline roda localmente, com uma única infraestrutura de GPU (GGML + Vulkan) compartilhada entre o reconhecimento de fala e o LLM, o que o torna portátil entre GPUs AMD, NVIDIA e Intel. A meta é menos de 2 segundos entre o fim da sua fala e a primeira sílaba da resposta."
      highlights:
        - title: "Interrupção natural"
          text: "Barge-in com menos de 100 ms de latência, detectado pelo VAD Silero enquanto o assistente ainda fala."
        - title: "Visão da tela"
          text: "Um screenshot vai para o modelo junto com a pergunta; dá para desligar nas configurações, por privacidade."
        - title: "Voz em streaming"
          text: "A transcrição chega em tempo real e a resposta é falada frase por frase enquanto é gerada, com Piper em português."
        - title: "Sem nuvem"
          text: "whisper.cpp e llama.cpp em Vulkan, com modelos baixados do Hugging Face no primeiro uso. Sem chave de API e sem dados saindo da máquina."

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
      overview:
        - "ToolHaven puts 25 open-source tools (FFmpeg, yt-dlp, qpdf, ImageMagick, Tesseract and others) in one window with a single job queue. Nine ship inside the installer; the app downloads, verifies and installs the rest on its own, showing the download size first."
        - "It also includes about ninety built-in quick tools (text, hashes, dates, calculators, colours, QR codes and chat mockups) that need nothing installed. Everything runs on your machine, in English or Brazilian Portuguese, with no account, cloud or telemetry."
      highlights:
        - title: "No shell"
          text: "Every operation is a typed request resolved into an executable and an argument list. No string ever reaches a shell, so a file named \"; rm -rf\" is just a file name."
        - title: "Verified downloads"
          text: "Each tool is pinned to a URL, a version and a SHA-256. A download that does not match its digest is refused, and nothing asks for administrator rights."
        - title: "A queue that keeps going"
          text: "Close the tool and the job keeps running. Stopping a job ends its whole process tree, and the history survives a restart."
        - title: "Grouped by result"
          text: "Categories are named after what you want to get (a smaller video, a merged PDF, the text from a scan), not after the project doing the work."
    polyrag:
      title: PolyRAG
      tagline: Local federated RAG
      description: Picks the right store (graph, vector or relational) with arithmetic, not an agent, and shows the route and every pipeline step. Runs locally on AMD GPUs via Vulkan.
      imageAlt: PolyRAG chat with the route scoreboard and span waterfall
      overview:
        - "Drop a spreadsheet, a scanned receipt and a policy document into one folder. PolyRAG reads each file, splits it into chunks and decides, chunk by chunk, whether it belongs in a SQL table, a vector index or a knowledge graph. When you ask a question, the same decision picks where to look."
        - "The premise is the opposite of agent-based RAG: use deterministic maths wherever it can decide, and keep the model only for writing the answer. Every step reports itself live, so you can watch the route being chosen and the numbers behind it."
      highlights:
        - title: "Routing by arithmetic"
          text: "Cosine similarity with a margin against configured anchors, a tabularity heuristic before it, and each store's section headings as evidence only when two routes tie."
        - title: "Three stores, one engine"
          text: "SQLite with Text-to-SQL, Qdrant with HNSW and a networkx graph queried with Personalized PageRank."
        - title: "Fully observable"
          text: "OpenTelemetry spans stream over WebSocket to the interface: each route's score, the margin that decided it and every step's latency."
        - title: "100% local"
          text: "Three models served by llama.cpp on an AMD GPU through Vulkan, with no CUDA, Docker or cloud. Works across languages thanks to BGE-M3 embeddings."
    rasterscope:
      title: RasterScope
      tagline: Satellite land-cover change
      description: Local segmentation workbench with U-Net and ONNX Runtime, with uncertainty maps, pixel inspection, model benchmarking, transition matrices and offline reports.
      imageAlt: Before and after comparison in RasterScope
      overview:
        - "Point RasterScope at two aligned satellite images of the same place, years apart. A compact U-Net labels every pixel with one of seven land-cover classes, and deterministic code turns those labels into hectares, deltas and a complete transition matrix."
        - "The idea is that exactly one step in the system is uncertain, the neural network, and the interface says which one. Everything else is arithmetic you can read, test and re-run. It runs locally on CPU with ONNX Runtime, with no GPU, API key or cloud."
      highlights:
        - title: "Side-by-side comparison"
          text: "A draggable divider between the two dates, and a click on any pixel shows its class, confidence and entropy."
        - title: "Honest about the model"
          text: "The model lab shows mIoU, Dice, calibration and the confusion matrix, including the classes the network never predicts."
        - title: "Auditable maths"
          text: "Area per class is pixel count × 10 m × 10 m; transitions are a 7 × 7 count over the two masks. Those tests run in milliseconds, with no model."
        - title: "Portable report"
          text: "Exports the analysis as one self-contained HTML file, rendered from the same data shown on screen."
    aeropulse:
      title: AeroPulse
      tagline: Turbofan predictive maintenance
      description: Remaining-useful-life forecasting for NASA C-MAPSS turbofan engines with XGBoost, calibrated uncertainty and explainable AI, end to end and fully local.
      imageAlt: AeroPulse fleet dashboard
      overview:
        - "AeroPulse turns turbofan engine telemetry (the NASA C-MAPSS dataset) into a maintenance workspace. It estimates each engine's remaining useful life, ranks the fleet by urgency, shows the uncertainty of every estimate and explains which signals drove the prediction."
        - "It is an end-to-end machine-learning product, not a notebook: reproducible data acquisition, leakage-safe temporal features, model comparison, calibrated uncertainty intervals, a typed FastAPI service and a React interface, all served locally."
      highlights:
        - title: "Fleet by priority"
          text: "All 100 test engines ranked by predicted remaining life and split into critical, watch and stable bands."
        - title: "Windowed XGBoost"
          text: "17.2-cycle RMSE on the official test set, compared against a Ridge baseline kept as a reference."
        - title: "Uncertainty, unvarnished"
          text: "A ±29.9-cycle interval from validation residuals. Measured test coverage was 82%, below the nominal 90%, and the app shows that gap."
        - title: "Explainable predictions"
          text: "Global feature importance plus per-engine local XGBoost contributions."
    manim-editor:
      title: Manim Editor
      tagline: Visual math animations
      description: Desktop editor for building mathematical animations with Manim without writing code, with an element library, property inspector, timeline and local rendering.
      imageAlt: The editor with a rendered integral and the timeline
      overview:
        - "A mathematical idea can be simple to sketch and tedious to translate into Python: find the right class, remember its parameters, position the objects, sequence the animations and render again. Manim Editor makes the repetitive part of that workflow visual."
        - "You build the graph, write the equation, shade the integral and decide on a timeline when each piece appears. The editor turns that into a versioned project and readable Python, and Manim renders the real video on your machine."
      highlights:
        - title: "A timeline"
          text: "Draggable, resizable clips, parallel groups, times in seconds and keyboard nudging."
        - title: "17 elements, 13 animations"
          text: "Text, LaTeX, shapes, axes, planes, function graphs and areas, with entrances, motion, emphasis and exits."
        - title: "The project is data, not code"
          text: "A versioned JSON validated by a schema shared across TypeScript, Rust and Python. The Manim code is generated from it."
        - title: "Safe expressions"
          text: "Type sin(2x)/2 or (x - 2)^2 + 1. A dedicated parser accepts only maths notation, points to the failing column and never runs arbitrary Python."
    voice-assistant:
      title: Voice Assistant
      tagline: 100% local voice AI
      description: Full-duplex voice assistant with screen vision for Windows, with interruptible conversation and screen-aware answers, fully offline, no cloud and no API keys.
      imageAlt: The voice assistant interface
      overview:
        - "A voice assistant for Windows with real full-duplex audio: you can interrupt it mid-sentence, and the interruption becomes the next question. The moment you speak, it captures the screen and uses the image as context for its answer."
        - "The whole pipeline runs locally on a single GPU stack (GGML + Vulkan) shared by speech recognition and the LLM, which keeps it portable across AMD, NVIDIA and Intel GPUs. The target is under 2 seconds from the end of your speech to the first syllable of the reply."
      highlights:
        - title: "Natural interruption"
          text: "Barge-in under 100 ms, detected by Silero VAD while the assistant is still speaking."
        - title: "Screen vision"
          text: "A screenshot goes to the model with your question; it can be turned off in settings for privacy."
        - title: "Streaming voice"
          text: "The transcript arrives in real time and the answer is spoken sentence by sentence as it is generated, with Piper."
        - title: "No cloud"
          text: "whisper.cpp and llama.cpp on Vulkan, with models downloaded from Hugging Face on first run. No API key and no data leaving the machine."

# Dev mode: anotações flutuantes de código e matemática em cada seção (iguais nos dois idiomas)
dev:
  hero: |-
    y = σ(Wx + b)
    ∂L/∂W = δ · xᵀ
  about: |-
    θ ← θ − η · ∇θ L(θ)
    while loss > ε: step()
  focus:
    - |-
      attn = softmax(QKᵀ / √d) · V
      model.generate(prompt, local=True)
    - |-
      async for batch in stream(src):
          await sink.write(transform(batch))
    - |-
      UI = f(state)
      deploy(main) → prod
  selected: |-
    for p in projects:
        ship(p)
  articles: |-
    Σ ideias → texto
    publish(draft, lang)
  cta: |-
    await connect("diego")
    return 200
  page: |-
    GET /diego  200 OK
    ∫ curiosidade dt

# Dados que não mudam por idioma. A ordem aqui é a ordem no site.
projects:
  - slug: toolhaven-desktop
    dev: "invoke(\"run\", { tool: \"ffmpeg\", args })\nqueue.push(job)  // O(1)"
    year: "2026"
    repo: diegormirhan/toolhaven-desktop
    image: /projects/toolhaven.webp
    demo: https://toolhaven-kohl.vercel.app/
    tags: [Tauri, Rust, React, FFmpeg]
  - slug: polyrag
    dev: "cos(q, d) = q·d / (‖q‖ ‖d‖)\nroute = argmax_s sim(q, s)"
    year: "2026"
    repo: diegormirhan/polyrag
    image: /projects/polyrag.webp
    tags: [FastAPI, Qdrant, llama.cpp, SvelteKit]
  - slug: rasterscope
    dev: "NDVI = (NIR − R) / (NIR + R)\nŷ = UNet(x) ∈ [0,1]^(H×W)"
    year: "2026"
    repo: diegormirhan/rasterscope
    image: /projects/rasterscope.webp
    demo: https://rasterscope.onrender.com/
    tags: [U-Net, ONNX, FastAPI, React]
  - slug: aeropulse
    dev: "RUL = f(x₁ … xₙ)\nL = Σ(y − ŷ)² + λ‖w‖²"
    year: "2026"
    repo: diegormirhan/aeropulse
    image: /projects/aeropulse.webp
    tags: [XGBoost, FastAPI, React, Docker]
  - slug: manim-editor
    dev: "self.play(Transform(a, b))\nt ∈ [0, 1] → frame"
    year: "2026"
    repo: diegormirhan/manim-editor
    image: /projects/manim-editor.webp
    demo: https://manim-editor-alpha.vercel.app/
    tags: [Tauri, React, Python, Manim]
  - slug: voice-assistant
    dev: "mic → whisper → llama → tts\nWER = (S + D + I) / N"
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
- Cena Three.js fixa ao fundo com objetos 3D (rede neural em camadas com nós brilhantes sobre grade ondulada, gráfico 3D de funções de otimização que se transforma, editor de código, pilha de camadas, símbolo </>); a câmera viaja entre eles conforme o scroll, com pulsos de luz e brilhos, poeira de luz ao fundo e fumaça fluida colorida seguindo o cursor.
- Preloader com contador em % → botão "Entrar" (ou "entrar sem som") → a pílula vira um círculo cobalto enquanto a subida do som toca → no golpe, "DIEGO" surge de uma vez com clarão e tremor (título de trailer) → o branco se apaga e o site aparece por dentro das letras, o miolo do "O" ganha um contorno luminoso e a câmera mergulha por ele até o site (a cada carregamento completo); o "Diego." do topo entra em seguida;
- Sem cards e sem frases de apoio nas seções; listas são linhas tipográficas com preview no hover.
- **Dev mode** (botão ao lado da bandeira): visual mais agressivo (cobalto + vermelho sinal #ff2b3a), versões técnicas dos objetos 3D (backpropagation, descida do gradiente, arquitetura de sistema, multiplicação de matrizes, ∇), linhas de código e símbolos matemáticos flutuando, anotações de código/equações em cada seção, pulso grave a cada 5 s (uma cordilheira de areia vermelha explode de baixo da tela, atrás de tudo, e cai de volta; o relevo 3D gera ondas), trilha sonora que se abre com o scroll, vinheta e grão de filme. Entra por uma bolha que cresce em ondas; sempre leva ao topo; continua ao navegar e desliga ao recarregar; botão de mudo.
- Páginas: início, projetos (+ uma por projeto, com README), blog, experiência/skills, contato (sem formulário). PT na raiz, EN em `/en/`, troca por bandeira.

## Áudio (`public/audio/`)

- `intro-hit.m4a`: "Big cinematic impact" (Mixkit 788, Mixkit License), cortado para a subida + golpe em 1,31 s. Alternativa guardada: "Cinematic Impact Boom 04" (Universfield, Pixabay).

- `dev-theme.m4a`: "Bittersweet Eerie Horror Vocals: The Siren", AlesiaDavina (Pixabay Content License), recomprimida para AAC 64 kbps. https://pixabay.com/music/horror-scene-bittersweet-eerie-horror-vocals-the-siren-142786/
- `dev-pulse.m4a`: "Cinematic mystery trailer drum hit" (Mixkit 546, Mixkit License), normalizada e cortada em 4,7 s. https://mixkit.co/free-sound-effects/drum/
- Trilhas candidatas avaliadas (plano B):
  - Mixkit: "Ode to Loneliness" (Diego Nava, https://assets.mixkit.co/music/520/520.mp3), "River Flow" (Eugenio Mininni, https://assets.mixkit.co/music/594/594.mp3), "Staring at the Night Sky" (Alejandro Magaña, https://assets.mixkit.co/music/168/168.mp3), "Silent Descent" (Eugenio Mininni, https://assets.mixkit.co/music/614/614.mp3).
  - Pixabay: "The Sorrow II – Ethereal Theme" (tAUREON, https://pixabay.com/music/main-title-the-sorrow-ii-etheral-theme-123139/), "Storm – Powerful Ethereal Female Vocalise" (MoonpetalMedia, https://pixabay.com/music/epic-classical-storm-powerful-ethereal-female-vocalise-cinematic-ambient-519571/), "Cinematic Soundtrack – Epic Female Solo" (AntipodeanWriter, https://pixabay.com/music/main-title-cinematic-soundtrack-epic-female-solo-18501/).
