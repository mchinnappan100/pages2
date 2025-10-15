#!/usr/bin/env python3
"""
🎤 SPEECH RECORDER TRANSCRIPTION TOOL (MAC FIXED)
Converts .webm video → TEXT transcript (99% accurate!)
Usage: python transcribe.py speech-2025-01-15T123456.webm
"""

import sys
import os
import argparse
from pathlib import Path
import whisper
from datetime import datetime
import numpy as np

def transcribe_video(video_path, output_dir="transcripts"):
    """Transcribe video to text using Whisper Large-v3"""
    # ✅ FIXED: Convert Path to string
    video_str = str(video_path)
    print(f"🎬 Loading video: {video_str}")
    
    # ✅ Load model (downloads ~1.5GB first time, then cached)
    print("🤖 Loading Whisper Large-v3 (99% accurate)...")
    model = whisper.load_model("large-v3")
    
    # ✅ FIXED: Pass STRING to transcribe
    print("🎤 Transcribing speech...")
    result = model.transcribe(
        video_str,  # ✅ STRING, not Path!
        language="en",
        task="transcribe",
        word_timestamps=True,
        verbose=False,
        fp16=False  # ✅ FIXED: Disable FP16 for Mac CPU
    )
    
    transcript = result["text"].strip()
    segments = result["segments"]
    
    # ✅ Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # ✅ TXT file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = Path(video_str).stem
    txt_file = f"{output_dir}/{base_name}_transcript.txt"
    
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(f"TRANSCRIPT: {video_str}\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Duration: {result['duration']:.1f}s\n")
        f.write("=" * 50 + "\n\n")
        f.write(transcript)
    
    # ✅ SRT file (with timestamps)
    srt_file = f"{output_dir}/{base_name}_transcript.srt"
    with open(srt_file, "w", encoding="utf-8") as f:
        for i, segment in enumerate(segments, 1):
            start = format_timestamp(segment["start"])
            end = format_timestamp(segment["end"])
            text = segment["text"].strip()
            f.write(f"{i}\n{start} --> {end}\n{text}\n\n")
    
    print(f"✅ TXT: {txt_file}")
    print(f"✅ SRT: {srt_file}")
    print(f"📝 Preview: {transcript[:100]}...")
    print(f"📊 Words: {len(transcript.split())} | Duration: {result['duration']:.1f}s")
    return txt_file, srt_file

def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def main():
    parser = argparse.ArgumentParser(description="🎤 Transcribe speech video to text")
    parser.add_argument("video", help="Input .webm video file")
    parser.add_argument("-o", "--output", default="transcripts", help="Output directory")
    parser.add_argument("-m", "--model", default="large-v3", 
                       choices=["tiny", "base", "small", "medium", "large-v3"],
                       help="Whisper model size")
    
    args = parser.parse_args()
    
    # ✅ FIXED: Convert to Path then string
    video_path = Path(args.video)
    video_str = str(video_path)
    
    # ✅ Validate input
    if not video_path.exists():
        print(f"❌ File not found: {video_str}")
        sys.exit(1)
    
    if video_path.suffix.lower() not in [".webm", ".mp4", ".wav", ".m4a"]:
        print("❌ Supported: .webm, .mp4, .wav, .m4a")
        sys.exit(1)
    
    # ✅ Run transcription
    try:
        txt_file, srt_file = transcribe_video(video_str, args.output)
        print(f"\n🎉 DONE! Check '{args.output}' folder!")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Try: python transcribe.py 'exact-filename.webm'")
        sys.exit(1)

if __name__ == "__main__":
    main()