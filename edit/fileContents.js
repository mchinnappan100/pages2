// Extracted fileContents for the editor
const fileContents = {
  'welcome.md': `# Welcome to Web Code Editor! 🚀

This is a fully-featured code editor built with Monaco Editor (the same engine that powers VS Code).

## Features

- 🎨 **Multiple Themes** - Switch between dark, light, and high contrast
- ⌨️ **Vim Mode** - Enable Vim keybindings for modal editing
- 📁 **File Management** - Create and switch between multiple files
- 🔍 **Command Palette** - Quick access to all commands (Ctrl+Shift+P)
- ✨ **Syntax Highlighting** - Support for 50+ languages
- 🎯 **IntelliSense** - Smart code completion
- 📝 **Auto-formatting** - Format your code with one command
- 💾 **Download Files** - Save your work to your computer

## Keyboard Shortcuts

- **Ctrl+N** - New file
- **Ctrl+S** - Download file
- **Ctrl+,** - Open settings
- **Ctrl+Shift+P** - Command palette
- **Ctrl+Shift+E** - Toggle explorer
- **Ctrl+Shift+V** - Toggle Vim mode
- **Shift+Alt+F** - Format document
- **Ctrl+/** - Toggle comment
- **Alt+↑/↓** - Move line up/down
- **Ctrl+D** - Add selection to next find match

## Try Vim Mode!

Click "Vim: OFF" in the status bar or press **Ctrl+Shift+V** to enable Vim keybindings.

## Download Your Files

Press **Ctrl+S** or use the command palette to download the current file to your computer.

Happy coding! 💻
`,

  'example.js': `// Example JavaScript File
console.log('Hello, World!');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);

// Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log('Doubled:', doubled);
console.log('Sum:', sum);

// Try enabling Vim mode from the status bar!
`,

  'styles.css': `/* Example CSS File */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.button {
  background: #667eea;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.button:hover {
  background: #5568d3;
}
`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to My Website</h1>
    <p>This is a sample HTML file with interactive elements.</p>
    <div class="card">
      <h2>Interactive Demo</h2>
      <button class="button" onclick="sayHello()">Click Me!</button>
      <p id="output"></p>
    </div>
  </div>
  <script src="example.js"></script>
  <script>
    function sayHello() {
      document.getElementById('output').textContent = 'Hello from the Web Code Editor!';
    }
  </script>
</body>
</html>
`,

  'config.json': `{
  "name": "web-code-editor",
  "version": "1.0.0",
  "description": "A VS Code-like editor for the web",
  "features": [
    "Monaco Editor",
    "Vim Mode",
    "Multiple Themes",
    "Syntax Highlighting",
    "IntelliSense",
    "File Download",
    "Command Palette",
    "Auto-save"
  ],
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "wordWrap": true,
    "minimap": true,
    "lineNumbers": true,
    "autoSave": false
  },
  "shortcuts": {
    "newFile": "Ctrl+N",
    "save": "Ctrl+S",
    "settings": "Ctrl+,",
    "commandPalette": "Ctrl+Shift+P"
  }
}
`,

  'script.py': `# Example Python File
def greet(name):
    """Greet someone by name."""
    return f"Hello, {name}!"

def fibonacci(n):
    """Calculate fibonacci number recursively."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def main():
    # Greet multiple people
    names = ["Alice", "Bob", "Charlie"]
    for name in names:
        print(greet(name))
    
    # Calculate fibonacci
    print(f"\\nFibonacci(10) = {fibonacci(10)}")
    
    # List comprehension example
    squares = [x**2 for x in range(1, 11)]
    print(f"Squares: {squares}")

if __name__ == "__main__":
    main()

# Try Vim mode: press 'i' to insert, 'Esc' for normal mode
`,

  'app.java': `// Example Java File
public class App {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Loop example
        for (int i = 1; i <= 10; i++) {
            System.out.println("Number: " + i);
        }
        
        // Method call
        String message = greet("Developer");
        System.out.println(message);
        
        // Fibonacci
        int fib = fibonacci(10);
        System.out.println("Fibonacci(10) = " + fib);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
`
};

// expose globally
window.fileContents = fileContents;
