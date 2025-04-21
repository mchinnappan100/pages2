document.addEventListener('DOMContentLoaded', () => {
    const addNewCardBtn = document.getElementById('add-new-card-btn');
    const cardModal = document.getElementById('card-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('visiting-card-form');
    const recordIdInput = document.getElementById('record-id');
    const nameInput = document.getElementById('name');
    const titleInput = document.getElementById('title');
    const companyInput = document.getElementById('company');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const addressInput = document.getElementById('address');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cardName = document.getElementById('card-name');
    const cardTitle = document.getElementById('card-title');
    const cardCompany = document.getElementById('card-company');
    const cardPhone = document.getElementById('card-phone');
    const cardEmail = document.getElementById('card-email');
    const cardAddress = document.getElementById('card-address');
    const qrCodeDiv = document.getElementById('qrcode');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const downloadQrBtn = document.getElementById('download-qr-btn');

    // Initialize QR code
    let qrCode = new QRCode(qrCodeDiv, {
        text: '',
        width: 128,
        height: 128,
        colorDark: '#1f2937',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Store the last saved card
    let lastSavedCard = null;

    // Initialize DataTable
    let table = $('#card-table').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 20],
        searching: true,
        ordering: true,
        columns: [
            { data: 'name', width: '15%' },
            { data: 'title', width: '15%' },
            { data: 'company', width: '15%' },
            { data: 'phone', width: '15%' },
            { data: 'email', width: '15%' },
            { data: 'address', width: '15%' },
            {
                data: null,
                orderable: false,
                searchable: false,
                width: '10%',
                render: (data, type, row, meta) => {
                    return `
                        <div class="action-dropdown">
                            <button class="action-btn" data-id="${row.id}">Actions</button>
                            <div class="dropdown-menu" id="dropdown-${row.id}">
                                <div class="dropdown-item edit" data-id="${row.id}">Edit</div>
                                <div class="dropdown-item delete" data-id="${row.id}">Delete</div>
                            </div>
                        </div>
                    `;
                }
            }
        ]
    });

    // Load data from localStorage
    function loadCardsFromStorage() {
        const cards = JSON.parse(localStorage.getItem('visitingCards')) || [];
        table.clear().rows.add(cards).draw();
    }

    // Save card to localStorage
    function saveCardToStorage(card) {
        const cards = JSON.parse(localStorage.getItem('visitingCards')) || [];
        if (card.id) {
            // Update existing card
            const index = cards.findIndex(c => c.id === card.id);
            if (index !== -1) {
                cards[index] = card;
            }
        } else {
            // Add new card
            card.id = Date.now().toString(); // Simple unique ID
            cards.push(card);
        }
        localStorage.setItem('visitingCards', JSON.stringify(cards));
        loadCardsFromStorage();
        // Update the last saved card
        lastSavedCard = { ...card };
    }

    // Delete card from localStorage
    function deleteCardFromStorage(id) {
        console.log('Deleting card with ID:', id);
        let cards = JSON.parse(localStorage.getItem('visitingCards')) || [];
        cards = cards.filter(card => card.id !== id);
        localStorage.setItem('visitingCards', JSON.stringify(cards));
        loadCardsFromStorage();
        // If the deleted card is the last saved card, clear the preview
        if (lastSavedCard && lastSavedCard.id === id) {
            lastSavedCard = null;
            updatePreviewAndQRCode();
        }
    }

    // Update visiting card and QR code dynamically
    function updatePreviewAndQRCode() {
        // Use form inputs if the modal is open, otherwise use lastSavedCard
        const isModalOpen = cardModal.classList.contains('show');
        const data = isModalOpen
            ? {
                  name: nameInput.value.trim(),
                  title: titleInput.value.trim(),
                  company: companyInput.value.trim(),
                  phone: phoneInput.value.trim(),
                  email: emailInput.value.trim(),
                  address: addressInput.value.trim()
              }
            : lastSavedCard || {
                  name: '',
                  title: '',
                  company: '',
                  phone: '',
                  email: '',
                  address: ''
              };

        // Update visiting card preview
        cardName.textContent = data.name || 'John Doe';
        cardTitle.textContent = data.title || 'Software Engineer';
        cardCompany.textContent = data.company || 'Tech Corp';
        cardPhone.textContent = `Phone: ${data.phone || '+1 234 567 890'}`;
        cardEmail.textContent = data.email ? `Email: ${data.email}` : 'Email: john.doe@techcorp.com';
        cardAddress.textContent = data.address ? `Address: ${data.address}` : 'Address: 123 Main St, Springfield, IL';

        // Hide empty fields
        cardTitle.style.display = data.title ? 'block' : 'none';
        cardCompany.style.display = data.company ? 'block' : 'none';
        cardEmail.style.display = data.email ? 'block' : 'none';
        cardAddress.style.display = data.address ? 'block' : 'none';

        // Generate vCard string for QR code
        const vCard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${data.name}`,
            data.title ? `TITLE:${data.title}` : '',
            data.company ? `ORG:${data.company}` : '',
            `TEL;TYPE=WORK:${data.phone}`,
            data.email ? `EMAIL:${data.email}` : '',
            data.address ? `ADR;TYPE=WORK:;;${data.address}` : '',
            'END:VCARD'
        ].filter(line => line).join('\n');

        // Update QR code
        qrCode.clear();
        qrCode.makeCode(vCard);
    }

    // Open modal for adding a new card
    addNewCardBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Card';
        form.reset();
        recordIdInput.value = '';
        cardModal.classList.remove('hidden');
        cardModal.classList.add('show');
        updatePreviewAndQRCode();
    });

    // Open modal for editing a card
    function openEditModal(card) {
        modalTitle.textContent = 'Edit Card';
        recordIdInput.value = card.id;
        nameInput.value = card.name || '';
        titleInput.value = card.title || '';
        companyInput.value = card.company || '';
        phoneInput.value = card.phone || '';
        emailInput.value = card.email || '';
        addressInput.value = card.address || '';
        cardModal.classList.remove('hidden');
        cardModal.classList.add('show');
        updatePreviewAndQRCode();
    }

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        cardModal.classList.remove('show');
        cardModal.classList.add('hidden');
        form.reset();
        recordIdInput.value = '';
        updatePreviewAndQRCode();
    });

    // Close modal when clicking outside the modal content
    cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) {
            cardModal.classList.remove('show');
            cardModal.classList.add('hidden');
            form.reset();
            recordIdInput.value = '';
            updatePreviewAndQRCode();
        }
    });

    // Add input event listeners for real-time updates
    [nameInput, titleInput, companyInput, phoneInput, emailInput, addressInput].forEach(input => {
        input.addEventListener('input', updatePreviewAndQRCode);
    });

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const card = {
            id: recordIdInput.value || '',
            name: nameInput.value.trim(),
            title: titleInput.value.trim(),
            company: companyInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            address: addressInput.value.trim()
        };

        saveCardToStorage(card);
        // Close the modal after saving
        cardModal.classList.remove('show');
        cardModal.classList.add('hidden');
        form.reset();
        recordIdInput.value = '';
        updatePreviewAndQRCode();
    });

    // Dropdown toggle handler (using vanilla JavaScript)
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Handle action button click
        if (target.classList.contains('action-btn')) {
            e.stopPropagation();
            const id = target.getAttribute('data-id');
            console.log('Action button clicked for ID:', id);
            const dropdownMenu = document.getElementById(`dropdown-${id}`);
            // Close other open dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            // Toggle the clicked dropdown
            dropdownMenu.classList.toggle('show');
        }

        // Handle edit action
        else if (target.classList.contains('edit')) {
            e.stopPropagation();
            const id = target.getAttribute('data-id');
            console.log('Edit clicked for ID:', id);
            const cards = JSON.parse(localStorage.getItem('visitingCards')) || [];
            const card = cards.find(c => c.id === id);
            if (card) {
                console.log('Found card:', card);
                openEditModal(card);
            } else {
                console.log('Card not found for ID:', id);
            }
            // Close the dropdown
            target.closest('.dropdown-menu').classList.remove('show');
        }

        // Handle delete action
        else if (target.classList.contains('delete')) {
            e.stopPropagation();
            const id = target.getAttribute('data-id');
            console.log('Delete clicked for ID:', id);
            if (confirm('Are you sure you want to delete this visiting card?')) {
                deleteCardFromStorage(id);
            }
            // Close the dropdown
            target.closest('.dropdown-menu').classList.remove('show');
        }

        // Close dropdown when clicking outside
        else if (!target.closest('.action-dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Download visiting card as image
    downloadCardBtn.addEventListener('click', () => {
        const cardElement = document.getElementById('visiting-card');
        html2canvas(cardElement, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'visiting-card.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    // Download QR code as image
    downloadQrBtn.addEventListener('click', () => {
        const qrCanvas = qrCodeDiv.querySelector('canvas');
        if (qrCanvas) {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = qrCanvas.toDataURL('image/png');
            link.click();
        } else {
            alert('Please generate a QR code first by saving a card.');
        }
    });

    // Initial load of cards
    loadCardsFromStorage();
    updatePreviewAndQRCode();
});