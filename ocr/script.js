const BACKEND_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  const imageInput = document.getElementById('image-input');
  const previewContainer = document.getElementById('preview-container');
  const imagePreview = document.getElementById('image-preview');
  const output = document.getElementById('output');
  const processingTime = document.getElementById('processing-time');
  const extractBtn = document.getElementById('extract-btn');
  const spinner = document.getElementById('spinner');
  const clearBtn = document.getElementById('clear-btn');
  const statusDiv = document.getElementById('status');
  const resultSection = document.getElementById('result');
  const copyButton = document.getElementById('copyButton');

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      previewContainer.classList.remove('hidden');
      imagePreview.src = URL.createObjectURL(file);
      extractBtn.disabled = false;
      statusDiv.textContent = 'Image selected. Click "Extract Text" to process.';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    extractBtn.disabled = true;
    spinner.classList.remove('hidden');
    processingTime.classList.add('hidden');
    resultSection.classList.add('hidden');
    statusDiv.textContent = 'Processing image...';

    try {
      const startTime = performance.now();
      const response = await fetch(`${BACKEND_URL}/extract`, {
        method: 'POST',
        body: formData
      });
      const endTime = performance.now();
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      output.value = data.result;
      resultSection.classList.remove('hidden');
      statusDiv.textContent = 'Text extracted successfully.';
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      processingTime.textContent = `Processing time: ${timeTaken} seconds`;
      processingTime.classList.remove('hidden');
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
      output.value = '';
      resultSection.classList.add('hidden');
    } finally {
      extractBtn.disabled = false;
      spinner.classList.add('hidden');
    }
  });

  clearBtn.addEventListener('click', () => {
    form.reset();
    previewContainer.classList.add('hidden');
    output.value = '';
    resultSection.classList.add('hidden');
    processingTime.classList.add('hidden');
    extractBtn.disabled = true;
    statusDiv.textContent = 'Upload an image to extract text.';
  });

  copyButton.addEventListener('click', () => {
    const text = output.value;
    navigator.clipboard.writeText(text).then(() => {
      statusDiv.textContent = 'Copied to clipboard!';
    }).catch((err) => {
      statusDiv.textContent = 'Failed to copy to clipboard.';
      console.error('Clipboard error:', err);
    });
  });
});