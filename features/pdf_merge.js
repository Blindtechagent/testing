const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const actionButtons = document.getElementById('action-buttons');
const status = document.getElementById('status');

let selectedFiles = [];

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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    addFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
});

function addFiles(files) {
    if (files.length > 0) {
        selectedFiles = [files[0]];
        updateFileList();
    }
}

function updateFileList() {
    fileList.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span>${file.name}</span>
            <button class="remove-btn" onclick="removeFile(${index})" aria-label="Remove ${file.name}">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileList.appendChild(item);
    });

    if (selectedFiles.length > 0) {
        actionButtons.style.display = 'block';
    } else {
        actionButtons.style.display = 'none';
    }
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    announce("File removed");
}

function clearFiles() {
    selectedFiles = [];
    updateFileList();
    status.innerText = '';
    announce("All files cleared");
}

async function mergePDFs() {
    if (selectedFiles.length === 0) {
        alert("Please select a PDF file.");
        return;
    }

    status.innerText = "Processing PDF... Please wait.";
    announce("Processing started");

    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of selectedFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        download(mergedPdfBytes, `processed_${selectedFiles[0].name}`, "application/pdf");

        status.innerText = "Processing successful! Your file has been downloaded.";
        announce("Processing successful");
    } catch (error) {
        console.error(error);
        status.innerText = "Error processing PDF. Please make sure the file is not corrupted.";
        announce("Error during processing");
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
