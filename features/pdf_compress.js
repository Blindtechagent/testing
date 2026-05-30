const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const compressSection = document.getElementById('compress-section');
const uploadSection = document.getElementById('upload-section');
const status = document.getElementById('status');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const fileSizeDisplay = document.getElementById('fileSizeDisplay');
const resultInfo = document.getElementById('resultInfo');

let selectedFile = null;

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

function handleFile(file) {
    selectedFile = file;
    fileNameDisplay.innerText = `File: ${file.name}`;
    fileSizeDisplay.innerText = `Original Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    
    uploadSection.style.display = 'none';
    compressSection.style.display = 'block';
    status.innerText = "";
    resultInfo.innerText = "";
    announce("File loaded. Ready to compress.");
}

function clearFile() {
    selectedFile = null;
    uploadSection.style.display = 'block';
    compressSection.style.display = 'none';
    status.innerText = "";
    resultInfo.innerText = "";
    announce("File cleared");
}

async function compressPDF() {
    status.innerText = "Compressing PDF... This may take a moment.";
    announce("Compression started");

    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await selectedFile.arrayBuffer();
        
        // Load and re-save is a basic way to "clean" and sometimes compress
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Remove metadata to save space
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        // Saving with useObjectStreams: true can often reduce size
        const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
        
        const originalSize = selectedFile.size;
        const newSize = compressedPdfBytes.length;
        const saved = originalSize - newSize;
        const percent = ((saved / originalSize) * 100).toFixed(1);

        download(compressedPdfBytes, `compressed_${selectedFile.name}`, "application/pdf");
        
        status.innerText = "Compression complete!";
        resultInfo.innerText = `New Size: ${(newSize / 1024 / 1024).toFixed(2)} MB (Saved ${percent}%)`;
        announce(`Compression complete. Saved ${percent} percent.`);
    } catch (error) {
        console.error(error);
        status.innerText = "Error compressing PDF.";
        announce("Error during compression");
    }
}

function download(data, filename, type) {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function announce(message) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.innerText = message;
    }
}
