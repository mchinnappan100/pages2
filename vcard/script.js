// Camera Setup
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const uploadImageInput = document.getElementById('upload-image');
const statusDiv = document.getElementById('status');
const statusText = document.getElementById('status-text');
const spinner = document.getElementById('spinner');
const scannedImageDiv = document.getElementById('scanned-image');
const modelSelect = document.getElementById('model-select');
const jsonCode = document.getElementById('json-code');
const copyBtn = document.getElementById('copy-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const helpLink = document.getElementById('help-link');
const helpModal = document.getElementById('help-modal');
const closeHelpBtn = document.getElementById('close-help-btn');

// Initialize DataTable
let table = $('#address-table').DataTable({
    dom: 'Bfrtip',
    buttons: [
        {
            extend: 'csv',
            text: 'Export to CSV',
            className: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        }
    ],
    pageLength: 5,
    lengthMenu: [5, 10, 25, 50],
    searching: true,
    ordering: true,
    columns: [
        { data: 'name' },
        { data: 'address' },
        { data: 'city' },
        { data: 'state' },
        { data: 'zip' },
        { data: 'country' },
        { data: 'phone' },
        {
            data: null,
            orderable: false,
            searchable: false,
            render: (data, type, row, meta) => {
                return `
                    <div class="action-dropdown">
                        <button class="action-btn" data-index="${meta.row}">Actions ▼</button>
                        <div class="dropdown-menu" data-index="${meta.row}">
                            <div class="dropdown-item edit">Edit</div>
                            <div class="dropdown-item delete">Delete</div>
                        </div>
                    </div>
                `;
            }
        }
    ]
});

// Load addresses from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    table.clear().rows.add(addresses).draw();

    // Fetch available Ollama models
    fetchOllamaModels();

    // Highlight syntax in help modal (Prism.js)
    Prism.highlightAll();
});

// Fetch available Ollama models
async function fetchOllamaModels() {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        const models = data.models || [];

        modelSelect.innerHTML = models.map(model => 
            `<option value="${model.name}">${model.name}</option>`
        ).join('');

        if (models.length === 0) {
            modelSelect.innerHTML = '<option value="" disabled>No models available</option>';
        }
    } catch (error) {
        statusText.innerHTML = `<p class="text-red-500">Error fetching models: ${error.message}</p>`;
        modelSelect.innerHTML = '<option value="" disabled>Error loading models</option>';
    }
}

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        statusText.innerHTML = `<p class="text-red-500">Error accessing camera: ${err.message}</p>`;
    });

// Open help modal
helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    helpModal.classList.remove('hidden');
});

// Close help modal
closeHelpBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

// Close all dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach(dropdown => {
        if (!dropdown.parentElement.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
});

// Handle dropdown button clicks
$('#address-table').on('click', '.action-btn', function (e) {
    e.stopPropagation(); // Prevent closing immediately
    const dropdownMenu = this.nextElementSibling;
    const isOpen = dropdownMenu.classList.contains('show');

    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });

    // Toggle the clicked dropdown
    if (!isOpen) {
        dropdownMenu.classList.add('show');
    }
});

// Handle dropdown item clicks
$('#address-table').on('click', '.dropdown-item', function (e) {
    e.stopPropagation();
    const rowIndex = $(this).parent().data('index');
    const action = $(this).hasClass('edit') ? 'edit' : 'delete';

    // Close the dropdown
    $(this).parent().removeClass('show');

    if (action === 'edit') {
        const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        const address = addresses[rowIndex];

        // Populate the form with the current address data
        document.getElementById('edit-name').value = address.name || '';
        document.getElementById('edit-address').value = address.address || '';
        document.getElementById('edit-city').value = address.city || '';
        document.getElementById('edit-state').value = address.state || '';
        document.getElementById('edit-zip').value = address.zip || '';
        document.getElementById('edit-country').value = address.country || '';
        document.getElementById('edit-phone').value = address.phone || '';

        // Show the modal
        editModal.classList.remove('hidden');

        // Store the row index in the form for later use
        editForm.dataset.rowIndex = rowIndex;
    } else if (action === 'delete') {
        let addresses = JSON.parse(localStorage.getItem('addresses')) || [];

        // Remove the address at the specified index
        addresses.splice(rowIndex, 1);

        // Update localStorage
        localStorage.setItem('addresses', JSON.stringify(addresses));

        // Update DataTable
        table.clear().rows.add(addresses).draw();

        // Show confirmation
        statusText.innerHTML = '<p class="text-green-500">Address deleted successfully!</p>';
    }
});

