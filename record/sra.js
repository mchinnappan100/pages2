// Author: Mohan Chinnappan
// Aug 2021 - Enhanced with preview window
// docs: ref: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API

// read query params
const query = location.search.substr(1);
var qresult = {};
query.split("&").forEach(function(part) {
    const item = part.split("=");
    qresult[item[0]] = decodeURIComponent(item[1]);
});

// ?f=filename is the format, ?preview=true for preview window
const defaultName = 'screenRecording'
const outputFilename = (qresult.f || defaultName) + '.webm';
const showPreview = qresult.preview === 'true';

// download link wire up
const downloadLink = document.getElementById('download');

// options and consts
const displayMediaOptions = {
    video: { cursor: "always" },
    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
};

const mimeType = 'video/webm';
let stream = null;
let mediaRecorder = null;
let previewVideo = null;
let isRecording = false;

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
        width: 300px;
        height: 200px;
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
    previewVideo.muted = true; // Prevent feedback
    
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
    `;
    
    const title = document.createElement('span');
    title.textContent = '🔴 Recording Preview';
    
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

async function startCapture(displayMediaOptions) {
    try {
        // Get screen capture
        const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        const [vtracks] = stream.getVideoTracks();

        // Get audio stream
        const audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
        const [atracks] = audioStream.getAudioTracks();

        // Combine streams
        const stream2 = new MediaStream([vtracks, atracks]);
        
        // Show preview if enabled
        if (showPreview && previewVideo) {
            previewVideo.srcObject = stream; // Use original video stream for preview
            document.getElementById('previewContainer').style.display = 'block';
        }

        // Handle track ending
        stream.getTracks().forEach((track) =>
            track.addEventListener("ended", () => {
                audioStream.getAudioTracks().forEach((audio) => audio.stop());
                if (mediaRecorder) {
                    mediaRecorder.stop();
                }
                mediaRecorder = null;
                hidePreview();
                updateStartButton(false);
            })
        ); 

        handleMediaRecording({stream: stream2, mimeType});
        updateStartButton(true);

    } catch(err) {
        alert(err);
        console.error("Error: " + err);
        updateStartButton(false);
    }
}

function hidePreview() {
    if (previewVideo) {
        previewVideo.srcObject = null;
        document.getElementById('previewContainer').style.display = 'none';
    }
}

function updateStartButton(recording) {
    const startButton = document.getElementById('start');
    isRecording = recording;
    
    if (recording) {
        startButton.textContent = 'Stop Recording';
        startButton.className = 'btn btn-danger';
    } else {
        startButton.textContent = showPreview ? 'Start Screen Recording with Audio & Preview' : 'Start Screen Recording with Audio';
        startButton.className = 'btn btn-info';
    }
}

// Enhanced click handling of start button 
const startButton = document.getElementById('start');
startButton.addEventListener('click', e => {
    if (isRecording) {
        // Stop recording
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    } else {
        // Start recording
        startCapture(displayMediaOptions);
    }
});

const handleMediaRecording = ({stream, mimeType}) => {
    let recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start(200);
    
    // event handling 
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
        hidePreview();
        updateStartButton(false);
    };
};

// Initialize preview window if enabled
document.addEventListener('DOMContentLoaded', () => {
    createPreviewWindow();
    updateStartButton(false);
});

// EOF