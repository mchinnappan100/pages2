from flask import Flask, request, send_file
from flask_cors import CORS
from gtts import gTTS
import ffmpeg
import os
import tempfile
import base64
from PIL import Image

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend communication

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        slides = data['slides']  # List of slide texts
        audio_files = []

        for i, text in enumerate(slides):
            if text.strip():  # Only generate audio for non-empty slides
                tts = gTTS(text=text, lang='en')
                audio_file = os.path.join(tempfile.gettempdir(), f"slide_{i}.mp3")
                tts.save(audio_file)
                audio_files.append(audio_file)
            else:
                audio_files.append(None)  # Placeholder for empty slides

        return {'audio_files': audio_files}
    except Exception as e:
        print(f"Error generating audio: {e}")
        return {'error': str(e)}, 500


@app.route('/generate_video', methods=['POST'])
def generate_video():
    data = request.json
    slide_images = data['images']  # Base64 images
    audio_files = data['audio_files']  # List of audio file paths
    slide_duration = data.get('slide_duration', 5)  # Default 5 seconds per slide
    background_music = data.get('background_music')  # Path to background MP3 (optional)
    output_file = os.path.join(tempfile.gettempdir(), 'output.webm')

    # Create temporary files for images and preprocess to ensure full opacity
    temp_images = []
    for i, img_data in enumerate(slide_images):
        img_path = os.path.join(tempfile.gettempdir(), f"slide_img_{i}.png")
        try:
            # Decode base64 and save as temporary PNG
            with open(img_path, 'wb') as f:
                f.write(base64.b64decode(img_data.split(',')[1]))

            # Open image with Pillow and ensure full opacity
            with Image.open(img_path) as img:
                if img.mode == 'RGBA':
                    new_img = Image.new('RGBA', img.size)
                    new_img.paste(img, mask=img.split()[3])
                    new_img = new_img.convert('RGB')
                    new_img.save(img_path)
                elif img.mode == 'P' or img.mode == 'LA':
                    img = img.convert('RGB')
                    img.save(img_path)

            temp_images.append(img_path)
        except Exception as e:
            print(f"Error processing image {i}: {e}")
            return {'error': f"Failed to process image {i}"}, 500

    try:
        # Calculate total duration for background music looping
        durations = []
        for audio_path in audio_files:
            if audio_path and os.path.exists(audio_path):
                try:
                    probe = ffmpeg.probe(audio_path)
                    durations.append(float(probe['streams'][0]['duration']))
                except ffmpeg.Error:
                    durations.append(slide_duration)
            else:
                durations.append(slide_duration)
        total_duration = sum(durations)

        # Create FFmpeg input streams for each slide
        inputs = []
        for i, (img_path, audio_path) in enumerate(zip(temp_images, audio_files)):
            if audio_path and os.path.exists(audio_path):
                try:
                    probe = ffmpeg.probe(audio_path)
                    audio_duration = float(probe['streams'][0]['duration'])
                    inputs.append(
                        ffmpeg.input(img_path, loop=1, t=audio_duration)
                        .filter('format', 'rgb24')
                        .filter('scale', 1920, 1080, force_original_aspect_ratio='decrease')
                        .filter('pad', 1920, 1080, '(ow-iw)/2', '(oh-ih)/2')
                    )
                    inputs.append(ffmpeg.input(audio_path))
                except ffmpeg.Error:
                    inputs.append(
                        ffmpeg.input(img_path, loop=1, t=slide_duration)
                        .filter('format', 'rgb24')
                        .filter('scale', 1920, 1080, force_original_aspect_ratio='decrease')
                        .filter('pad', 1920, 1080, '(ow-iw)/2', '(oh-ih)/2')
                    )
                    inputs.append(None)
            else:
                inputs.append(
                    ffmpeg.input(img_path, loop=1, t=slide_duration)
                    .filter('format', 'rgb24')
                    .filter('scale', 1920, 1080, force_original_aspect_ratio='decrease')
                    .filter('pad', 1920, 1080, '(ow-iw)/2', '(oh-ih)/2')
                )
                inputs.append(None)

        # Prepare concatenation
        video_streams = []
        audio_streams = []
        for i in range(0, len(inputs), 2):
            video_streams.append(inputs[i])
            if inputs[i + 1] is not None:
                audio_streams.append(inputs[i + 1]['a:0'])
            else:
                audio_streams.append(
                    ffmpeg.input('anullsrc=channel_layout=mono:sample_rate=24000', f='lavfi', t=durations[i // 2])['a:0']
                )

        # Concatenate video and audio streams
        concat_video = ffmpeg.concat(*video_streams, v=1, a=0, n=len(video_streams))
        concat_audio = ffmpeg.concat(*audio_streams, v=0, a=1, n=len(audio_streams))

        # Add background music if provided
        if background_music and os.path.exists(background_music):
            # Loop background music to match total duration
            bg_audio = (
                ffmpeg.input(background_music, stream_loop=-1, t=total_duration)
                .filter('volume', 0.2)  # Reduce background volume to 20%
            )
            # Mix background music with concatenated audio
            final_audio = ffmpeg.filter([concat_audio, bg_audio], 'amix', inputs=2, duration='longest')
        else:
            final_audio = concat_audio

        # Output video with libvpx and libvorbis
        stream = ffmpeg.output(
            concat_video, final_audio, output_file,
            format='webm',
            **{
                'c:v': 'libvpx',
                'c:a': 'libvorbis',
                'b:v': '1M',
                'crf': 23,
                'auto-alt-ref': 0
            }
        )
        print(f"FFmpeg command: {ffmpeg.compile(stream)}")
        ffmpeg.run(stream, overwrite_output=True, quiet=True)

        # Send file back to client
        return send_file(output_file, mimetype='video/webm', as_attachment=True, download_name='slides_video.webm')
    except ffmpeg.Error as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        return {'error': 'Video generation failed'}, 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {'error': str(e)}, 500
    finally:
        # Clean up
        for img in temp_images:
            if os.path.exists(img):
                os.remove(img)
        for audio in audio_files:
            if audio and os.path.exists(audio):
                os.remove(audio)
        if os.path.exists(output_file):
            os.remove(output_file)


if __name__ == '__main__':
    app.run(port=5000)