const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const splitSection = document.getElementById('split-section');
const uploadSection = document.getElementById('upload-section');
const status = document.getElementById('status');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const pageCountDisplay = document.getElementById('pageCountDisplay');
const pageRangeInput = document.getElementById('pageRange');

let selectedFile = null;
let totalPages = 0;

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

async function handleFile(file) {
    selectedFile = file;
    status.innerText = "Loading PDF...";
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        totalPages = pdfDoc.getPageCount();
        
        fileNameDisplay.innerText = `File: ${file.name}`;
        pageCountDisplay.innerText = `Total Pages: ${totalPages}`;
        
        uploadSection.style.display = 'none';
        splitSection.style.display = 'block';
        status.innerText = "";
        announce("File loaded. Enter page range to extract.");
    } catch (error) {
        console.error(error);
        status.innerText = "Error loading PDF.";
        announce("Error loading PDF");
    }
}

function clearFile() {
    selectedFile = null;
    totalPages = 0;
    uploadSection.style.display = 'block';
    splitSection.style.display = 'none';
    status.innerText = "";
    pageRangeInput.value = "";
    announce("File cleared");
}

async function splitPDF() {
    const range = pageRangeInput.value.trim();
    if (!range) {
        alert("Please enter a page range.");
        return;
    }

    const pageIndices = parsePageRange(range, totalPages);
    if (pageIndices.length === 0) {
        alert("Invalid page range.");
        return;
    }

    status.innerText = "Splitting PDF... Please wait.";
    announce("Splitting started");

    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await selectedFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer);
        const newDoc = await PDFDocument.create();

        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(page => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        download(pdfBytes, `split_${selectedFile.name}`, "application/pdf");
        
        status.innerText = "Split successful! Your file has been downloaded.";
        announce("Split successful");
    } catch (error) {
        console.error(error);
        status.innerText = "Error splitting PDF.";
        announce("Error during split");
    }
}

function parsePageRange(range, maxPages) {
    const indices = new Set();
    const parts = range.split(',');

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
                    indices.add(i - 1);
                }
            }
        } else {
            const page = parseInt(part.trim());
            if (!isNaN(page) && page >= 1 && page <= maxPages) {
                indices.add(page - 1);
            }
        }
    }

    return Array.from(indices).sort((a, b) => a - b);
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
