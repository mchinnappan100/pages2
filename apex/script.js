const BACKEND_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const generateDocsButton = document.getElementById('generateDocs');
  const generateTestButton = document.getElementById('generateTest');
  const copyButton = document.getElementById('copyButton');
  const spinner = document.getElementById('spinner');
  const urlModeRadio = document.getElementById('urlMode');
  const pasteModeRadio = document.getElementById('pasteMode');
  const urlInputSection = document.getElementById('urlInput');
  const pasteInputSection = document.getElementById('pasteInput');
  const urlInputField = document.getElementById('urlInputField');
  const fetchButton = document.getElementById('fetchButton');
  const apexCodeInput = document.getElementById('apexCodeInput');
  const processPastedCodeButton = document.getElementById('processPastedCode');
  const outputSection = document.getElementById('result');
  const output = document.getElementById('output');

  let apexCode = null;
  let inputMode = 'url'; // Default mode

  // Regex pattern to detect Apex code
  const apexPattern = /(public\s+class|private\s+class|private\s+with\s+sharing\s+class|public\s+with\s+sharing\s+class|@isTest|System\.|__c)/;

  // Enable/disable the "Process Pasted Code" button based on input content
  apexCodeInput.addEventListener('input', () => {
    const code = apexCodeInput.value.trim();
    processPastedCodeButton.disabled = !code;
  });

  // Toggle between URL and Paste modes
  urlModeRadio.addEventListener('change', () => {
    inputMode = 'url';
    urlInputSection.classList.remove('hidden');
    pasteInputSection.classList.add('hidden');
    apexCode = null;
    generateDocsButton.disabled = true;
    generateTestButton.disabled = true;
    output.value = '';
    outputSection.classList.add('hidden');
    statusDiv.textContent = '';
  });

  pasteModeRadio.addEventListener('change', () => {
    inputMode = 'paste';
    urlInputSection.classList.add('hidden');
    pasteInputSection.classList.remove('hidden');
    apexCode = null;
    generateDocsButton.disabled = true;
    generateTestButton.disabled = true;
    output.value = '';
    outputSection.classList.add('hidden');
    statusDiv.textContent = 'Paste your Apex code and click "Process Pasted Code".';
  });

  // Fetch Apex code from URL
  fetchButton.addEventListener('click', async () => {
    const url = urlInputField.value.trim();
    if (!url) {
      statusDiv.textContent = 'Please enter a valid URL.';
      return;
    }

    const isGitHubRaw = (
      url.match(/^https:\/\/raw\.github(?:hub)?\.[^/]+\.com\//) ||
      url.startsWith('https://raw.githubusercontent.com/')
    ) && url.endsWith('.cls');

    if (!isGitHubRaw) {
      statusDiv.textContent = 'Not a raw GitHub Apex file (.cls). Please enter a URL like https://raw.githubusercontent.com/.../file.cls or https://raw.github.projectname.com/.../file.cls';
      return;
    }

    statusDiv.textContent = 'Fetching Apex code...';
    spinner.classList.remove('hidden');
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch Apex code: ${response.statusText}`);
      }
      apexCode = await response.text();
      statusDiv.textContent = 'Apex class detected. Ready to generate.';
      generateDocsButton.disabled = false;
      generateTestButton.disabled = false;
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
      apexCode = null;
      generateDocsButton.disabled = true;
      generateTestButton.disabled = true;
    } finally {
      spinner.classList.add('hidden');
    }
  });

  // Process pasted code
  processPastedCodeButton.addEventListener('click', () => {
    const code = apexCodeInput.value.trim();
    if (code) {
      if (apexPattern.test(code)) {
        apexCode = code;
        statusDiv.textContent = 'Apex code detected. Ready to generate.';
        generateDocsButton.disabled = false;
        generateTestButton.disabled = false;
      } else {
        statusDiv.textContent = 'The pasted code does not appear to be Apex code. Please ensure it contains Apex-specific syntax (e.g., "public class", "@isTest", "System.", or "__c").';
        apexCode = null;
        generateDocsButton.disabled = true;
        generateTestButton.disabled = true;
      }
    }
  });

  // Call backend to generate inline documentation
  async function generateInlineDocumentation(code) {
    try {
      const response = await fetch(`${BACKEND_URL}/generate-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.result;
    } catch (error) {
      throw new Error(`Failed to generate documentation: ${error.message}`);
    }
  }

  // Call backend to generate test class
  async function generateTestClass(code) {
    try {
      const response = await fetch(`${BACKEND_URL}/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.result;
    } catch (error) {
      throw new Error(`Failed to generate test class: ${error.message}`);
    }
  }

  // Handle button clicks
  generateDocsButton.addEventListener('click', async () => {
    if (apexCode) {
      statusDiv.textContent = 'Generating inline documentation...';
      generateDocsButton.disabled = true;
      generateTestButton.disabled = true;
      spinner.classList.remove('hidden');
      try {
        const result = await generateInlineDocumentation(apexCode);
        output.value = result;
        outputSection.classList.remove('hidden');
        statusDiv.textContent = 'Inline documentation generated.';
      } catch (error) {
        statusDiv.textContent = error.message;
        output.value = '';
        outputSection.classList.add('hidden');
      } finally {
        generateDocsButton.disabled = false;
        generateTestButton.disabled = false;
        spinner.classList.add('hidden');
      }
    }
  });

  generateTestButton.addEventListener('click', async () => {
    if (apexCode) {
      statusDiv.textContent = 'Generating test class...';
      generateDocsButton.disabled = true;
      generateTestButton.disabled = true;
      spinner.classList.remove('hidden');
      try {
        const result = await generateTestClass(apexCode);
        output.value = result;
        outputSection.classList.remove('hidden');
        statusDiv.textContent = 'Test class generated.';
      } catch (error) {
        statusDiv.textContent = error.message;
        output.value = '';
        outputSection.classList.add('hidden');
      } finally {
        generateDocsButton.disabled = false;
        generateTestButton.disabled = false;
        spinner.classList.add('hidden');
      }
    }
  });

  // Copy to clipboard
  copyButton.addEventListener('click', () => {
    const text = output.value;
    navigator.clipboard.writeText(text).then(() => {
      statusDiv.textContent = 'Copied to clipboard!';
    }).catch(err => {
      statusDiv.textContent = 'Failed to copy to clipboard.';
      console.error('Clipboard error:', err);
    });
  });
});