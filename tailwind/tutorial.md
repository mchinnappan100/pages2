Here’s a **comprehensive tutorial in Markdown** for using **Tailwind CSS**, with lots of examples for quick reference:

---

# 🚀 Tailwind CSS Tutorial with Examples

Tailwind CSS is a **utility-first CSS framework** that lets you build modern, responsive UIs quickly without writing custom CSS. Instead of creating separate CSS classes, you apply utility classes directly in your HTML.

---

## 📦 1. Installation

### Using CDN (Quick Start)

Add this inside your HTML `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Using Node + PostCSS

```bash
# Create project
mkdir tailwind-demo && cd tailwind-demo
npm init -y

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Edit `tailwind.config.js`:

```js
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind to your CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Build:

```bash
npx tailwindcss -i ./input.css -o ./output.css --watch
```

---

## 🎨 2. Basic Styling Examples

### Text and Colors

```html
<h1 class="text-4xl font-bold text-blue-600">Hello Tailwind!</h1>
<p class="text-gray-700">This is a paragraph with gray text.</p>
```

### Backgrounds

```html
<div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-lg text-white">
  Gradient background
</div>
```

### Borders & Rounded Corners

```html
<div class="border border-gray-400 rounded-lg p-4">
  Rounded card with border
</div>
```

---

## 📱 3. Responsive Design

Tailwind uses **mobile-first** breakpoints:

* `sm:` → ≥ 640px
* `md:` → ≥ 768px
* `lg:` → ≥ 1024px
* `xl:` → ≥ 1280px

```html
<p class="text-base sm:text-lg md:text-xl lg:text-2xl">
  Responsive text size
</p>
```

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="bg-blue-100 p-4">Column 1</div>
  <div class="bg-blue-200 p-4">Column 2</div>
  <div class="bg-blue-300 p-4">Column 3</div>
</div>
```

---

## 🖼️ 4. Layout Utilities

### Flexbox

```html
<div class="flex justify-between items-center p-4 bg-gray-100">
  <span>Logo</span>
  <nav class="flex gap-4">
    <a href="#" class="text-blue-600">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</div>
```

### Grid

```html
<div class="grid grid-cols-2 gap-4 p-4">
  <div class="bg-green-200 p-4">Item 1</div>
  <div class="bg-green-300 p-4">Item 2</div>
  <div class="bg-green-400 p-4">Item 3</div>
  <div class="bg-green-500 p-4">Item 4</div>
</div>
```

---

## 🎛️ 5. Components Examples

### Buttons

```html
<button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Primary Button
</button>
<button class="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100">
  Outline Button
</button>
```

### Cards

```html
<div class="max-w-sm bg-white border rounded-lg shadow p-4">
  <h2 class="text-lg font-bold">Card Title</h2>
  <p class="text-gray-600">This is a card with text and actions.</p>
  <button class="mt-3 px-3 py-1 bg-blue-500 text-white rounded">Action</button>
</div>
```

### Navbar

```html
<header class="flex justify-between items-center p-4 bg-gray-800 text-white">
  <span class="font-bold">MyApp</span>
  <nav class="flex gap-4">
    <a href="#" class="hover:text-blue-400">Home</a>
    <a href="#" class="hover:text-blue-400">Services</a>
    <a href="#" class="hover:text-blue-400">Contact</a>
  </nav>
</header>
```

---

## 🌗 6. Dark Mode

Enable dark mode in `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class', // or 'media'
}
```

Use in HTML:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
  This adapts to dark mode
</div>
```

Toggle with JavaScript:

```js
document.documentElement.classList.toggle('dark')
```

---

## 🎢 7. Animations & Transitions

```html
<button class="px-4 py-2 bg-indigo-600 text-white rounded transition transform hover:scale-105 hover:bg-indigo-700">
  Hover Me
</button>
```

```html
<div class="animate-bounce bg-red-400 w-16 h-16 rounded-full"></div>
```

---

## 🛠️ 8. Forms Example

```html
<form class="max-w-md mx-auto bg-white shadow p-6 rounded-lg space-y-4">
  <input type="text" placeholder="Name" class="w-full p-2 border rounded" />
  <input type="email" placeholder="Email" class="w-full p-2 border rounded" />
  <textarea placeholder="Message" class="w-full p-2 border rounded"></textarea>
  <button class="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
</form>
```

---

## 🎯 9. Utilities Cheat Sheet

* **Spacing:** `p-4`, `m-2`, `px-6`
* **Typography:** `text-xl`, `font-bold`, `italic`, `uppercase`
* **Colors:** `bg-red-500`, `text-blue-600`, `border-gray-300`
* **Flexbox/Grid:** `flex`, `justify-center`, `items-start`, `grid-cols-3`
* **Effects:** `shadow-lg`, `rounded-xl`, `hover:bg-gray-200`
* **Responsive:** `sm:`, `md:`, `lg:`, `xl:`

---

## ✅ 10. Final Example - Responsive Dashboard

```html
<div class="min-h-screen bg-gray-100 p-6">
  <header class="bg-white p-4 shadow flex justify-between items-center">
    <h1 class="font-bold text-lg">Dashboard</h1>
    <button class="bg-blue-600 text-white px-3 py-1 rounded">Logout</button>
  </header>

  <main class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
    <aside class="bg-white p-4 shadow md:col-span-1">
      <ul class="space-y-2">
        <li><a href="#" class="text-blue-600">Home</a></li>
        <li><a href="#">Analytics</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </aside>

    <section class="bg-white p-6 shadow md:col-span-3">
      <h2 class="text-xl font-bold mb-4">Welcome Back!</h2>
      <p class="text-gray-600">Here’s your analytics overview.</p>
    </section>
  </main>
</div>
```

---

# 🎉 Conclusion

Tailwind CSS helps you **prototype fast, stay consistent, and scale easily**.
By mastering **utility classes, responsive design, and dark mode**, you can build modern UIs without writing custom CSS.

👉 Explore more at [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

Would you like me to expand this into a **step-by-step project tutorial** (e.g., build a blog page or dashboard UI from scratch with Tailwind)?
