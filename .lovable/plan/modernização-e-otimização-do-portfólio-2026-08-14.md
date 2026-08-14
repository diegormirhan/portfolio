# Modernização e Otimização do Portfólio

Este plano foca na renovação visual completa dos componentes, adição de um fundo dinâmico estilizado e implementação de carregamento progressivo (lazy loading) para melhor performance.

## Mudanças do Usuário

- **Lazy Loading**: Implementação de carregamento conforme o scroll para imagens e seções.
- **Novo Background**: Substituição do fundo atual por um sistema de "mesh gradients" dinâmicos com gráficos estilizados e blur.
- **Animação de Borda**: Refinamento da animação circular na moldura do site.
- **Redesign de Cards/Widgets**: Transformação total do visual para algo mais moderno, profissional e minimalista, mantendo a identidade visual de ícones coloridos.

## Detalhes Técnicos

### 1. Fundo Dinâmico e Estilizado
- Criação de um componente `Background` com esferas de gradiente animadas e um overlay de ruído suave.
- Uso de `backdrop-filter: blur` para criar profundidade.

### 2. Redesign dos Cards e Widgets
- **Glassmorphism 2.0**: Bordas mais finas, reflexos realistas e sombras suaves.
- **Tipografia**: Ajustes de escala e pesos para um visual mais "Premium".
- **Hover**: Efeitos de iluminação que seguem o mouse ou brilhos sutis.

### 3. Performance e Lazy Loading
- Uso de `framer-motion` com o atributo `viewport={{ once: false }}` para re-animar elementos ao entrar na tela (opcional, mas melhora a percepção).
- Garantir que `next/image` ou `loading="lazy"` em tags `img` estejam configurados corretamente.
- Implementação de um loader de esqueleto (Skeleton) mais refinado para seções que carregam dados externos (GitHub/Medium).

### 4. Animação da Moldura (Frame)
- Ajuste no gradiente cônico para ser mais suave e profissional.

## Arquivos Afetados

- `src/styles.css`: Definição dos novos estilos de glassmorphism e animações de fundo.
- `src/routes/index.tsx`: Atualização da estrutura das seções e aplicação dos novos estilos.
- `src/components/project-card.tsx`: Redesign completo.
- `src/components/article-card.tsx`: Redesign completo.
- `src/components/reveal.tsx`: Ajuste na lógica de interseção para scroll suave.
- `src/components/background.tsx`: Novo componente para o fundo dinâmico.