// Handle form submission for editing
editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const rowIndex = parseInt(editForm.dataset.rowIndex);
    let addresses = JSON.parse(localStorage.getItem('addresses')) || [];

    // Update the address with the new values
    addresses[rowIndex] = {
        name: document.getElementById('edit-name').value,
        address: document.getElementById('edit-address').value,
        city: document.getElementById('edit-city').value,
        state: document.getElementById('edit-state').value,
        zip: document.getElementById('edit-zip').value,
        country: document.getElementById('edit-country').value,
        phone: document.getElementById('edit-phone').value
    };

    // Update localStorage
    localStorage.setItem('addresses', JSON.stringify(addresses));

    // Update DataTable
    table.clear().rows.add(addresses).draw();

    // Close the modal
    editModal.classList.add('hidden');

    // Show confirmation
    statusText.innerHTML = '<p class="text-green-500">Address updated successfully!</p>';
});

// Handle Cancel button in the edit modal
cancelEditBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

// Function to parse QR code data into address format
function parseQRCodeData(qrData) {
    try {
        // Check if the QR code contains a vCard
        if (qrData.startsWith('BEGIN:VCARD')) {
            const lines = qrData.split('\n');
            const addressData = {
                name: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                phone: ''
            };

            lines.forEach(line => {
                if (line.startsWith('FN:')) {
                    addressData.name = line.replace('FN:', '').trim();
                } else if (line.startsWith('ADR;')) {
                    const parts = line.replace('ADR;', '').split(';');
                    // vCard ADR format: type;street;city;state;zip;country
                    addressData.address = parts[2] || '';
                    addressData.city = parts[3] || '';
                    addressData.state = parts[4] || '';
                    addressData.zip = parts[5] || '';
                    addressData.country = parts[6] || '';
                } else if (line.startsWith('TEL;')) {
                    addressData.phone = line.replace(/TEL;.*?:/, '').trim();
                }
            });

            // Validate required fields
            if (addressData.name && addressData.address) {
                return { addresses: [addressData], raw: qrData };
            }
        }

        // Check if the QR code contains JSON
        try {
            const jsonData = JSON.parse(qrData);
            if (Array.isArray(jsonData)) {
                const validAddresses = jsonData.filter(item => item.name && item.address);
                if (validAddresses.length > 0) {
                    return { addresses: validAddresses, raw: qrData };
                }
            } else if (jsonData.name && jsonData.address) {
                return { addresses: [jsonData], raw: qrData };
            }
        } catch (jsonError) {
            // Not JSON, continue
        }

        // If no valid address data is found directly, return the raw data for LLM processing
        return { addresses: null, raw: qrData };
    } catch (error) {
        return { addresses: null, raw: qrData };
    }
}

// Function to process data with LLM (for QR code text or image)
async function processWithLLM(selectedModel, prompt, imageBase64Data = null) {
    try {
        const startTime = performance.now();

        const body = {
            model: selectedModel,
            prompt: prompt,
            stream: false
        };

        if (imageBase64Data) {
            body.images = [imageBase64Data];
        }

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const endTime = performance.now();
        const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

        const result = await response.json();

        // Extract JSON from the response (remove Markdown code block)
        const jsonMatch = result.response.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error('Could not extract JSON from response');
        }

        const addressDataArray = JSON.parse(jsonMatch[1]);

        if (!Array.isArray(addressDataArray)) {
            throw new Error('Expected an array of addresses');
        }

        return { addresses: addressDataArray, raw: result.response, duration: durationSeconds };
    } catch (error) {
        throw error;
    }
}

