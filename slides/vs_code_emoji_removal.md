To **remove all emojis** in **VS Code** using **Find and Replace**, follow these steps:

---

### ✅ Step-by-step Instructions:

1. **Open Find and Replace**

   * Press `Cmd + F` (macOS) or `Ctrl + F` (Windows/Linux)

2. **Enable Regex Search**

   * Click the `.*` icon (.\* = Regex) in the search bar.

3. **Enter this Regex Pattern**:

   ```
   [\p{Emoji_Presentation}\p{Extended_Pictographic}]
   ```

   > If that doesn't work (due to limited Unicode support), use this alternative:

   ```
   [\u{1F300}-\u{1FAD6}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]
   ```

4. **Leave the Replace Field Empty**
   (You’re removing them, so no replacement needed.)

5. **Click “Replace All”** or use shortcut `Option + Cmd + Enter` (Mac) or `Ctrl + Alt + Enter` (Win).

---

### 🧠 Notes:

* Ensure **“Use Regular Expression”** is enabled.
* VS Code's regex engine supports **Unicode property escapes (`\p{}`)** only with recent versions and with the `"javascript.regexpUnicode": true` setting if needed.
* Emojis are part of Unicode ranges, so exact matching may vary based on what emojis you're targeting.
Would you like a custom script or extension-based approach as well?
