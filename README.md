# 📱 Gerador de QR Code — Nitnave Offshore Solutions

Aplicação web para geração de QR Codes a partir de links ou textos, com suporte a download em PNG e geração de PDF personalizado com modelos da Nitnave e Petrobras.

---

## 📁 Estrutura de Arquivos

```
qrCodeGenerator/
│
├── index.html          # Estrutura principal da aplicação
├── index.js            # Toda a lógica de geração de QR Code e PDF
├── style.css           # Estilização completa da interface
│
├── qrcode.min.js       # Biblioteca QRCode.js (geração do QR Code)
├── pdf-lib.min.js      # Biblioteca PDF-lib (manipulação de PDF)
├── fontkit.min.js      # Plugin fontkit para PDF-lib (suporte a fontes customizadas)
├── jspdf.min.js        # Biblioteca jsPDF (não utilizada ativamente)
│
├── cambria.ttf         # Fonte Cambria usada no texto do PDF
├── cambria.ttc         # Fonte Cambria em formato TrueType Collection
│
├── LOGO NITNAVE.jpg    # Logotipo da empresa exibido no cabeçalho
├── pdf_nitnave.pdf     # Template base do PDF com layout Nitnave
└── pdf_petrobras.pdf   # Template base do PDF com layout Petrobras
```

---

## 🧱 HTML — `index.html`

### `<head>`
- `charset="UTF-8"` — garante suporte a caracteres especiais e acentos.
- `viewport` com `width=device-width, initial-scale=1.0` — essencial para responsividade em dispositivos móveis.
- Importa `style.css` para estilização.

### `.logo-nitnave`
```html
<div class="logo-nitnave">
    <img src="/LOGO NITNAVE.jpg" alt="">
</div>
```
- Exibe o logotipo da empresa no topo da página.
- Estilizado para ser responsivo via `clamp()` no CSS.

### `<main class="container">`
Envolve todo o conteúdo principal da aplicação, centralizado via Flexbox.

### `<header>`
```html
<h1>Gerador de QR Code</h1>
```
- Título principal da aplicação.

### `.box` — Formulário principal
```html
<section class="box" aria-label="Formulário de geração de QR Code">
```
- `aria-label` garante acessibilidade para leitores de tela.

#### Elementos internos:
| Elemento | ID / Tipo | Função |
|---|---|---|
| `<label>` | — | Rótulo do campo de entrada |
| `<input type="text">` | `link-input` | Recebe o link ou texto para gerar o QR Code |
| `<p>` | `erro-msg` | Exibe mensagem de erro de validação |
| `<button>` | — | Aciona `gerarQR()` ao ser clicado |
| `<div>` | `qrcode-container` | Onde o QR Code gerado é renderizado |
| `<button>` | `btn-download` | Baixa o QR Code em PNG (oculto até gerar) |
| `<button>` | `btn-download-pdf` | Abre o modal para baixar em PDF (oculto até gerar) |

- Os botões de download têm o atributo `hidden` por padrão e só são exibidos após a geração do QR Code.

### `<dialog id="modal-pdf">` — Modal de configuração do PDF
```html
<dialog id="modal-pdf" aria-labelledby="modal-titulo">
```
- Usa a tag nativa `<dialog>` do HTML5.
- `aria-labelledby` referencia o título para acessibilidade.

#### Elementos internos:
| Elemento | ID / Name | Função |
|---|---|---|
| `<input type="text">` | `pdf-titulo` | Campo para o título que aparecerá no PDF |
| `<input type="radio" value="nitnave">` | `pdf-modelo` | Seleciona o template Nitnave |
| `<input type="radio" value="petrobras">` | `pdf-modelo` | Seleciona o template Petrobras |
| Botão "Cancelar" | — | Aciona `fecharModal()` |
| Botão "Gerar PDF" | — | Aciona `baixarPDF()` |

### `<footer>`
- Exibe o nome da unidade e o crédito do desenvolvedor.

### Scripts carregados no final do `<body>`
```html
<script src="qrcode.min.js"></script>
<script src="pdf-lib.min.js"></script>
<script src="fontkit.min.js"></script>
<script src="index.js"></script>
```
- Carregados ao final para não bloquear a renderização da página.

---

## ⚙️ JavaScript — `index.js`

### `gerarQR()`
Responsável por validar a entrada e renderizar o QR Code na tela.

```js
function gerarQR()
```

**Fluxo:**
1. Captura o valor do campo `#link-input` e remove espaços com `.trim()`.
2. Limpa o conteúdo anterior de `#qrcode-container` via `innerHTML = ""`.
3. Oculta o botão de download PNG enquanto processa.
4. Valida se o campo está vazio — se estiver, exibe mensagem em `#erro-msg` e interrompe.
5. Instancia a biblioteca `QRCode` com as configurações:
   - `text` — o texto/link digitado.
   - `width` / `height` — dimensões de 200x200px.
   - `colorDark` — cor dos módulos do QR Code (`#000000`).
   - `colorLight` — cor do fundo (`#ffffff`).
   - `correctLevel: QRCode.CorrectLevel.H` — nível de correção de erros máximo (30%).
