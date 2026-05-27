const enAPI = "c2stb3ItdjEtN2U1ZGZjOGMwNmE3MjZkODUwNTQyZGVlM2YwY2Y2ZTFkNWY2YmFiYmNmZDM1Mjk0YTIyMDZmYWVjYjZlZWYyZA==";
const API_KEY = atob(enAPI);

// Function to fetch AI response from OpenRouter
async function fetchAIResponse(userMsg, tb, loadingIndicator) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openrouter/auto",
                messages: [
                    { role: "system", content: "You are a helpful, versatile assistant created by Pawan Kumar. You are a general-purpose AI and are not restricted to any specific topics or user needs. Never refer to yourself by any specific name. Your responses must be strictly clean, clear, direct, and effective. Avoid flowery language, unnecessary formatting, or complex structures. Provide only the essential information needed to answer the user's request. STRICT INSTRUCTION: You must respond using only raw HTML tags for formatting. DO NOT include any markdown (like ```html), DO NOT include any HTML boilerplate (like <html>, <head>, <body>), and DO NOT include any explanatory text outside the HTML." },
                    { role: "user", content: userMsg }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch response');
        }

        const data = await response.json();
        const answerValue = data.choices[0].message.content;

        tb.removeChild(loadingIndicator); // Remove loading indicator after response is received

        // Append the AI's response to the chat
        appendMessage('BTA AI said:', answerValue, 'msg1', 'sender-ai', tb);
        // Auto-scroll the chat window to show the new message
        tb.scrollTop = tb.scrollHeight;
        // Announce AI response (for screen readers)
        announce("Blind Tech Agent AI replied");

    } catch (error) {
        console.error("Error:", error);
        if (loadingIndicator && loadingIndicator.parentNode === tb) {
            tb.removeChild(loadingIndicator); // Ensure loading indicator is removed on error
        }
        announce("There was an error fetching the response: " + error.message);
    }
}

// Add event listener to form submission for text-based input
document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();
    const inputMsg = document.getElementById('msg_text').value.trim();
    const tb = document.getElementById('tb');

    if (inputMsg !== '') {
        // User message section
        appendMessage('You said:', inputMsg, 'msg', 'sender-user', tb);

        // Announce message sent successfully (for screen readers)
        announce("Message sent successfully");

        document.getElementById('msg_text').value = '';  // Clear input field
        tb.scrollTop = tb.scrollHeight;  // Auto-scroll to the latest message

        // Display loading indicator while fetching AI response
        const loadingIndicator = appendMessage('BTA AI is typing...', '...', 'msg1', 'loading', tb);

        // Fetch AI response
        fetchAIResponse(inputMsg, tb, loadingIndicator);
    }
});

// Function to append message to the chat
function appendMessage(sender, text, messageClass, senderClass, parentElement) {
    const msgContainer = document.createElement('div');
    msgContainer.className = messageClass;

    const heading = document.createElement('h5');
    heading.textContent = sender;
    heading.className = senderClass;

    const msgText = document.createElement('span');
    msgText.innerHTML = text;

    msgContainer.appendChild(heading);
    msgContainer.appendChild(msgText);
    let lineBreak = document.createElement('br');;
    msgContainer.appendChild(lineBreak);
    // Add "Listen" and "copy" button for AI messages
    if (messageClass === 'msg1') {
        const listenButton = createListenButton(text);
        msgContainer.appendChild(listenButton);
        const copyButton = createCopyButton(text);
        msgContainer.appendChild(copyButton);
    }

    parentElement.appendChild(msgContainer);

    return msgContainer;  // Return the message container to remove loading indicator later
}

// Function to create the "Listen" button and add voice functionality
function createListenButton(text) {
    const listenButton = document.createElement('button');
    listenButton.className = 'btn listen-btn';
    listenButton.setAttribute('aria-label', 'Listen');
    // Adding the icon for Listen button
    const icon = document.createElement('i');
    icon.className = 'fas fa-volume-up';  // Font Awesome icon for volume up
    listenButton.appendChild(icon);
    listenButton.addEventListener('click', function () {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US';
        window.speechSynthesis.speak(speech);
    });
    return listenButton;
}

// Function to create a 'Copy' button for AI message
function createCopyButton(text) {
    const copyButton = document.createElement('button');
    copyButton.className = 'btn copy-btn';
    copyButton.setAttribute('aria-label', 'Copy response');
    // Adding the icon for Copy button
    const icon = document.createElement('i');
    icon.className = 'fas fa-copy';  // Font Awesome icon for copy
    copyButton.appendChild(icon);

    // Adding click event to copy the AI message to the clipboard
    copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(text)
            .then(() => announce("Message copied to clipboard"))  // Announce copy success
            .catch(() => announce("Failed to copy message"));  // Announce copy failure
    });

    return copyButton;  // Return the copy button to append to the message
}

// Function to announce messages to screen readers
function announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');  // Set role to 'alert' for live region
    announcement.className = 'visually-hidden';  // Make it visually hidden
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove the announcement after 1 second to avoid clutter
    setTimeout(() => document.body.removeChild(announcement), 1000);
}

// Add event listener for the microphone button to use voice recognition for input
document.getElementById('micBtn').addEventListener('click', function () {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('msg_text').value = transcript;
        };

        recognition.onerror = function () {
            announce("Sorry, I couldn't hear you. Please try again.");
        };
    } else {
        announce("Speech recognition is not supported in this browser.");
    }
});

// Event listener to refresh (clear) the chat
document.getElementById('refreshButton').addEventListener('click', function () {
    const tb = document.getElementById('tb');
    tb.innerHTML = '';
    const initialMsg = document.createElement('div');
    initialMsg.className = 'dfm';
    initialMsg.innerHTML = '<span>Hello! I am Blind Tech Agent AI. How can I assist you today?</span>';
    tb.appendChild(initialMsg);
    announce("Chat refreshed");
});
