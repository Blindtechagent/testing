
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
      
      let selectedFile = null;
      let worker = null;

      // 1. Background Worker Pre-loading
      async function initWorker() {
        if (!worker) {
          statusContainer.textContent = "Initializing OCR engine...";
          worker = await Tesseract.createWorker({
            logger: m => {
              if (m.status === 'recognizing text') {
                const progress = Math.round(m.progress * 100);
                progressBar.style.width = progress + '%';
                statusContainer.textContent = `Processing: ${progress}%`;
              }
            }
          });
        }
      }

      // Initialize on page load
      initWorker().then(() => {
        statusContainer.textContent = "Ready.";
      });

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

      // 2. Image Pre-processing for better accuracy
      function preprocessImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // Basic contrast enhancement: simple thresholding
          const threshold = 128;
          const val = avg > threshold ? 255 : 0;
          
          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
      }

      convertBtn.addEventListener('click', async () => {
        if (selectedFile) {
          statusContainer.textContent = "Preparing image...";
          statusContainer.classList.remove("success", "error");
          progressWrapper.style.display = 'block';
          progressBar.style.width = '0%';

          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);

          reader.onload = () => {
            const image = new Image();
            image.src = reader.result;

            image.onload = async () => {
              try {
                // Pre-process before OCR
                const processedImageData = preprocessImage(image);
                const selectedLanguage = languageSelect.value;

                await initWorker();
                await worker.loadLanguage(selectedLanguage);
                await worker.initialize(selectedLanguage);
                
                const { data: { text } } = await worker.recognize(processedImageData);
                
                resultContainer.textContent = text;
                statusContainer.textContent = "Conversion complete!";
                statusContainer.classList.add("success");
                copyBtn.style.display = "inline";
                progressWrapper.style.display = 'none';
              } catch (error) {
                console.error('Error:', error);
                statusContainer.textContent = "An error occurred. Please try again.";
                statusContainer.classList.add("error");
                copyBtn.style.display = "none";
                progressWrapper.style.display = 'none';
              }
            };
          };
        } else {
          resultContainer.textContent = "";
          statusContainer.textContent = "Please select or capture an image file.";
          statusContainer.classList.add("error");
          copyBtn.style.display = "none";
        }
      });

      copyBtn.addEventListener('click', () => {
        const text = resultContainer.textContent;
        navigator.clipboard.writeText(text)
          .then(() => typeof announce === 'function' ? announce("Text copied to clipboard") : alert("Text copied to clipboard"))
          .catch(() => typeof announce === 'function' ? announce("Failed to copy text") : alert("Failed to copy text"));
      });

    });
  