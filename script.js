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