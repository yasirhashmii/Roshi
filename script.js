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
setInterval(createHeart, 2000);

// function createCutie() {
//     const heart = document.createElement('div');
//     heart.classList.add('heart');
//     heart.innerHTML = 'Cutie';
//     heart.style.left = Math.random() * 100 + 'vw';
//     heart.style.animationDuration = Math.random() * 3 + 4 + 's'; 
//     heart.style.fontSize = Math.random() * 1 + 1 + 'rem'; 
//     document.getElementById('heart-container').appendChild(heart);
//     setTimeout(() => { heart.remove(); }, 6000);
// }
// setInterval(createCutie, 3000);


// 1. Generate or retrieve a unique ID for this device
let myId = localStorage.getItem('chat_user_id');
if (!myId) {
    myId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_user_id', myId);
}
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

// ==========================================
// Chat Notification Sound Logic
// ==========================================
let soundEnabled = true;
const soundToggleBtn = document.getElementById('soundToggle');
const notificationSound = document.getElementById('notification-audio');

// Toggle button click event
soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.innerText = soundEnabled ? '🔊' : '🔇';
});

// Flag to track if the website is just loading old messages
let isInitialChatLoad = true;

// Firebase triggers this ONCE after all old messages are loaded
database.ref('messages').once('value', () => {
    isInitialChatLoad = false;
});

// 4. Send Message Function
function sendMessage() {
    const text = messageInput.value;
    if (text.trim() !== "") {
        database.ref('messages').push().set({
            text: text,
            senderId: myId, // Tag the message with your ID
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
    
    // Logic: If the ID matches this device, put it on the right (sent)
    if (data.senderId === myId) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }
    
    messageElement.innerText = data.text;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // === NEW LOGIC: Play sound for incoming messages ===
    // We only play the sound IF it's not the initial page load AND sound is toggled on
    if (!isInitialChatLoad && soundEnabled) {
        // We also check that the senderId doesn't match your ID 
        // so it only dings when SHE sends a message, not when you type one.
        if (data.senderId !== myId) {
            notificationSound.play().catch((err) => {
                console.log("Browser blocked auto-play sound: ", err);
            });
        }
    }
});

// ==========================================
// 6. Vinyl Music Player Logic
// ==========================================

// Future-proof playlist array! You can add more objects here later.
const playlist = [
    {
        title: "Khat", // Replace with your actual song title
        src: "Songs/Khat.mp3" // Replace with your file path or external link
    }
];

let currentSongIndex = 0;
let isPlaying = false;

const audio = document.getElementById('bg-music');
const vinylBtn = document.getElementById('vinyl-btn');
const nowPlayingText = document.getElementById('now-playing');

// Load the initial song details
function loadSong(song) {
    audio.src = song.src;
    // We don't change the text to the song name until they actually click play
    if (isPlaying) {
        nowPlayingText.innerText = "Now playing: " + song.title;
    }
}

// Initialize the first song configuration
loadSong(playlist[currentSongIndex]);

// Play/Pause Action Toggle
function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        vinylBtn.classList.remove('playing');
        nowPlayingText.innerText = "Music Paused";
        isPlaying = false;
    } else {
        // Update text to show active song title right as it plays
        nowPlayingText.innerText = "Now playing: " + playlist[currentSongIndex].title;
        
        audio.play().then(() => {
            vinylBtn.classList.add('playing');
            isPlaying = true;
        }).catch((error) => {
            console.log("Playback blocked or failed: ", error);
            nowPlayingText.innerText = "Click to retry";
        });
    }
}

vinylBtn.addEventListener('click', toggleMusic);

// ==========================================
// 7. Auto-Advance Playlist Logic
// ==========================================

audio.addEventListener('ended', () => {
    // 1. Move to the next song index
    currentSongIndex++;

    // 2. If we hit the end of the playlist, wrap back around to the first song
    if (currentSongIndex >= playlist.length) {
        currentSongIndex = 0;
    }

    // 3. Load the new song details
    loadSong(playlist[currentSongIndex]);

    // 4. Update the display text immediately
    nowPlayingText.innerText = "Now playing: " + playlist[currentSongIndex].title;

    // 5. Play the next track smoothly
    audio.play().catch((error) => {
        console.log("Playback failed on track transition: ", error);
    });
});