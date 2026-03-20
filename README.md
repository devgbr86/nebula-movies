# Nebula Movies

Aplicação web para buscar e explorar filmes por gênero usando a API pública do OMDb. Construída com TypeScript, ES Modules nativos e um roteador client-side feito do zero — sem frameworks, sem bundlers.

Demo: https://devgbr86.github.io/nebula-movies/

---

## O que este projeto faz

A página inicial funciona como um hub de navegação com acesso direto a 7 gêneros de filmes. Para cada gênero você tem três opções: buscar por termo, ver o Top 10 mais bem avaliados ou ver os lançamentos mais recentes. Ao clicar em qualquer filme abre um modal com o bloco completo de informações — pôster, sinopse, diretor, elenco, avaliações do IMDb, Rotten Tomatoes e Metacritic, bilheteria e prêmios.

Os 7 gêneros disponíveis são Sci-Fi, Horror, Western, Comedy, War, Crime e Drama.

---

## Tecnologias utilizadas

- TypeScript — compilado para JavaScript, sem frameworks
- ES Modules — módulos nativos do navegador, sem bundler
- OMDb API — API REST pública em omdbapi.com
- GitHub Pages — hospedagem estática, sem configuração

---

## Estrutura de pastas

```
nebula-movies/
|
|-- src/                   # Arquivos TypeScript (você edita estes)
|   |-- main.ts            # Ponto de entrada: tipos, modal, boot, registro de rotas
|   |-- home.ts            # Página inicial: hub com os 21 botões de navegação
|   |-- search.ts          # Página de busca: pesquisa por termo filtrada por gênero
|   |-- category.ts        # Página de categoria: Top 10 e Latest por gênero
|   |-- detail.ts          # Conteúdo HTML do modal de detalhes do filme
|   |-- router.ts          # Roteador client-side baseado em hash
|
|-- dist/                  # JavaScript compilado (gerado pelo tsc, não edite)
|   |-- main.js
|   |-- home.js
|   |-- search.js
|   |-- category.js
|   |-- detail.js
|   |-- router.js
|   |-- (arquivos .map)
|
|-- styles/
|   |-- main.css           # Todos os estilos da aplicação
|
|-- assets/
|   |-- space_icon.png     # Favicon e logo do cabeçalho
|
|-- index.html             # Único arquivo HTML, carrega dist/main.js
|-- tsconfig.json          # Configuração do compilador TypeScript
|-- package.json           # Metadados do projeto e dependências de desenvolvimento
```

---

## Explicação arquivo por arquivo

### index.html

O único arquivo HTML do projeto. Carrega o CSS e o JavaScript compilado via `type="module"`. O cabeçalho tem o logo que funciona como link para a home. Todo o conteúdo das páginas é renderizado dinamicamente dentro do elemento `<main id="app">` pelo JavaScript. O atributo `data-link` nos links do cabeçalho é usado pelo roteador para interceptar cliques sem recarregar a página.

### src/router.ts

Roteador client-side minimalista com menos de 40 linhas. Usa o hash da URL para navegar entre páginas sem nenhuma requisição ao servidor.

Funções principais:

- `register(path, handler)` — associa um caminho como `/search/scifi` a uma função que renderiza a página correspondente
- `navigate(path)` — altera o hash da URL, disparando a resolução da rota
- `initRouter()` — inicializa os listeners de `hashchange` e de cliques em elementos `[data-link]`
- `resolve()` — lê o hash atual, encontra o handler registrado e o executa
- `updateActiveNav(path)` — marca o link ativo na navegação

### src/main.ts

Ponto de entrada da aplicação. Faz quatro coisas:

1. Define todos os tipos TypeScript da API do OMDb: `OMDbMovie`, `OMDbSearchResponse` e `OMDbDetail`
2. Gerencia o modal — `openModal(movie)` constrói e exibe o overlay com os detalhes do filme, `closeModal()` o fecha
3. Registra todas as 22 rotas da aplicação no roteador
4. Chama `initRouter()` para inicializar a navegação

### src/home.ts

