# StockPro — instruções para o Claude

Sistema de estoque da farmácia, usado em tempo real pelos colaboradores.
Publicado pelo GitHub Pages a partir da branch `main`:
https://l2208boss-glitch.github.io/stockpro-app/ — dados no Firebase Firestore.

**Este (`l2208boss-glitch/stockpro-app`) é o repositório do app de verdade.**
O repositório `l2208boss-glitch/stockpro` é uma cópia antiga de março e não
alimenta o site — não altere o app lá.

## Regra obrigatória: subir a versão do `sw.js` a cada mudança no app

Toda alteração nos arquivos do app (`index.html`, `estoque.html`, `stockpro.html`
etc.) precisa, **no mesmo commit**, subir a versão do `CACHE_NAME` em `sw.js`
(ex.: `stockpro-v132` → `stockpro-v133`).

Por quê: os colaboradores usam o app instalado na área de trabalho (PWA). Ele
confere o `sw.js` a cada 60s; só quando o arquivo muda ele instala o service
worker novo, recarrega sozinho e volta para a página inicial — é esse o sinal
de que atualizou. Sem subir a versão, ninguém recebe a mudança, nem
reiniciando o computador. (Em 18/11/2026 a busca no histórico ficou sem
aparecer até a versão subir para v132.)

## Arquivos

- `index.html` e `estoque.html` são cópias idênticas — altere os dois igual
  (edite um e copie para o outro). O app instalado abre `/stockpro-app/`
  (o `index.html`).
- `stockpro.html` é uma versão mais antiga do app; mantenha a mesma mudança
  nele quando o trecho existir lá.

## Publicar

Mesclar na `main` publica sozinho pelo GitHub Pages (~1 minuto). Depois,
confira o workflow "pages build and deployment" do commit.
