# 🔐 Encoding and Encryption
## A Beginner's Guide for High School Students

Learn how computers protect secrets

With Python examples 🐍

---

# 🎯 What You Will Learn

• What is data  
• What is encoding  
• What is encryption  
• Why encryption is important  
• How passwords are protected  
• How hackers think  
• How to encrypt using Python  

---

# 💻 What is Data?

Data is information.

Examples:

• Your name  
• Your password  
• Your photos  
• Messages  
• Videos  

Computers store everything as data.

---

# 🔢 Computers Only Understand Numbers

Computers do NOT understand:

❌ Letters  
❌ Words  
❌ Emojis  

They only understand:

✅ Numbers  
✅ Binary (0 and 1)

---

# 🧮 Binary Example

Letter:

```

A

```

Binary:

```

01000001

```

This is how computers store letters.

---

# 📦 What is Encoding?

Encoding = converting data into a different format

Purpose:

• Store data
• Send data
• Display data

Encoding is NOT secret.

Anyone can decode it.

---

# 🧾 Encoding Example: ASCII

ASCII converts letters into numbers.

Example:

```

A → 65
B → 66
C → 67

````

---

# 🐍 Python Example: ASCII Encoding

```python
text = "A"
encoded = ord(text)
print(encoded)
````

Output:

```
65
```

---

# 🐍 Python Example: ASCII Decoding

```python
number = 65
decoded = chr(number)
print(decoded)
```

Output:

```
A
```

---

# 🌍 What is UTF-8 Encoding?

UTF-8 encodes all characters.

Example:

```
A → 65
😊 → 240 159 152 138
```

---

# 🐍 Python UTF-8 Example

```python
text = "Hello"
encoded = text.encode("utf-8")
print(encoded)
```

Output:

```
b'Hello'
```

---

# 📦 What is Base64 Encoding?

Base64 converts data into readable text.

Used in:

• Images
• Emails
• Web

---

# Base64 Example

Original:

```
Hello
```

Base64:

```
SGVsbG8=
```

---

# 🐍 Python Base64 Example

```python
import base64

text = "Hello"
encoded = base64.b64encode(text.encode())

print(encoded)
```

Output:

```
b'SGVsbG8='
```

---

# 🐍 Base64 Decode Example

```python
decoded = base64.b64decode(encoded)
print(decoded.decode())
```

Output:

```
Hello
```

---

# ❗ Important Rule

Encoding is NOT secret.

Anyone can decode it.

It is NOT security.

---

# 🔐 What is Encryption?

Encryption protects secrets.

It converts readable data into secret data.

---

# Encryption Example

Original:

```
Hello
```

Encrypted:

```
XyZ91Ab
```

Cannot read without key.

---

# 🔑 What is a Key?

Key = secret password used to encrypt/decrypt

Example:

```
Message: Hello
Key: 123
Encrypted: Khoor
```

---

# 🧠 Real Life Example

Lock = encryption
Key = password
Box = data

Without key → cannot open

---

# 🔄 Encryption and Decryption

Encryption:

```
Hello → Secret text
```

Decryption:

```
Secret text → Hello
```

---

# 🐍 Simple Python Encryption Example

```python
message = "HELLO"

encrypted = ""

for letter in message:
    encrypted += chr(ord(letter) + 3)

print(encrypted)
```

Output:

```
KHOOR
```

---

# 🐍 Decryption Example

```python
encrypted = "KHOOR"

decrypted = ""

for letter in encrypted:
    decrypted += chr(ord(letter) - 3)

print(decrypted)
```

Output:

```
HELLO
```

---

# 🧠 This is Called Caesar Cipher

One of the oldest encryption methods.

Used by Julius Caesar.

---

# Caesar Cipher Example

Shift by 3:

```
A → D
B → E
C → F
```

---

# 🐍 Caesar Cipher Program

```python
def encrypt(text, shift):
    result = ""
    for letter in text:
        result += chr(ord(letter) + shift)
    return result

print(encrypt("HELLO", 3))
```

