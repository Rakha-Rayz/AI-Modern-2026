// Ambil elemen DOM
const isiChat = document.getElementById('isi_chat');
const inputPrompt = document.getElementById('input_prompt');
const btnSend = document.getElementById('send');
const btnTrash = document.getElementById('trash');
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
const btnSaveConfig = document.getElementById('closeConfig');

// Load settings dari Local Storage
apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
modelSelect.value = localStorage.getItem('gemini_model') || 'gemini-1.5-flash';

// Fungsi Simpan Settings
btnSaveConfig.addEventListener('click', () => {
    localStorage.setItem('gemini_api_key', apiKeyInput.value);
    localStorage.setItem('gemini_model', modelSelect.value);
    alert('Settings saved!');
});

// Fungsi nambahin bubble chat ke UI
const addChatBubble = (text, isUser) => {
    const wrapper = document.createElement('div');
    wrapper.className = `mb-6 flex flex-col ${isUser ? 'items-end' : 'items-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = isUser 
        ? "bg-blue-600 p-4 rounded-2xl rounded-tr-none max-w-[85%] text-white shadow-lg"
        : "glass p-4 rounded-2xl rounded-tl-none max-w-[85%] border border-white/10";
    
    bubble.innerText = text;
    wrapper.appendChild(bubble);
    isiChat.appendChild(wrapper);
    
    // Auto scroll ke bawah
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

// Fungsi panggil API Gemini
async function askGemini(prompt) {
    const key = apiKeyInput.value;
    const model = modelSelect.value;

    if (!key) {
        alert("Isi API Key dulu di settings!");
        return;
    }

    addChatBubble(prompt, true);
    inputPrompt.value = '';

    // Loading indicator sederhana
    const loadingDiv = document.createElement('div');
    loadingDiv.className = "text-sm opacity-50 ml-2 animate-pulse";
    loadingDiv.innerText = "Gemini is thinking...";
    isiChat.appendChild(loadingDiv);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        isiChat.removeChild(loadingDiv);

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addChatBubble(aiResponse, false);
        } else {
            throw new Error("Gagal dapet respon.");
        }
    } catch (error) {
        isiChat.removeChild(loadingDiv);
        addChatBubble("Waduh, ada error nih. Cek API Key atau koneksi lo.", false);
        console.error(error);
    }
}

// Event Listeners
btnSend.onclick = () => {
    if (inputPrompt.value.trim()) askGemini(inputPrompt.value);
};

inputPrompt.onkeypress = (e) => {
    if (e.key === 'Enter' && inputPrompt.value.trim()) askGemini(inputPrompt.value);
};

btnTrash.onclick = () => {
    if (confirm("Hapus semua chat?")) {
        isiChat.innerHTML = '';
    }
};
