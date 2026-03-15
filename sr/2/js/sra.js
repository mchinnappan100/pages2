// Loom-style Screen Recorder
// Screen + Mic + Draggable Webcam Bubble

const startBtn = document.getElementById("start");
const downloadLink = document.getElementById("download");
const webcamPreview = document.getElementById("webcam");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const screenVideo = document.createElement("video");
screenVideo.autoplay = true;
screenVideo.playsInline = true;
screenVideo.muted = true;

let screenStream;
let micStream;
let cameraStream;
let mediaRecorder;

let chunks = [];

let bubbleX = 40;
let bubbleY = 40;
let bubbleSize = 180;

let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let timerInterval;
let seconds = 0;

//////////////////////////////////////////////////////////
// TIMER
//////////////////////////////////////////////////////////

function startTimer() {

    const timer = document.createElement("div");
    timer.id = "recTimer";

    timer.style.position = "fixed";
    timer.style.top = "20px";
    timer.style.right = "20px";
    timer.style.padding = "8px 14px";
    timer.style.background = "red";
    timer.style.color = "white";
    timer.style.fontWeight = "bold";
    timer.style.borderRadius = "6px";

    document.body.appendChild(timer);

    timerInterval = setInterval(() => {

        seconds++;

        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        timer.innerText =
            "● REC " +
            String(m).padStart(2, "0") +
            ":" +
            String(s).padStart(2, "0");

    }, 1000);
}

function stopTimer() {

    clearInterval(timerInterval);

    const timer = document.getElementById("recTimer");

    if (timer) timer.remove();
}

//////////////////////////////////////////////////////////
// CAMERA
//////////////////////////////////////////////////////////

async function startCamera() {

    cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    webcamPreview.srcObject = cameraStream;

    await webcamPreview.play();
}

//////////////////////////////////////////////////////////
// START RECORDING
//////////////////////////////////////////////////////////

async function startRecording() {

    startBtn.disabled = true;

    await startCamera();

    screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    });

    screenVideo.srcObject = screenStream;

    await screenVideo.play();

    micStream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    const track = screenStream.getVideoTracks()[0];
    const settings = track.getSettings();

    canvas.width = settings.width;
    canvas.height = settings.height;

    drawLoop();

    const canvasStream = canvas.captureStream(30);

    micStream.getAudioTracks().forEach(t =>
        canvasStream.addTrack(t)
    );

    startRecorder(canvasStream);

    track.onended = stopRecording;

    startTimer();
}

//////////////////////////////////////////////////////////
// DRAW LOOP
//////////////////////////////////////////////////////////

function drawLoop() {

    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

    if (webcamPreview.readyState >= 2) {

        const radius = bubbleSize / 2;

        ctx.save();

        ctx.beginPath();
        ctx.arc(bubbleX + radius, bubbleY + radius, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            webcamPreview,
            bubbleX,
            bubbleY,
            bubbleSize,
            bubbleSize
        );

        ctx.restore();
    }

    requestAnimationFrame(drawLoop);
}

//////////////////////////////////////////////////////////
// MEDIA RECORDER
//////////////////////////////////////////////////////////

function startRecorder(stream) {

    mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus"
    });

    mediaRecorder.start(200);

    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {

        const blob = new Blob(chunks, {
            type: "video/webm"
        });

        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = "screenRecording.webm";

        downloadLink.click();

        setTimeout(() => URL.revokeObjectURL(url), 2000);

        chunks = [];
    };
}

//////////////////////////////////////////////////////////
// STOP
//////////////////////////////////////////////////////////

function stopRecording() {

    stopTimer();

    mediaRecorder?.stop();

    screenStream?.getTracks().forEach(t => t.stop());
    micStream?.getTracks().forEach(t => t.stop());
    cameraStream?.getTracks().forEach(t => t.stop());

    startBtn.disabled = false;
}

//////////////////////////////////////////////////////////
// DRAG WEBCAM
//////////////////////////////////////////////////////////

document.addEventListener("mousedown", e => {

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
        x > bubbleX &&
        x < bubbleX + bubbleSize &&
        y > bubbleY &&
        y < bubbleY + bubbleSize
    ) {
        dragging = true;
        dragOffsetX = x - bubbleX;
        dragOffsetY = y - bubbleY;
    }
});

document.addEventListener("mousemove", e => {

    if (!dragging) return;

    const rect = canvas.getBoundingClientRect();

    bubbleX = e.clientX - rect.left - dragOffsetX;
    bubbleY = e.clientY - rect.top - dragOffsetY;
});

document.addEventListener("mouseup", () => {
    dragging = false;
});

//////////////////////////////////////////////////////////
// BUTTON
//////////////////////////////////////////////////////////

startBtn.onclick = startRecording;