---

# 🔓 Caesar Cipher Decrypt

```python
def decrypt(text, shift):
    result = ""
    for letter in text:
        result += chr(ord(letter) - shift)
    return result

print(decrypt("KHOOR", 3))
```

---

# ❗ Caesar Cipher is NOT secure

Hackers can break it easily.

---

# 🧠 Modern Encryption is Strong

Uses complex math.

Example:

AES-256

Almost impossible to break.

---

# 🔑 Symmetric Encryption

Same key used for:

Encryption
Decryption

---

# Visual

```
Message + Key → Encrypted
Encrypted + Key → Message
```

---

# 🔐 Asymmetric Encryption

Uses two keys:

Public key
Private key

---

# Example

Public key → encrypt
Private key → decrypt

---

# 🌍 Used in HTTPS

When you visit:

```
https://google.com
```

Encryption protects your data.

---

# 🔒 Password Storage

Websites do NOT store passwords directly.

They store hashes.

---

# 🧠 What is Hashing?

Hash = one-way encryption.

Cannot reverse.

---

# Hash Example

Password:

```
hello
```

Hash:

```
2cf24dba5fb0a...
```

---

# 🐍 Python Hash Example

```python
import hashlib

password = "hello"

hash = hashlib.sha256(password.encode())

print(hash.hexdigest())
```

---

# Output

```
2cf24dba5fb0a30e26...
```

---

# ❗ Cannot reverse hash

You cannot get original password.

---

# Why Hash Passwords?

If hackers steal database:

They see hashes, not passwords.

---

# Real World Example

Instagram
Google
Bank websites

All use encryption.

---

# 📱 Example: Sending Message

Without encryption:

```
I love pizza
```

Anyone can read.

---

# With encryption

```
X9sK2lP0a
```

Safe.

---

# 🧠 Why Encryption is Important

Protects:

• Passwords
• Messages
• Photos
• Bank info

---

# Hackers Exist

Encryption protects against hackers.

---

# WiFi Example

Public WiFi is dangerous.

Encryption protects you.

---

# 🐍 Real Encryption Example Using Python

Install library:

```
pip install cryptography
```

---

# Encrypt Example

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()

f = Fernet(key)

message = b"Hello"

encrypted = f.encrypt(message)

print(encrypted)
```

---

# Decrypt Example

```python
decrypted = f.decrypt(encrypted)

print(decrypted)
```

---

# Output

```
Hello
```

---

# 🎯 Encoding vs Encryption vs Hashing

Encoding:

Not secure
Reversible

Encryption:

Secure
Reversible with key

Hashing:

Secure
NOT reversible

---

# Example Table

Encoding:

Hello → SGVsbG8=

Encryption:

Hello → XyZ91Ab

Hash:

Hello → 2cf24dba5f...

---

# Real World Uses

Encoding:

Images
Videos

Encryption:

HTTPS
Banking

Hashing:

Passwords

---

# 🧠 Fun Example

Secret message to friend.

Encrypt before sending.

---

# Python Secret Message Program

```python
key = 5

message = input("Enter message: ")

encrypted = ""

for c in message:
    encrypted += chr(ord(c) + key)

print(encrypted)
```

---

# Decrypt Program

```python
for c in encrypted:
    print(chr(ord(c) - key))
```

---

# 🧠 Cybersecurity Careers

Encryption experts work as:

Cybersecurity engineers
Ethical hackers
Security researchers

---

# Companies That Use Encryption

Google
Microsoft
Apple
Netflix

---

# Encryption Keeps Internet Safe

Without encryption:

Internet would be dangerous.

---

# 🧠 Summary

Encoding = format change

Encryption = secret protection

Hashing = password protection

---

# 🎉 You Learned

How encoding works
How encryption works
Python encryption examples

---

# 🚀 Next Steps

Learn Python
Learn cybersecurity
Build secure apps

---

# 🔐 Thank You

Questions?

