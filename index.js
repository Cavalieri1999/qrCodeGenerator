function gerarQR() {
    const linkInput = document.getElementById("link-input");
    const container = document.getElementById("qrcode-container");
    const texto = linkInput.value.trim();

    // Limpa o QR Code gerado anteriormente
    container.innerHTML = "";

    const btnDownload = document.getElementById("btn-download");
    btnDownload.hidden = true;

    const erroMsg = document.getElementById("erro-msg");

    if (!texto) {
        erroMsg.textContent = "Por favor, insira um link ou texto válido!";
        return;
    }

    erroMsg.textContent = "";

    // Instancia a biblioteca para criar o gráfico do QR Code
    new QRCode(container, {
        text: texto,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    // Aguarda o canvas ser renderizado e exibe os botões de download
    setTimeout(() => {
        btnDownload.hidden = false;
        document.getElementById("btn-download-pdf").hidden = false;
    }, 100);
}

function baixarQR() {
    const canvas = document.querySelector("#qrcode-container canvas");
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function abrirModalPDF() {
    document.getElementById("pdf-titulo").value = "";
    document.getElementById("modal-pdf").showModal();
}

function fecharModal() {
    document.getElementById("modal-pdf").close();
}

async function baixarPDF() {
    const titulo = document.getElementById("pdf-titulo").value.trim() || ("pdf-titulo");
    const modelo = document.querySelector('input[name="pdf-modelo"]:checked').value;
    const arquivoPDF = modelo === "petrobras" ? "pdf_petrobras.pdf" : "pdf_nitnave.pdf";
    fecharModal();

    const { PDFDocument, rgb } = PDFLib;
    const canvas = document.querySelector("#qrcode-container canvas");
    const qrPngBytes = await fetch(canvas.toDataURL("image/png")).then(r => r.arrayBuffer());

    let pdfDoc, page, font, qrImage;

    try {
        const modeloBytes = await fetch(arquivoPDF).then(r => r.arrayBuffer());
        pdfDoc = await PDFDocument.load(modeloBytes);
        pdfDoc.registerFontkit(fontkit);
        page = pdfDoc.getPages()[0];
    } catch (e) {
        alert("Erro ao carregar o PDF base: " + e.message);
        return;
    }

    try {
        const cambriaBytes = await fetch("cambria.ttf").then(r => r.arrayBuffer());
        font = await pdfDoc.embedFont(cambriaBytes);
    } catch (e) {
        alert("Erro ao carregar a fonte: " + e.message);
        return;
    }

    try {
        qrImage = await pdfDoc.embedPng(qrPngBytes);
    } catch (e) {
        alert("Erro ao embutir QR Code: " + e.message);
        return;
    }

    try {
        const qrX = 185, qrY = 395, qrW = 228, qrH = 226;
        const fontSize = 22;
        const textWidth = font.widthOfTextAtSize(titulo, fontSize);
        const titleX = (qrX + qrW / 2) - textWidth / 2;
        const titleY = qrY + qrH + 20;

        page.drawText(titulo, { x: titleX, y: titleY, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
        page.drawImage(qrImage, { x: qrX, y: qrY, width: qrW, height: qrH });
    } catch (e) {
        alert("Erro ao desenhar no PDF: " + e.message);
        return;
    }

    try {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${titulo}.pdf`;
        link.click();
    } catch (e) {
        alert("Erro ao salvar PDF: " + e.message);
    }
}