// Author: Mohan Chinnappan
// Aug 2021 - Enhanced with preview window and webcam recording
// docs: ref: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API

// read query params
const query = location.search.substr(1);
var qresult = {};
query.split("&").forEach(function(part) {
    const item = part.split("=");
    qresult[item[0]] = decodeURIComponent(item[1]);
});

// URL parameters
const defaultName = 'screenRecording'
const outputFilename = (qresult.f || defaultName) + '.webm';
const showPreview = qresult.preview === 'true';
const includeWebcam = qresult.webcam === 'true';
const webcamSize = qresult.webcamsize || 'small'; // small, medium, large

// download link wire up
const downloadLink = document.getElementById('download');

// options and consts
const displayMediaOptions = {
    video: { cursor: "always" },
    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
};

const webcamOptions = {
    video: { 
        width: { ideal: 320 },
        height: { ideal: 240 },
        facingMode: "user"
    },
    audio: false // We'll use microphone audio from getUserMedia separately
};

const mimeType = 'video/webm';
let screenStream = null;
let webcamStream = null;
let combinedStream = null;
let mediaRecorder = null;
let previewVideo = null;
let webcamPreview = null;
let canvas = null;
let ctx = null;
let isRecording = false;
let animationId = null;

// Webcam positioning and sizing
const webcamSizes = {
    small: { width: 160, height: 120 },
    medium: { width: 240, height: 180 },
    large: { width: 320, height: 240 }
};

