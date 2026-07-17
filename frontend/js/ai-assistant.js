document.addEventListener('DOMContentLoaded', () => {

    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessages = document.getElementById('chatMessages');

    let isSending = false;

    chatToggleBtn.addEventListener('click', () => {

        chatWindow.classList.toggle('hidden');

        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }

    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    chatInput.addEventListener('keydown', (e) => {

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }

    });

    sendChatBtn.addEventListener('click', sendMessage);

    function addMessage(text, isUser = false) {

        const messageDiv = document.createElement('div');

        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');

        messageDiv.style.opacity = "0";
        messageDiv.style.transform = "translateY(10px)";

        const p = document.createElement('p');
        p.textContent = text;

        messageDiv.appendChild(p);

        chatMessages.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.transition = "all 0.3s ease";
            messageDiv.style.opacity = "1";
            messageDiv.style.transform = "translateY(0)";
        }, 10);

        chatMessages.scrollTop = chatMessages.scrollHeight;

    }

    function showTypingIndicator() {

        const indicator = document.createElement('div');

        indicator.classList.add('typing-indicator');
        indicator.id = 'typingIndicator';

        indicator.innerHTML = `
<div class="typing-dot"></div>
<div class="typing-dot"></div>
<div class="typing-dot"></div>
`;

        chatMessages.appendChild(indicator);

        chatMessages.scrollTop = chatMessages.scrollHeight;

    }

    function removeTypingIndicator() {

        const indicator = document.getElementById('typingIndicator');

        if (indicator) {
            indicator.remove();
        }

    }

    async function sendMessage() {

        const text = chatInput.value.trim();

        if (!text || isSending) return;

        isSending = true;

        chatInput.value = "";

        sendChatBtn.disabled = true;

        addMessage(text, true);

        showTypingIndicator();

        try {

            const response = await fetch("http://localhost:5000/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            removeTypingIndicator();

            if (response.ok) {
                addMessage(data.reply);
            } else {
                addMessage("AI server error. Please try again.");
            }

        }
        catch (error) {

            console.error("AI Error:", error);

            removeTypingIndicator();

            addMessage("Connection error. Check if AI server is running.");

        }

        finally {

            isSending = false;

            sendChatBtn.disabled = false;

            chatInput.focus();

        }

    }

});