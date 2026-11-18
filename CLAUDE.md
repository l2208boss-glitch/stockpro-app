# StockPro — instruções para o Claude

Sistema de estoque da farmácia, usado em tempo real pelos colaboradores.
Publicado pelo GitHub Pages a partir da branch `main`
(https://l2208boss-glitch.github.io/stockpro-app/). Dados no Firebase Firestore.

## Regra obrigatória a cada alteração publicada

**Sempre suba a versão do `CACHE_NAME` em `sw.js`** (ex.: `stockpro-v132` → `stockpro-v133`)
no mesmo commit da mudança.

O app instalado na área de trabalho (PWA) só percebe que há versão nova quando o
`sw.js` muda: ele confere a cada 60s, instala o service worker novo e recarrega a
página sozinho. Sem subir a versão, os colaboradores continuam na versão antiga.

## Arquivos

- `index.html` e `estoque.html` são cópias idênticas — altere os dois igual
  (edite um e copie para o outro).
- `stockpro.html` é uma versão mais antiga; o app instalado abre `/stockpro-app/`
  (o `index.html`).

## Publicar

Mesclar na `main` publica sozinho pelo GitHub Pages (~1 minuto).
