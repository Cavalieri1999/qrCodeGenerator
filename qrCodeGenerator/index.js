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

function baixarPDF() {
    const titulo = document.getElementById("pdf-titulo").value.trim() || "QR Code";
    fecharModal();

    const canvas = document.querySelector("#qrcode-container canvas");
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text(titulo, 105, 20, { align: "center" });
    pdf.addImage(imgData, "PNG", 55, 30, 100, 100);
    pdf.save(`${titulo}.pdf`);
}