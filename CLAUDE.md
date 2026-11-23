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
- `stockpro.html` é uma versão antiga, que o app instalado não usa; não é
  mantida.

## Regras do saldo (não regredir)

- Nunca gravar `qty` absoluto a partir da memória do aparelho: use
  `FieldValue.increment(delta)`. Editar produto grava só os campos editados.
- Contagem aplica a diferença (contado − saldo no momento em que o produto
  foi contado), não substitui o saldo.
- Excluir um lançamento do histórico desfaz o efeito dele no estoque.

## Pedido do vendedor (tablet) e CRM

- Usuário `op` com `vendedor: true` entra direto em `pedidoApp`; grava em
  `lojas/{filial}/pedidos` (status aberto → pago/cancelado). Estoque só
  baixa quando o caixa recebe (`confirmPayment`).
- Limite de desconto em um lugar só: `limiteDescontoItens` (menor entre o
  % da Cotação e metade da margem, nunca abaixo de `precoMin` do produto).
- Clientes em `lojas/{filial}/clientes/{telefone só dígitos}`; vendas de
  pedido levam `clienteTel`, `pedidoId` e `precoTabelaUSD` nos itens.

## Custo da tabela de Vendas Online

- Produto com `custoUSD` tem o custo em R$ calculado na hora por `vonCusto(p)`:
  US$ × dólar do dia (cotação BRL do caixa da Farmácia) × (1 + extras %).
  Extras (frete etc.) ficam em `config/vonCustos.extrasPct`, padrão 0% — a
  Farmácia vende no balcão, não há frete fixo. Nunca usar cotação fixa no código.

## Giro e Saúde dos preços (admin, caixa → botões 📈 e 💰)

- "Dura"/"Saiu 30d" usam `saidasNetas()`: TODAS as saídas do histórico (caixa,
  Saída em Lote, manual) menos cancelamentos. Nunca calcular giro só com as
  vendas do caixa — os pedidos em lote baixam estoque sem passar por `vendas`.
- Saúde dos preços: preço sugerido = custo ÷ (1 − margem-alvo), limitado pelo
  `precoMercado` do produto, nunca sugere baixar. `precoMin` (piso) nunca passa
  do preço de venda. Config em `config/precos` ({alvo, piso, passo}).

## Lote: cadastro rápido

- Linha não encontrada na Entrada/Saída em Lote mostra "➕ cadastrar" (só para
  quem `podeGerenciarProdutos()`): cria o produto com estoque 0 e já usa na linha.
  Nome já existente não duplica. Modais empilhados precisam de z-index maior
  que 1000 (`loteNovoModal` usa 1100) — senão abrem por trás do lote.

## Contagem por filial e recebimento de entradas

- `_contagemAplicaDireto()`: Farmácia → só operador aplica direto (e trava); admin
  da Farmácia continua PENDENTE (aprovação). Demais filiais → o admin aplica na
  hora, sem trava; operador dessas filiais continua pendente. Não mudar o
  comportamento da Farmácia sem pedido explícito.
- Operador conta às cegas: nunca mostrar saldo do sistema nem diferença para ele
  (chips, confirmação e janela de resultado são só do admin).
- Entrada guarda `dataRecebimento` (AAAA-MM-DD local) SEPARADA de `datetime`
  (momento do registro). A conferência de contagem usa `datetime`; nunca
  sobrescrever `datetime` com a data do recebimento.
- Texto livre (obs) deve sempre passar por `_esc()` ao ser exibido.

## Publicar

Mesclar na `main` publica sozinho pelo GitHub Pages (~1 minuto). Depois,
confira o workflow "pages build and deployment" do commit.
