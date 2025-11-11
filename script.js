// Global variables
let localStream = null;
let videoEnabled = true;
let audioEnabled = true;
let studentName = '';

// Show join modal
function showClassJoin() {
    document.getElementById('joinModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('joinModal').style.display = 'none';
}

// Join class
async function joinClass() {
    const nameInput = document.getElementById('studentName');
    const codeInput = document.getElementById('classCode');
    
    studentName = nameInput.value.trim();
    const classCode = codeInput.value.trim();
    
    if (!studentName) {
        alert('Please enter your name');
        return;
    }
    
    if (!classCode) {
        alert('Please enter a class code');
        return;
    }
    
    // Close modal
    closeModal();
    
    // Request camera and microphone access
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Display local video
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = localStream;
        
        // Show class room
        document.getElementById('classRoom').classList.remove('hidden');
        
        // Add welcome message to chat
        addChatMessage('System', `Welcome ${studentName}! You've joined the class.`);
        
        // Simulate teacher joining (for demo purposes)
        setTimeout(() => {
            addChatMessage('System', 'Teacher has joined the class');
            // In a real application, you would establish WebRTC connection here
        }, 2000);
        
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Unable to access camera/microphone. Please check permissions.');
    }
}

// Leave class
function leaveClass() {
    if (confirm('Are you sure you want to leave the class?')) {
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        // Hide class room
        document.getElementById('classRoom').classList.add('hidden');
        
        // Clear video
        document.getElementById('localVideo').srcObject = null;
        
        // Reset state
        localStream = null;
        videoEnabled = true;
        audioEnabled = true;
        
        // Clear chat
        document.getElementById('chatMessages').innerHTML = '';
    }
}

// Toggle video
function toggleVideo() {
    if (localStream) {
        videoEnabled = !videoEnabled;
        const videoTrack = localStream.getVideoTracks()[0];
        
        if (videoTrack) {
            videoTrack.enabled = videoEnabled;
        }
        
        const btn = document.getElementById('toggleVideo');
        const icon = document.getElementById('videoIcon');
        
        if (videoEnabled) {
            btn.classList.remove('off');
            icon.textContent = '📹';
        } else {
            btn.classList.add('off');
            icon.textContent = '🚫';
        }
        
        addChatMessage('System', `Camera ${videoEnabled ? 'enabled' : 'disabled'}`);
    }
}

// Toggle audio
function toggleAudio() {
    if (localStream) {
        audioEnabled = !audioEnabled;
        const audioTrack = localStream.getAudioTracks()[0];
        
        if (audioTrack) {
            audioTrack.enabled = audioEnabled;
        }
        
        const btn = document.getElementById('toggleAudio');
        const icon = document.getElementById('audioIcon');
        
        if (audioEnabled) {
            btn.classList.remove('off');
            icon.textContent = '🎤';
        } else {
            btn.classList.add('off');
            icon.textContent = '🔇';
        }
        
        addChatMessage('System', `Microphone ${audioEnabled ? 'enabled' : 'disabled'}`);
    }
}

// Share screen
async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = localStream.getVideoTracks()[0];
        
        if (sender) {
            // Replace the video track
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = screenStream;
            
            addChatMessage('System', 'Screen sharing started');
            
            // When screen share stops, revert to camera
            videoTrack.onended = async () => {
                try {
                    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    localStream.removeTrack(localStream.getVideoTracks()[0]);
                    localStream.addTrack(cameraStream.getVideoTracks()[0]);
                    localVideo.srcObject = localStream;
                    addChatMessage('System', 'Screen sharing stopped');
                } catch (error) {
                    console.error('Error reverting to camera:', error);
                }
            };
        }
    } catch (error) {
        console.error('Error sharing screen:', error);
        alert('Unable to share screen');
    }
}

// Send chat message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(studentName, message);
        input.value = '';
    }
}

// Add chat message
function addChatMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Allow sending message with Enter key
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        const modal = document.getElementById('joinModal');
        if (event.target === modal) {
            closeModal();
        }
    };
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