Renderiza a página inicial com os 21 botões organizados em três seções — Search, Top 10 e Latest — uma para cada um dos 7 gêneros. Cada botão chama `navigate()` com a rota correspondente. Não faz nenhuma chamada à API, é puramente navegação.

### src/search.ts

Gerencia a página de busca por termo. Aceita o parâmetro `genre` que determina qual gênero será filtrado nos resultados.

Funções principais:

- `renderSearch(app, genre)` — renderiza o HTML da página com campo de busca e filtro de década, e registra os event listeners
- `searchMovies(query, genreFilter)` — faz as chamadas à API, pagina os resultados, busca detalhes de cada filme em paralelo, filtra pelo gênero e pela década selecionada, e renderiza a lista
- `renderMovieLi(movie, listEl)` — cria o elemento de lista para cada filme e adiciona o listener de clique para abrir o modal
- `setStatus(msg, isError)` — atualiza a mensagem de status abaixo do campo de busca

A busca funciona em três etapas: primeiro busca IDs pelo termo digitado (paginando até 50 resultados), depois busca os detalhes completos de cada filme em paralelo via `Promise.all`, e finalmente filtra client-side pelo campo `Genre` retornado pela API.

### src/category.ts

Gerencia as páginas de Top 10 e Latest. Aceita os parâmetros `mode` (`"top"` ou `"latest"`) e `genre`.

Funções principais:

- `renderCategory(app, mode, genre)` — renderiza o HTML da página e chama a função de carregamento correta
- `loadTop(genre, listEl, countEl)` — busca filmes usando os seeds do gênero, coleta os detalhes, filtra pelo gênero, ordena por nota IMDb decrescente e exibe os 10 melhores
- `loadLatest(genre, listEl, countEl)` — mesma lógica, mas filtra pelos últimos 3 anos e ordena por ano decrescente
- `collectIds(queries)` — recebe um array de Promises de busca, aguarda todos em paralelo e retorna os IMDb IDs únicos encontrados
- `fetchDetails(ids)` — busca os detalhes completos de cada ID em paralelo

Cada gênero tem uma configuração em `GENRE_CONFIG` com um label de exibição, o termo oficial da API e um array de seeds usados para popular os resultados.

### src/detail.ts

Responsável exclusivamente por construir o HTML do modal. Exporta duas funções:

- `field(label, value)` — retorna um bloco HTML de detalhe, ou string vazia se o valor for "N/A"
- `buildDetailHTML(movie)` — monta o HTML completo do modal com pôster, metadados, sinopse, equipe, gênero, prêmios, bilheteria e avaliações

### styles/main.css

Todos os estilos em um único arquivo. Sem frameworks CSS — cada classe escrita manualmente. Segue uma estética editorial limpa inspirada em sistemas antigos: fonte serifada, fundo branco, links azuis, bordas cinzas. As variáveis de cor ficam todas no `:root`.

### tsconfig.json

Configura o compilador TypeScript:

- `"target": "ES2017"` — compila para JavaScript moderno
- `"module": "ES2020"` — usa sintaxe nativa de ES Modules
- `"moduleResolution": "node"` — resolve imports de módulos
- `"outDir": "dist"` — grava os arquivos compilados na pasta `dist/`
- `"strict": true` — ativa todas as verificações de tipo estritas

---

## Como rodar localmente

Você precisa ter o Node.js instalado. Em seguida:

```bash
# Clone o repositório
git clone https://github.com/devgbr86/nebula-movies.git
cd nebula-movies

# Instale o TypeScript
npm install

# Compile TypeScript para JavaScript
npx tsc
```

Como o projeto usa ES Modules, abra com um servidor local:

```bash
npx serve .
```

Acesse `http://localhost:3000`.

---

## Como fazer alterações

1. Edite qualquer arquivo dentro de `src/`
2. Rode `npx tsc` para recompilar
3. Atualize o navegador

Para recompilar automaticamente a cada salvamento:

```bash
npx tsc --watch
```

---

## Como o roteador funciona

O projeto não usa React Router, Vue Router nem nenhuma biblioteca. O roteador tem menos de 40 linhas de TypeScript escrito do zero.

