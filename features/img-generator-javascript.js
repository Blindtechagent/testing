function sendPrompt() {
    var input = document.getElementById('imgPrompt');
    var prompt = input.value.trim();
    if (prompt) {
        generateImage(prompt);
        input.value = '';
    }
}

function generateImage(query) {
    const announcement = document.getElementById('announcement');
    const generateBtn = document.getElementById('generateBtn');
    announcement.innerText = "Generating image, please wait...";
    generateBtn.disabled = true;

    // Use a random seed to ensure a fresh image every time
    const seed = Math.floor(Math.random() * 1000000);
    var encodedQuery = encodeURIComponent(query);
    // Use the modern image.pollinations.ai endpoint with extra parameters
    var apiUrl = `https://image.pollinations.ai/prompt/${encodedQuery}?seed=${seed}&width=1024&height=1024&nologo=true`;
    displayImage(apiUrl, query);
}

function displayImage(apiUrl, query) {
    var imgBox = document.getElementById('imgBox');
    imgBox.style.display = "block"; // Ensure the box is visible
    imgBox.innerHTML = '<p class="loading-text" style="color: white; font-weight: bold;">Creating your masterpiece... This usually takes 5-10 seconds.</p>';
    
    var img = new Image();
    img.onload = function() {
        imgBox.innerHTML = ''; // Clear loading message
        img.alt = `AI generated image: ${query}`;
        img.className = "generated-image";
        img.style.display = "block";
        img.style.margin = "20px auto";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
        
        imgBox.appendChild(img);
        
        const announcement = document.getElementById('announcement');
        announcement.innerText = "Image generated successfully!";
        
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = false;
        
        // Scroll to the image
        imgBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    img.onerror = function() {
        const announcement = document.getElementById('announcement');
        announcement.innerText = "Failed to load the generated image. Please check your internet and try again.";
        imgBox.innerHTML = '<p style="color: red;">Error: Could not load image.</p>';
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = false;
    };
    img.src = apiUrl;
}

function downloadImage(url, query) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = query.replace(/\s+/g, '_') + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
}