6. Após 100ms (via `setTimeout`), exibe os botões `btn-download` e `btn-download-pdf`.
   - O delay é necessário pois a biblioteca QRCode.js renderiza o canvas de forma assíncrona.

---

### `baixarQR()`
Faz o download do QR Code gerado como imagem PNG.

```js
function baixarQR()
```

**Fluxo:**
1. Seleciona o `<canvas>` dentro de `#qrcode-container`.
2. Cria um elemento `<a>` temporário.
3. Converte o canvas para base64 PNG via `.toDataURL("image/png")`.
4. Define o atributo `download` e simula um clique para iniciar o download.

---

### `abrirModalPDF()`
Abre o modal de configuração do PDF.

```js
function abrirModalPDF()
```

**Fluxo:**
1. Limpa o campo `#pdf-titulo` para evitar texto residual de uso anterior.
2. Chama `.showModal()` na tag `<dialog>` para abri-la.

---

### `fecharModal()`
Fecha o modal sem gerar PDF.

```js
function fecharModal()
```

- Chama `.close()` na tag `<dialog>`.

---

### `baixarPDF()` ⭐
Função principal e mais complexa — gera o PDF personalizado com o QR Code e título.

```js
async function baixarPDF()
```

**Fluxo detalhado:**

#### 1. Coleta de dados
- Lê o título do campo `#pdf-titulo` (usa `"pdf-titulo"` como fallback se vazio).
- Identifica o modelo selecionado (`nitnave` ou `petrobras`) via `input[name="pdf-modelo"]:checked`.
- Define o arquivo base: `pdf_petrobras.pdf` ou `pdf_nitnave.pdf`.
- Fecha o modal imediatamente com `fecharModal()`.

#### 2. Captura do QR Code
```js
const canvas = document.querySelector("#qrcode-container canvas");
const qrPngBytes = await fetch(canvas.toDataURL("image/png")).then(r => r.arrayBuffer());
```
- Converte o canvas do QR Code para `ArrayBuffer` (formato exigido pelo PDF-lib).

#### 3. Carregamento do template PDF
```js
const modeloBytes = await fetch(arquivoPDF).then(r => r.arrayBuffer());
pdfDoc = await PDFDocument.load(modeloBytes);
pdfDoc.registerFontkit(fontkit);
page = pdfDoc.getPages()[0];
```
- Carrega o PDF base como bytes.
- Registra o `fontkit` no documento para permitir fontes externas.
- Obtém a primeira (e única) página do template.

#### 4. Carregamento da fonte
```js
const cambriaBytes = await fetch("cambria.ttf").then(r => r.arrayBuffer());
font = await pdfDoc.embedFont(cambriaBytes);
```
- Embute a fonte Cambria diretamente no PDF para garantir que o texto seja renderizado corretamente em qualquer visualizador.

#### 5. Embedding do QR Code
```js
qrImage = await pdfDoc.embedPng(qrPngBytes);
```
- Converte os bytes PNG do QR Code em um objeto de imagem do PDF-lib.

#### 6. Posicionamento e desenho no PDF
```js
const qrX = 185, qrY = 395, qrW = 228, qrH = 226;
```
- Coordenadas e dimensões fixas calculadas para se encaixar no template.
- O sistema de coordenadas do PDF-lib tem **origem no canto inferior esquerdo**.

```js
const textWidth = font.widthOfTextAtSize(titulo, fontSize);
const titleX = (qrX + qrW / 2) - textWidth / 2;
const titleY = qrY + qrH + 20;
```
- Centraliza o título horizontalmente sobre o QR Code.
- Posiciona o título 20pt acima do QR Code.

```js
page.drawText(titulo, { x: titleX, y: titleY, size: fontSize, font, color: rgb(0.0431, 0.0549, 0.1922) });
page.drawImage(qrImage, { x: qrX, y: qrY, width: qrW, height: qrH });
```
- `rgb(0.0431, 0.0549, 0.1922)` equivale aproximadamente a `#0B0E31` — azul escuro da identidade visual Nitnave.
- Desenha o título e o QR Code na página do template.

#### 7. Exportação e exibição
```js
const blob = new Blob([pdfBytes], { type: "application/pdf" });
const blobUrl = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = blobUrl;
link.download = `${titulo}.pdf`;
link.click();
window.open(blobUrl, "_blank");
```
- Cria um `Blob` com os bytes do PDF gerado.
- Gera uma URL temporária com `URL.createObjectURL`.
- Simula um clique no link para iniciar o **download**.
- Abre o PDF em uma **nova aba** para visualização imediata.

#### Tratamento de erros
Cada etapa crítica está envolta em `try/catch` individual, exibindo `alert()` com a mensagem de erro específica e interrompendo a execução com `return` em caso de falha.

---

## 🎨 CSS — `style.css`

### Reset global
```css
* { margin: 0 }
```
- Remove a margem padrão de todos os elementos.