// Function to process image (used for both camera capture and upload)
async function processImage(imageBase64, imageBase64Data) {
    // Display the scanned image
    scannedImageDiv.innerHTML = `<img src="${imageBase64}" alt="Scanned Visiting Card or QR Code" />`;

    // Validate model selection
    const selectedModel = modelSelect.value;
    if (!selectedModel) {
        statusText.innerHTML = '<p class="text-red-500">Please select a model.</p>';
        return;
    }

    let addressDataArray = [];
    let rawPayload = '';
    let extractionMethod = '';

    try {
        // Step 1: Try to scan for a QR code
        statusText.innerHTML = '<p class="text-blue-500">Scanning for QR code...</p>';

        // Create an image element to load the base64 data for QR code scanning
        const img = new Image();
        img.src = imageBase64;
        await new Promise(resolve => {
            img.onload = resolve;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode && qrCode.data) {
            statusText.innerHTML = '<p class="text-blue-500">QR code detected. Processing data...</p>';
            const qrResult = parseQRCodeData(qrCode.data);

            if (qrResult.addresses) {
                // Directly parsed from QR code (vCard or JSON)
                addressDataArray = qrResult.addresses;
                rawPayload = qrResult.raw;
                extractionMethod = 'QR code (direct)';
            } else {
                // Send QR code text to LLM
                statusText.innerHTML = '<p class="text-blue-500">QR code data not structured. Processing with LLM...</p>';
                spinner.classList.remove('hidden');

                const prompt = `Extract address information from the following QR code text and return it as a JSON array of objects. Each object should have the fields: name, address, city, state, zip, country, phone. If there is only one address, return it as a single-item array. QR code text: "${qrResult.raw}"`;
                const llmResult = await processWithLLM(selectedModel, prompt);

                addressDataArray = llmResult.addresses;
                rawPayload = llmResult.raw;
                extractionMethod = `QR code via LLM (Time taken: ${llmResult.duration} seconds)`;

                spinner.classList.add('hidden');
            }
        } else {
            // Step 2: No QR code detected, process image with LLM
            statusText.innerHTML = '<p class="text-blue-500">No QR code found. Processing image with LLM...</p>';
            spinner.classList.remove('hidden');

            const prompt = 'Extract all address information from this visiting card image and return it as a JSON array of objects. Each object should have the fields: name, address, city, state, zip, country, phone. If there is only one address, return it as a single-item array.';
            const llmResult = await processWithLLM(selectedModel, prompt, imageBase64Data);

            addressDataArray = llmResult.addresses;
            rawPayload = llmResult.raw;
            extractionMethod = `image via LLM (Time taken: ${llmResult.duration} seconds)`;

            spinner.classList.add('hidden');
        }

        // Display the raw payload with syntax highlighting
        jsonCode.textContent = rawPayload;
        Prism.highlightElement(jsonCode);
        copyBtn.classList.remove('hidden');

        // Validate and store each address in localStorage
        const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        let validAddresses = 0;

        addressDataArray.forEach(addressData => {
            if (addressData && addressData.name && addressData.address) {
                addresses.push(addressData);
                validAddresses++;
            }
        });

        if (validAddresses === 0) {
            throw new Error('No valid addresses found in the data');
        }

        localStorage.setItem('addresses', JSON.stringify(addresses));

        // Update DataTable
        table.clear().rows.add(addresses).draw();

        // Show success message with extraction method
        statusText.innerHTML = `<p class="text-green-500">${validAddresses} address${validAddresses > 1 ? 'es' : ''} extracted and saved successfully via ${extractionMethod}!</p>`;
    } catch (error) {
        spinner.classList.add('hidden');
        statusText.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
    }
}

// Capture image and process (camera)
captureBtn.addEventListener('click', async () => {
    statusText.innerHTML = '<p class="text-blue-500">Capturing...</p>';

    // Draw the video frame to the canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageBase64 = canvas.toDataURL('image/jpeg');
    const imageBase64Data = imageBase64.split(',')[1];

    // Process the image
    await processImage(imageBase64, imageBase64Data);
});

// Handle image upload
uploadImageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerHTML = '<p class="text-blue-500">Uploading image...</p>';

    const reader = new FileReader();
    reader.onload = async () => {
        const imageBase64 = reader.result;
        const imageBase64Data = imageBase64.split(',')[1];
        await processImage(imageBase64, imageBase64Data);
    };
    reader.readAsDataURL(file);
});

// Copy JSON payload to clipboard
copyBtn.addEventListener('click', () => {
    const textToCopy = jsonCode.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        statusText.innerHTML = `<p class="text-red-500">Error copying: ${err.message}</p>`;
    });
});