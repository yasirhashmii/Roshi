// 1. Floating Hearts Animation (Keep this as is)
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 3 + 4 + 's'; 
    heart.style.fontSize = Math.random() * 1 + 1 + 'rem'; 
    document.getElementById('heart-container').appendChild(heart);
    setTimeout(() => { heart.remove(); }, 6000);
}
setInterval(createHeart, 500);

// 2. Firebase Configuration
// I've used the keys you provided. 
const firebaseConfig = {
    apiKey: "AIzaSyD8JXT__uxJZsFf9WKmKsWbglk6R7M0Os8",
    authDomain: "our-chat-76010.firebaseapp.com",
    databaseURL: "https://our-chat-76010-default-rtdb.firebaseio.com",
    projectId: "our-chat-76010",
    storageBucket: "our-chat-76010.firebasestorage.app",
    messagingSenderId: "336029010214",
    appId: "1:336029010214:web:8e0f52a3ae821a370959e7",
    measurementId: "G-XW25Q8C0Q9"
};

// 3. Initialize Firebase (Classic Style)
// We don't use 'import' here because the HTML script tags handle it.
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');

// 4. Send Message Function
function sendMessage() {
    const text = messageInput.value;
    if (text.trim() !== "") {
        database.ref('messages').push().set({
            text: text,
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 5. Sync messages in real-time
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Default style
    messageElement.classList.add('received'); 
    messageElement.innerText = data.text;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; 
});