# Spreadsheet Application

This project is a simple spreadsheet application built using HTML, CSS, and JavaScript. It allows users to create, save, load, and export spreadsheets, providing a user-friendly interface for managing data.

## Features

- Create a new spreadsheet
- Save the current spreadsheet to a JSON file
- Load a spreadsheet from a JSON file
- Export the spreadsheet data to a CSV file
- Basic formatting options (bold, italic, underline, text color, background color)
- Cell editing and formula support
- Context menu for cell operations (cut, copy, paste, delete, insert row/column)

## Getting Started

To run the spreadsheet application, follow these steps:

1. Clone the repository or download the project files.
2. Open `sheet.html` in a web browser.
3. Use the toolbar buttons to create a new spreadsheet, save your work, or load existing spreadsheets.

## Uploading XLSX Files

To add functionality for uploading XLSX files, you will need to implement a file input element in `sheet.html` and utilize a library like `xlsx` to read the contents of the uploaded file. This will allow users to import data from Excel files directly into the spreadsheet application.

## Dependencies

- The application uses the `xlsx` library for reading XLSX files. Make sure to include it in your project to enable this functionality.

## License

This project is open-source and available for modification and distribution. Please feel free to contribute or suggest improvements.