### `body`
- Fonte: `Segoe UI` com fallbacks seguros (`Tahoma`, `Geneva`, `Verdana`, `sans-serif`).
- `min-height: 100vh` — garante que o fundo cubra toda a altura da tela.
- `background-color: #f0f2f5` — cinza suave para o fundo.

### `.container`
- Flexbox em coluna, centralizado horizontal e verticalmente.

### `header`
- Flexbox em coluna, centralizado.

### `header h1`
- Tamanho `1.5rem`, cor `#333`.

### `main`
- `width: 100%` com `justify-content: center` para centralizar o conteúdo.

### `.box`
- Card branco com `border-radius: 12px` e sombra suave.
- `padding: 30px` e `text-align: center`.

### `label`
- Exibido como bloco, negrito, cor `#555`.

### `#erro-msg`
- Cor vermelha `#cc0000`, fonte pequena `13px`.
- `min-height: 18px` evita salto de layout quando a mensagem aparece/desaparece.

### `input`
- Largura fixa de `280px`, padding de `12px`.
- Borda cinza com `border-radius: 6px`.
- `outline: none` remove o contorno padrão do navegador.
- No foco (`:focus`), a borda muda para `#0B3C5D` (azul Nitnave).

### `button`
- Background `#0B3C5D`, texto branco, `border-radius: 6px`.
- Transição suave de cor no hover (`0.2s`).
- Hover escurece para `#082d46`.

### `#btn-download`
- Background verde `#28a745`, hover `#1e7e34`.

### `#btn-download-pdf`
- Background azul claro `#328CC1`, hover `#256a93`.
- `margin-left: 8px` para separar do botão PNG.

### `dialog`
- Sem borda, `border-radius: 12px`, sombra pronunciada.
- Posicionado fixo no centro da tela via `position: fixed` + `transform: translate(-50%, -50%)`.
- `::backdrop` — fundo semitransparente escuro ao abrir o modal.

### `.modal-botoes`
- Flexbox com `justify-content: flex-end` para alinhar os botões à direita.
- Botão "Cancelar" tem fundo cinza `#6c757d`.

### `.modal-opcoes`
- Flex em coluna com `gap: 2px` entre os itens.
- Labels com `font-weight: normal` e `cursor: pointer` para indicar clicabilidade.

### `.logo-nitnave`
- Flexbox centralizado com `padding: 12px 0`.

### `.logo-nitnave img`
- `width: clamp(80px, 15vw, 180px)` — largura fluida e responsiva:
  - Mínimo: `80px` (celulares pequenos)
  - Preferido: `15vw` (proporcional à largura da viewport)
  - Máximo: `180px` (desktops)
- `height: auto` — mantém a proporção original sem distorção.
- `background-color: black` — cor de fundo da imagem da logo.

---

## 📦 Bibliotecas Externas

| Arquivo | Biblioteca | Versão | Finalidade |
|---|---|---|---|
| `qrcode.min.js` | [QRCode.js](https://github.com/davidshimjs/qrcodejs) | — | Geração do QR Code via canvas |
| `pdf-lib.min.js` | [PDF-lib](https://pdf-lib.js.org/) | — | Criação e edição de PDFs no browser |
| `fontkit.min.js` | [Fontkit](https://github.com/foliojs/fontkit) | — | Suporte a fontes customizadas no PDF-lib |
| `jspdf.min.js` | [jsPDF](https://github.com/parallax/jsPDF) | — | Incluída no projeto, não utilizada ativamente |

---

## 🔄 Fluxo Completo da Aplicação

```
Usuário digita link/texto
        ↓
    gerarQR()
        ↓
Valida entrada → erro? → exibe #erro-msg
        ↓
Renderiza QR Code no canvas (QRCode.js)
        ↓
Exibe botões "Baixar PNG" e "Baixar PDF"
        ↓
    ┌───────────────────────┐
    ↓                       ↓
baixarQR()            abrirModalPDF()
    ↓                       ↓
Download PNG       Usuário preenche título
                   e seleciona modelo
                           ↓
                       baixarPDF()
                           ↓
                  Carrega template PDF base
                           ↓
                  Embute fonte Cambria
                           ↓
                  Embute imagem do QR Code
                           ↓
                  Desenha título + QR no PDF
                           ↓
                  Download do PDF gerado
                           ↓
                  Abre PDF em nova aba
```

---

## 🌐 Compatibilidade

- Funciona em navegadores modernos com suporte a:
  - `<dialog>` nativo (Chrome 37+, Firefox 98+, Edge 79+)
  - `URL.createObjectURL`
  - `canvas` API
  - `fetch` API
- Responsivo para dispositivos móveis e desktops.
- Popups (`window.open`) podem ser bloqueados pelo navegador — o usuário deve permitir popups para o site ao usar a funcionalidade de visualização do PDF.

---

## 👨‍💻 Desenvolvido por

**Matheus Cavalieri**  
Nitnave Offshore Solutions — Unidade REGAP
