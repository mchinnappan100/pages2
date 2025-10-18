class SpeechRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioRecorder = null;
    this.chunks = [];
    this.audioChunks = [];
    this.recordedBlob = null;
    this.audioBlob = null;
    this.scrollInterval = null;
    this.editor = null;
    this.recognition = null;
    this.initializeSplitter();
    this.initializeEventListeners();
    this.loadMonaco();
    this.loadStartupFile();
    this.requestPermissionsAndLoadDevices();
  }

  async loadStartupFile() {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/mchinnappan100/sales-pitches/main/salesforce/service-cloud.md"
      );
      const content = await response.text();
      document.getElementById("markdownContent").innerHTML =
        marked.parse(content);
      this.updateScrollIndicator();
      this.updateStatus(
        "✅ Salesforce Service Cloud pitch loaded!",
        "status-ready"
      );
    } catch (err) {
      console.error("Failed to load startup file:", err);
      this.updateStatus("⚠️ Could not load startup file", "bg-yellow-600");
    }
  }

  async loadMonaco() {
    await new Promise((resolve) => {
      require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
        },
      });
      require(["vs/editor/editor.main"], () => {
        this.editor = monaco.editor.create(
          document.getElementById("monacoContainer"),
          {
            value: "// Record your video, then press Ctrl+T!\n ",
            language: "plaintext",
            theme: "vs-dark",
            fontSize: 14,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
          }
        );
        resolve();
      });
    });
    this.makePopupDraggable();
  }

  makePopupDraggable() {
    const popup = document.getElementById("monacoPopup");
    const header = document.getElementById("popupHeader");
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = popup.offsetLeft;
      startTop = popup.offsetTop;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      popup.style.left = startLeft + dx + "px";
      popup.style.top = startTop + dy + "px";
      popup.style.transform = "none";
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }

  openMonacoPopup() {
    document.getElementById("popupBackdrop").style.display = "block";
    document.getElementById("monacoPopup").style.display = "block";
    this.editor.layout(); // ✅ FIXED: Force layout
    this.editor.focus();
  }

  closeMonacoPopup() {
    document.getElementById("popupBackdrop").style.display = "none";
    document.getElementById("monacoPopup").style.display = "none";
  }

  // ✅ INSTANT BROWSER SPEECH-TO-TEXT
  async generateTranscript() {
    if (!this.audioBlob) {
      this.updateStatus("No audio to transcribe", "bg-red-600");
      return;
    }

    this.openMonacoPopup();
    const transcribeBtn = document.getElementById("transcribeBtn");
    transcribeBtn.classList.add("listening");

    try {
      this.recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      let transcript = "";

      this.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        this.editor.setValue(transcript.trim());
      };

      this.recognition.onend = () => {
        transcribeBtn.classList.remove("listening");
        if (transcript.trim()) {
          document
            .getElementById("downloadTranscriptBtn")
            .classList.remove("hidden");
          document.getElementById("copyBtn").classList.remove("hidden");
          this.updateStatus(
            "✅ Transcript ready in popup! Edit & Ctrl+S to download",
            "status-ready"
          );
        }
      };

      this.recognition.onerror = (event) => {
        transcribeBtn.classList.remove("listening");
        this.updateStatus("❌ Speech recognition failed", "bg-red-600");
      };

      // PLAY AUDIO & TRANSCRIBE
      const audioUrl = URL.createObjectURL(this.audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      this.recognition.start();
      audio.onended = () => this.recognition.stop();
    } catch (err) {
      this.updateStatus(
        "❌ Browser speech recognition not available (use Chrome/Edge)",
        "bg-red-600"
      );
    }
  }

  copyTranscript() {
    const transcript = this.editor.getValue();
    navigator.clipboard.writeText(transcript).then(() => {
      this.updateStatus("📋 Copied to clipboard!", "bg-green-600");
    });
  }

  downloadTranscript() {
    const transcript = this.editor.getValue();
    const txtBlob = new Blob([transcript], { type: "text/plain" });
    const txtUrl = URL.createObjectURL(txtBlob);
    const a = document.createElement("a");
    a.href = txtUrl;
    a.download = `salesforce-service-cloud-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(txtUrl);
    this.updateStatus("💾 Transcript downloaded!", "bg-green-600");
  }

  initializeSplitter() {
    const splitter = document.getElementById("splitter");
    const leftPane = document.getElementById("leftPane");
    const rightPane = document.getElementById("recorderPane");
    let isResizing = false;

    splitter.addEventListener("mousedown", (e) => {
      isResizing = true;
      document.body.style.userSelect = "none";
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      const containerRect = document
        .querySelector(".flex")
        .getBoundingClientRect();
      let newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;
      newLeftWidth = Math.max(20, Math.min(80, newLeftWidth));
      leftPane.style.width = newLeftWidth + "%";
      rightPane.style.width = 100 - newLeftWidth + "%";
    });

    document.addEventListener("mouseup", () => {
      isResizing = false;
      document.body.style.userSelect = "";
    });
  }

  async requestPermissionsAndLoadDevices() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      await this.initializeDevices();
    } catch (err) {
      this.updateStatus(
        "🔒 Please allow microphone & camera access",
        "bg-yellow-600"
      );
      this.initializeDevices();
    }
  }

  async initializeDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((d) => d.kind === "audioinput");
    const cameras = devices.filter((d) => d.kind === "videoinput");
    this.populateSelect("#micSelect", mics);
    this.populateSelect("#cameraSelect", cameras);
  }

  populateSelect(selectId, devices) {
    const select = document.querySelector(selectId);
    if (!select || devices.length === 0) return;
    const options = devices.map((d) => {
      const label = d.label || `Device ${d.deviceId.slice(-4)}`;
      return `<option value="${d.deviceId}">${label}</option>`;
    });
    select.innerHTML =
      '<option value="">Select device</option>' + options.join("");
  }

  initializeEventListeners() {
    document.getElementById("markdownFile").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          document.getElementById("markdownContent").innerHTML = marked.parse(
            e.target.result
          );
          this.updateScrollIndicator();
        };
        reader.readAsText(file);
      }
    });

    document
      .getElementById("startBtn")
      .addEventListener("click", () => this.startRecording());
    document
      .getElementById("stopBtn")
      .addEventListener("click", () => this.stopRecording());
    document
      .getElementById("downloadBtn")
      .addEventListener("click", () => this.downloadVideo());
    document
      .getElementById("transcribeBtn")
      .addEventListener("click", () => this.generateTranscript());
    document
      .getElementById("downloadTranscriptBtn")
      .addEventListener("click", () => this.downloadTranscript());
    document
      .getElementById("copyBtn")
      .addEventListener("click", () => this.copyTranscript());
    document
      .getElementById("refreshDevices")
      .addEventListener("click", () => this.requestPermissionsAndLoadDevices());
    document
      .getElementById("closePopup")
      .addEventListener("click", () => this.closeMonacoPopup());
    document
      .getElementById("popupBackdrop")
      .addEventListener("click", () => this.closeMonacoPopup());

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "r":
            e.preventDefault();
            document.getElementById("startBtn").classList.contains("hidden")
              ? this.stopRecording()
              : this.startRecording();
            break;
          case "s":
            e.preventDefault();
            document
              .getElementById(
                this.audioBlob ? "downloadTranscriptBtn" : "downloadBtn"
              )
              .click();
            break;
          case "t":
            e.preventDefault();
            this.generateTranscript();
            break;
          case "c":
            e.preventDefault();
            if (this.audioBlob) this.copyTranscript();
            break;
        }
      }
      if (e.key === "Escape") this.closeMonacoPopup();
    });

    document
      .getElementById("markdownContent")
      .addEventListener("scroll", () => this.updateScrollIndicator());
  }

  updateScrollIndicator() {
    const content = document.getElementById("markdownContent");
    const scrollPercent =
      (content.scrollTop / (content.scrollHeight - content.clientHeight)) * 100;
    document.getElementById("scrollIndicator").style.width =
      scrollPercent + "%";
  }

  async startRecording() {
    try {
      const micId = document.getElementById("micSelect").value;
      const cameraId = document.getElementById("cameraSelect").value;
      if (!micId || !cameraId) {
        this.updateStatus("⚠️ Select microphone AND camera", "bg-red-600");
        return;
      }

      const videoConstraints = {
        audio: { deviceId: { exact: micId } },
        video: {
          deviceId: { exact: cameraId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      };
      const videoStream = await navigator.mediaDevices.getUserMedia(
        videoConstraints
      );
      this.mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const audioConstraints = { audio: { deviceId: { exact: micId } } };
      const audioStream = await navigator.mediaDevices.getUserMedia(
        audioConstraints
      );
      this.audioRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.chunks = [];
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
      this.audioRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
      this.mediaRecorder.onstop = () => this.onRecordingStopped();

      document.getElementById("videoPreview").srcObject = videoStream;
      document.getElementById("startBtn").classList.add("hidden");
      document.getElementById("stopBtn").classList.remove("hidden");
      document.getElementById("downloadBtn").classList.add("hidden");
      document.getElementById("transcribeBtn").classList.remove("hidden");

      this.updateStatus(
        "🎬 Recording Service Cloud pitch... (Ctrl+R to stop)",
        "status-recording"
      );
      this.mediaRecorder.start(1000);
      this.audioRecorder.start(1000);
      this.startAutoScroll();
      document.body.classList.add("recording");
    } catch (err) {
      this.updateStatus(`❌ ${err.message}`, "bg-red-600");
    }
  }

  stopRecording() {
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
      this.audioRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.audioRecorder.stream.getTracks().forEach((track) => track.stop());
      document.getElementById("videoPreview").srcObject = null;
      document.body.classList.remove("recording");
      this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
    }
  }

  onRecordingStopped() {
    this.recordedBlob = new Blob(this.chunks, { type: "video/webm" });
    document.getElementById("stopBtn").classList.add("hidden");
    document.getElementById("downloadBtn").classList.remove("hidden");
    this.updateStatus(
      "✅ Complete! Ctrl+T to open Monaco popup",
      "status-ready"
    );
    this.stopAutoScroll();
  }

  downloadVideo() {
    if (this.recordedBlob) {
      const url = URL.createObjectURL(this.recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `service-cloud-pitch-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "")}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.updateStatus("💾 Video downloaded!", "bg-green-600");
    }
  }

  updateStatus(message, className) {
    const status = document.getElementById("status");
    status.textContent = message;
    status.className = `p-4 rounded-lg text-white font-semibold ${className}`;
    status.classList.remove("hidden");
    setTimeout(() => status.classList.add("hidden"), 5000);
  }

  startAutoScroll() {
    const content = document.getElementById("markdownContent");
    if (!content) return;
    this.scrollInterval = setInterval(() => {
      content.scrollTop += 2;
      this.updateScrollIndicator();
      if (
        content.scrollTop >=
        content.scrollHeight - content.clientHeight - 50
      ) {
        this.stopAutoScroll();
      }
    }, 200);
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
  }
}

const recorder = new SpeechRecorder();