// Create preview window elements
function createPreviewWindow() {
    if (!showPreview) return;
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.id = 'previewContainer';
    previewContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        height: 250px;
        background: #000;
        border: 2px solid #007bff;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: none;
    `;
    
    // Create video element for preview
    previewVideo = document.createElement('video');
    previewVideo.style.cssText = `
        width: 100%;
        height: calc(100% - 30px);
        object-fit: contain;
    `;
    previewVideo.autoplay = true;
    previewVideo.muted = true;
    
    // Create header with controls
    const header = document.createElement('div');
    header.style.cssText = `
        height: 30px;
        background: #007bff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        font-size: 12px;
        border-radius: 6px 6px 0 0;
        cursor: grab;
    `;
    
    const title = document.createElement('span');
    title.textContent = includeWebcam ? '🔴 Recording (Screen + Webcam)' : '🔴 Recording Preview';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 14px;
        padding: 0;
        width: 20px;
        height: 20px;
    `;
    
    closeBtn.onclick = () => {
        previewContainer.style.display = 'none';
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    previewContainer.appendChild(header);
    previewContainer.appendChild(previewVideo);
    
    document.body.appendChild(previewContainer);
    
    // Make preview draggable
    makePreviewDraggable(previewContainer, header);
}

// Create webcam preview window
function createWebcamPreview() {
    if (!includeWebcam || !showPreview) return;
    
    const webcamContainer = document.createElement('div');
    webcamContainer.id = 'webcamPreviewContainer';
    webcamContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 200px;
        height: 150px;
        background: #000;
        border: 2px solid #28a745;
        border-radius: 8px;
        z-index: 9998;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: none;
    `;
    
    webcamPreview = document.createElement('video');
    webcamPreview.style.cssText = `
        width: 100%;
        height: calc(100% - 25px);
        object-fit: cover;
        border-radius: 0 0 6px 6px;
    `;
    webcamPreview.autoplay = true;
    webcamPreview.muted = true;
    
    const webcamHeader = document.createElement('div');
    webcamHeader.style.cssText = `
        height: 25px;
        background: #28a745;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        border-radius: 6px 6px 0 0;
    `;
    webcamHeader.textContent = '📹 Webcam';
    
    webcamContainer.appendChild(webcamHeader);
    webcamContainer.appendChild(webcamPreview);
    
    document.body.appendChild(webcamContainer);
}

// Make preview window draggable
function makePreviewDraggable(container, header) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
            header.style.cursor = 'grabbing';
        }
    }
    
    function dragMove(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            container.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }
    
    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        header.style.cursor = 'grab';
    }
}

// Create canvas for combining screen and webcam
function createCanvas() {
    if (!includeWebcam) return null;
    
    canvas = document.createElement('canvas');
    canvas.width = 1920; // Standard HD width
    canvas.height = 1080; // Standard HD height
    ctx = canvas.getContext('2d');
    return canvas;
}

// Combine screen and webcam streams
function combineStreams(screenStream, webcamStream) {
    if (!includeWebcam || !webcamStream) {
        return screenStream;
    }
    
    const canvas = createCanvas();
    const canvasStream = canvas.captureStream(30); // 30 FPS
    
    const screenVideo = document.createElement('video');
    screenVideo.srcObject = screenStream;
    screenVideo.play();
    
    const webcamVideo = document.createElement('video');
    webcamVideo.srcObject = webcamStream;
    webcamVideo.play();
    
    const webcamDimensions = webcamSizes[webcamSize];
    const margin = 20;
    
    function drawFrame() {
        if (!isRecording) return;
        
        // Draw screen content (full canvas)
        if (screenVideo.videoWidth > 0) {
            ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
        }
        
        // Draw webcam (picture-in-picture in bottom-right corner)
        if (webcamVideo.videoWidth > 0) {
            const webcamX = canvas.width - webcamDimensions.width - margin;
            const webcamY = canvas.height - webcamDimensions.height - margin;
            
            // Add a border around webcam
            ctx.fillStyle = '#007bff';
            ctx.fillRect(webcamX - 3, webcamY - 3, webcamDimensions.width + 6, webcamDimensions.height + 6);
            
            ctx.drawImage(webcamVideo, webcamX, webcamY, webcamDimensions.width, webcamDimensions.height);
        }
        
        animationId = requestAnimationFrame(drawFrame);
    }
    
    drawFrame();
    
    return canvasStream;
}

async function startCapture(displayMediaOptions) {
    try {
        // Get screen capture
        screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        
        // Get webcam if enabled
        if (includeWebcam) {
            try {
                webcamStream = await navigator.mediaDevices.getUserMedia(webcamOptions);
                if (webcamPreview) {
                    webcamPreview.srcObject = webcamStream;
                    document.getElementById('webcamPreviewContainer').style.display = 'block';
                }
            } catch (webcamError) {
                console.warn('Webcam access denied or not available:', webcamError);
                alert('Webcam access denied. Recording screen only.');
            }
        }
        
        // Get audio stream
        const audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioTrack = audioStream.getAudioTracks()[0];
        
        // Combine video streams
        let videoStream;
        if (includeWebcam && webcamStream) {
            videoStream = combineStreams(screenStream, webcamStream);
        } else {
            videoStream = screenStream;
        }
        
        // Create final combined stream with audio
        const videoTrack = videoStream.getVideoTracks()[0];
        combinedStream = new MediaStream([videoTrack, audioTrack]);
        
        // Show preview if enabled
        if (showPreview && previewVideo) {
            previewVideo.srcObject = includeWebcam ? videoStream : screenStream;
            document.getElementById('previewContainer').style.display = 'block';
        }

        // Handle track ending
        screenStream.getTracks().forEach((track) =>
            track.addEventListener("ended", () => {
                stopRecording();
            })
        );

        handleMediaRecording({stream: combinedStream, mimeType});
        updateStartButton(true);

    } catch(err) {
        alert('Error: ' + err.message);
        console.error("Error: " + err);
        updateStartButton(false);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    
    // Stop all streams
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
    }
    if (combinedStream) {
        combinedStream.getTracks().forEach(track => track.stop());
    }
    
    // Cancel animation frame
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    hidePreview();
    updateStartButton(false);
}

function hidePreview() {
    if (previewVideo) {
        previewVideo.srcObject = null;
        document.getElementById('previewContainer').style.display = 'none';
    }
    if (webcamPreview) {
        webcamPreview.srcObject = null;
        const webcamContainer = document.getElementById('webcamPreviewContainer');
        if (webcamContainer) {
            webcamContainer.style.display = 'none';
        }
    }
}

function updateStartButton(recording) {
    const startButton = document.getElementById('start');
    isRecording = recording;
    
    if (recording) {
        startButton.textContent = 'Stop Recording';
        startButton.className = 'btn btn-danger';
    } else {
        let buttonText = 'Start Screen Recording with Audio';
        if (includeWebcam) buttonText += ' + Webcam';
        if (showPreview) buttonText += ' & Preview';
        
        startButton.textContent = buttonText;
        startButton.className = 'btn btn-info';
    }
}

// Enhanced click handling of start button 
const startButton = document.getElementById('start');
startButton.addEventListener('click', e => {
    if (isRecording) {
        stopRecording();
    } else {
        startCapture(displayMediaOptions);
    }
});

const handleMediaRecording = ({stream, mimeType}) => {
    let recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start(200);
    
    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
            type: mimeType
        });
        recordedChunks = [];
        
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = outputFilename;
        downloadLink.click();
        
        window.URL.revokeObjectURL(url);
        stopRecording();
    };
};

// Initialize preview windows if enabled
document.addEventListener('DOMContentLoaded', () => {
    createPreviewWindow();
    createWebcamPreview();
    updateStartButton(false);
});

// EOF