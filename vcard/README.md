# Visiting Card Scanner App

## Overview
This app captures a visiting card or QR code image via the camera or by uploading an image, processes it to extract address data in JSON format, stores the data in localStorage, and displays it in a DataTable with sorting, searching, pagination, and CSV export functionality.

### Features
- Select from available Ollama models running locally.
- Extracted address data includes a "Phone" field.
- Supports scanning QR codes via camera or uploaded image:
  - Directly parses QR code data if in vCard or JSON format.
  - If QR code data isn't structured, sends the decoded text to the LLM to extract address data.
  - Falls back to LLM image processing if no QR code is detected.
- Displays the scanned image after capture or upload.
- Shows the raw JSON payload from the QR code or LLM with syntax highlighting and a copy button.
- Handles multiple addresses in a single image or QR code as an array.
- DataTable actions (Edit, Delete) are presented in a dropdown menu.
- Edit records via a modal form.
- Delete records with confirmation in the status message.
- Spinner during LLM processing with time taken displayed in the success message.
- Help section accessible via the navbar, explaining how to run Ollama models locally.
- Option to upload an image containing a QR code or visiting card.

## Prerequisites
1. **Ollama**: Install Ollama on your machine and pull at least one vision-capable model (e.g., `llava` or `bakllava`):