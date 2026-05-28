
    document.addEventListener('DOMContentLoaded', () => {
      const selectImageBtn = document.getElementById('selectImageBtn');
      const captureCameraBtn = document.getElementById('captureCameraBtn');
      const fileInput = document.getElementById('fileInput');
      const cameraInput = document.getElementById('cameraInput');
      const languageSelect = document.getElementById('languageSelect');
      const convertBtn = document.getElementById('convertBtn');
      const statusContainer = document.getElementById('statusContainer');
      const progressWrapper = document.getElementById('progressWrapper');
      const progressBar = document.getElementById('progressBar');
      const resultContainer = document.getElementById('resultContainer');
      const copyBtn = document.querySelector('.copyBtn');
      const preview = document.getElementById('imagePreview');
      
      // REPLACE 'helloworld' WITH YOUR FREE API KEY FROM https://ocr.space/ocrapi
      const API_KEY = 'helloworld'; 

      let selectedFile = null;

      statusContainer.textContent = "Ready.";

      if (selectImageBtn) {
        selectImageBtn.addEventListener('click', () => fileInput.click());
      }
      if (captureCameraBtn) {
        captureCameraBtn.addEventListener('click', () => cameraInput.click());
      }

      const handleFileSelection = (e) => {
        const file = e.target.files[0];
        if (file) {
          selectedFile = file;
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
          };
          reader.readAsDataURL(file);
          
          if (e.target === fileInput) {
            cameraInput.value = '';
          } else {
            fileInput.value = '';
          }
        }
      };

      if (fileInput) fileInput.addEventListener('change', handleFileSelection);
      if (cameraInput) cameraInput.addEventListener('change', handleFileSelection);

      convertBtn.addEventListener('click', async () => {
        if (!selectedFile) {
          statusContainer.textContent = "Please select or capture an image file.";
          statusContainer.classList.add("error");
          return;
        }

        statusContainer.textContent = "Sending to server...";
        statusContainer.classList.remove("success", "error");
        progressWrapper.style.display = 'block';
        progressBar.style.width = '50%'; // Set to 50% as it's an upload

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("apikey", API_KEY);
        formData.append("language", languageSelect.value); // eng, hin, etc.
        formData.append("isOverlayRequired", false);

        try {
          const response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            body: formData
          });

          const result = await response.json();

          if (result.OCRExitCode === 1) {
            const text = result.ParsedResults[0].ParsedText;
            resultContainer.textContent = text;
            statusContainer.textContent = "Conversion complete!";
            statusContainer.classList.add("success");
            copyBtn.style.display = "inline";
          } else {
            console.error('OCR Error:', result.ErrorMessage);
            statusContainer.textContent = "Error: " + (result.ErrorMessage || "Could not read image.");
            statusContainer.classList.add("error");
          }
        } catch (error) {
          console.error('Network Error:', error);
          statusContainer.textContent = "Network error. Please check your connection.";
          statusContainer.classList.add("error");
        } finally {
          progressWrapper.style.display = 'none';
          progressBar.style.width = '0%';
        }
      });

      copyBtn.addEventListener('click', () => {
        const text = resultContainer.textContent;
        navigator.clipboard.writeText(text)
          .then(() => typeof announce === 'function' ? announce("Text copied to clipboard") : alert("Text copied to clipboard"))
          .catch(() => typeof announce === 'function' ? announce("Failed to copy text") : alert("Failed to copy text"));
      });

    });
  