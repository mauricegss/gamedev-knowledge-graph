# GameDev Knowledge Graph

Interactive knowledge graph exploring the game development ecosystem. Built with Python (FastAPI), React (Next.js), TypeScript, PostgreSQL, and Cytoscape.js.

## 🚀 Sobre o Projeto

Este projeto é uma aplicação web full-stack que permite aos usuários gerenciar e visualizar dados sobre jogos, suas engines e gêneros através de uma interface interativa baseada em grafos. O objetivo é explorar as conexões no mundo do desenvolvimento de jogos.

## ✨ Funcionalidades Principais

* **Visualização em Grafo:** Exibe jogos, engines e gêneros como nós interativos usando Cytoscape.js.
* **Conexões:** Mostra relacionamentos (Jogo -> Engine, Jogo -> Gêneros).
* **Interatividade:**
    * Painel lateral exibe detalhes ao clicar em um nó.
    * Zoom e centralização no nó selecionado.
    * Filtragem da visualização por gênero.
* **Gerenciamento de Dados (CRUD):** Interface para Adicionar, Listar, Editar e Deletar jogos.
* **Autenticação:** Sistema de Registro e Login com proteção de rotas via JWT.
* **Métricas:** Exibe estatísticas básicas como contagem de jogos e gênero mais popular.

## 🛠️ Tecnologias Utilizadas

**Backend:**
* Python 3.10+
* FastAPI
* PostgreSQL
* SQLAlchemy (ORM)
* Passlib[bcrypt] (Hashing de Senhas)
* Python-JOSE[cryptography] (JWT)
* Uvicorn (Servidor ASGI)
* Docker & Docker Compose (para o PostgreSQL)

**Frontend:**
* Node.js (LTS)
* Next.js 14+ (App Router)
* React 18+
* TypeScript
* Tailwind CSS
* Cytoscape.js & react-cytoscapejs
* shadcn/ui (para Dialog e outros componentes de UI)
* react-hot-toast (Notificações)

## 🔮 Próximos Passos (Possíveis Melhorias)

* Adicionar mais entidades (Estúdios, Plataformas, Linguagens).
* Implementar busca inteligente de jogos (ex: via API da Steam).
* Melhorar a visualização das métricas com gráficos.
* Fazer deploy online (Vercel, Render, etc.).
* Refinar a UI/UX.

---