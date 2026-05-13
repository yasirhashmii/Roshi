// Function to create floating hearts in the background
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤';
    
    // Randomize position on the screen
    heart.style.left = Math.random() * 100 + 'vw';
    
    // Randomize animation duration (between 4 and 7 seconds)
    heart.style.animationDuration = Math.random() * 3 + 4 + 's'; 
    
    // Randomize size of the hearts
    heart.style.fontSize = Math.random() * 1 + 1 + 'rem'; 
    
    document.getElementById('heart-container').appendChild(heart);
    
    // Remove heart after it goes off screen to keep the page running smoothly
    setTimeout(() => {
        heart.remove();
    }, 6000);
}

// Generate a new heart every 500 milliseconds
setInterval(createHeart, 500);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');

// Send Message Function
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

// Listen for "Enter" key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Sync messages in real-time
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // For a simple demo, we'll just style all messages similarly. 
    // You can add logic later to differentiate "me" vs "you".
    messageElement.classList.add('received'); 
    messageElement.innerText = data.text;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to bottom
});