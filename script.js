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
            senderId: myId, 
            timestamp: Date.now(),
            seen: false 
        });
        messageInput.value = "";
        
        // Instantly clears the typing status when the message sends
        database.ref('typing_status/' + myId).set(false); 
    }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ==========================================
// Smart "Seen" Observer Logic
// ==========================================
const seenObserver = new IntersectionObserver((entries) => {
    // 1. If the browser tab is hidden, stop immediately. Do not mark as seen.
    if (document.visibilityState !== 'visible') return;

    entries.forEach(entry => {
        // 2. If the message bubble physically enters the screen...
        if (entry.isIntersecting) {
            const messageKey = entry.target.dataset.key; // Get the ID
            
            // Update Firebase
            database.ref('messages/' + messageKey).update({ seen: true });
            
            // Stop watching this message so we don't spam the database
            seenObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 }); // The message must be at least 50% visible on screen

// 3. Handle Tab Switching
// If she switches back to your tab, re-check any unseen messages currently on screen
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        const unseenMessages = document.querySelectorAll('.unseen-msg');
        unseenMessages.forEach(msg => {
            seenObserver.unobserve(msg);
            seenObserver.observe(msg); // Re-trigger the camera check
        });
    }
});

// 5. Sync messages in real-time
database.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const messageKey = snapshot.key;
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.id = 'msg-' + messageKey; 
    
    // Attach the key to the HTML so our Observer can find it later
    messageElement.dataset.key = messageKey;
    
    if (data.senderId === myId) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }
    
    const textElement = document.createElement('div');
    textElement.innerText = data.text;
    messageElement.appendChild(textElement);
    
    const msgTime = data.timestamp ? new Date(data.timestamp) : new Date();
    const timeOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const timeString = msgTime.toLocaleString('en-US', timeOptions);
    
    const timeContainer = document.createElement('div');
    timeContainer.classList.add('timestamp');
    
    const timeText = document.createElement('span');
    timeText.innerText = timeString;
    timeContainer.appendChild(timeText);

    const seenStatus = document.createElement('span');
    seenStatus.classList.add('seen-status');
    seenStatus.innerText = data.seen ? '✓✓' : '✓'; 
    timeContainer.appendChild(seenStatus);

    messageElement.appendChild(timeContainer);
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (!isInitialChatLoad && soundEnabled) {
        if (data.senderId !== myId) {
            notificationSound.play().catch((err) => console.log(err));
        }
    }

    // === NEW: Use the Smart Observer instead of instantly updating ===
    if (data.senderId !== myId && !data.seen) {
        messageElement.classList.add('unseen-msg'); // Add a temporary class
        seenObserver.observe(messageElement);       // Turn the camera on for this message
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

// Listen for changes (like when a message gets read)
database.ref('messages').on('child_changed', (snapshot) => {
    const data = snapshot.val();
    const messageKey = snapshot.key;
    
    const messageElement = document.getElementById('msg-' + messageKey);
    
    if (messageElement) {
        const seenStatus = messageElement.querySelector('.seen-status');
        if (seenStatus) {
            seenStatus.innerText = data.seen ? 'Seen' : 'Delivered';
        }
        
        // Clean up the HTML once it's seen
        if (data.seen) {
            messageElement.classList.remove('unseen-msg');
        }
    }
});

// ==========================================
// Typing Indicator Logic
// ==========================================
const typingIndicator = document.getElementById('typing-indicator');
let typingTimeout = null;

// 1. Tell Firebase when YOU are typing
messageInput.addEventListener('input', () => {
    // Set your typing status to true
    database.ref('typing_status/' + myId).set(true);

    // Clear the timer if you keep typing
    if (typingTimeout) clearTimeout(typingTimeout);

    // Stop showing as "typing" after 5 seconds of inactivity
    typingTimeout = setTimeout(() => {
        database.ref('typing_status/' + myId).set(false);
    }, 5000);
});

// 2. Listen for when SHE is typing
database.ref('typing_status').on('value', (snapshot) => {
    let isSomeoneElseTyping = false;

    // Loop through all users' typing statuses
    snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const isTyping = childSnapshot.val();

        // If the ID isn't yours, and the status is true
        if (userId !== myId && isTyping === true) {
            isSomeoneElseTyping = true;
        }
    });

    // Show or hide the bouncing dots based on the check
    if (isSomeoneElseTyping) {
        typingIndicator.classList.remove('hidden');
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll down to see the dots
    } else {
        typingIndicator.classList.add('hidden');
    }
});