A navegação funciona através do hash da URL. Quando você clica em "Search Sci-Fi" na home, o roteador define `location.hash = "/search/scifi"`. O navegador dispara um evento `hashchange`. O roteador lê o novo hash, encontra o handler registrado e o chama. Esse handler substitui o conteúdo de `<main id="app">` com a nova página.

A página nunca recarrega. Tudo acontece no mesmo documento HTML.

Rotas registradas em `main.ts`:

```
/                        → home (hub de navegação)
/search/scifi            → busca filtrada por Sci-Fi
/search/horror           → busca filtrada por Horror
/search/western          → busca filtrada por Western
/search/comedy           → busca filtrada por Comedy
/search/war              → busca filtrada por War
/search/crime            → busca filtrada por Crime
/search/drama            → busca filtrada por Drama
/category/top/scifi      → Top 10 Sci-Fi
/category/top/horror     → Top 10 Horror
... (e assim por diante para cada gênero)
/category/latest/drama   → Latest Drama
```

---

## Como a busca funciona

A API do OMDb não oferece filtro por gênero no endpoint de busca. Então o projeto resolve isso em três etapas no lado do cliente:

1. O termo digitado é enviado ao endpoint de busca da OMDb, paginando até 50 resultados
2. Os detalhes completos de cada resultado são buscados em paralelo via `Promise.all`
3. Os resultados são filtrados client-side pelo campo `Genre` retornado pela API — só filmes onde `Genre` contém o termo do gênero passam

Isso significa que cada busca pode gerar dezenas de chamadas à API. É intencional — a API gratuita do OMDb não expõe filtro de gênero server-side.

---

## Como o Top 10 e o Latest funcionam

Cada gênero tem uma lista de seeds em `GENRE_CONFIG` dentro de `category.ts`. São termos relacionados ao gênero usados para popular os resultados sem precisar que o usuário digite nada.

Para o Top 10: busca filmes pelos seeds, coleta os detalhes de todos, filtra pelo gênero, ordena por nota IMDb decrescente e pega os 10 primeiros.

Para o Latest: mesma lógica, mas as buscas incluem o ano (`&y=2026`, `&y=2025`, `&y=2024`) e os resultados são ordenados por ano decrescente.

---

## Como adicionar um novo gênero

Para adicionar um novo gênero ao projeto basta seguir 4 passos:

1. Adicione a configuração em `GENRE_CONFIG` dentro de `category.ts` e `search.ts`:

```typescript
thriller: {
  label:   "Thriller",
  apiTerm: "thriller",
  seeds:   ["thriller", "suspense", "spy", "conspiracy", "chase", "assassin"],
}
```

2. Adicione os botões em `home.ts`:

```typescript
<button class="home-nav-btn" id="btn-search-thriller">Search Thriller</button>
```

3. Adicione os event listeners em `home.ts`:

```typescript
document.getElementById("btn-search-thriller")!
  .addEventListener("click", () => navigate("/search/thriller"));
```

4. Registre as rotas em `main.ts`:

```typescript
register("/search/thriller",            () => renderSearch(app, "thriller"));
register("/category/top/thriller",      () => renderCategory(app, "top",    "thriller"));
register("/category/latest/thriller",   () => renderCategory(app, "latest", "thriller"));
```

Depois é só rodar `npx tsc` e o gênero novo já funciona.

---

## Deploy

O projeto é publicado no GitHub Pages a partir da raiz da branch main. A pasta `dist/` compilada está commitada no repositório, então o GitHub Pages serve os arquivos diretamente sem nenhum build step no servidor.

Para publicar sua própria versão:

1. Envie o repositório para o GitHub incluindo a pasta `dist/`
2. Vá em Settings > Pages
3. Defina a fonte como "Deploy from a branch", branch `main`, pasta `/ (root)`
4. Salve — o site estará no ar em alguns minutos

---

## Fonte dos dados

Todos os dados de filmes vêm da OMDb API em omdbapi.com. O plano gratuito permite 1000 requisições por dia. A chave usada neste projeto é uma chave pública compartilhada — para uso contínuo, crie sua própria chave gratuita em omdbapi.com/apikey.aspx e substitua nos arquivos `search.ts` e `category.ts`.

---

Criado por Guilherme Ribeiro — github.com/devgbr86