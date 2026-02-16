# 🔐 AES-256 Encryption
## Understanding Modern Data Protection

**Advanced Encryption Standard (AES) with 256-bit key**

Secure. Fast. Trusted worldwide.

---

# 📌 What is Encryption?

Encryption converts readable data (**plaintext**) into unreadable data (**ciphertext**) to protect it.

```

Plaintext:   MyPassword123
Encryption:  AES-256
Ciphertext:  A8f9K2pL0xQ9zM==

```

Only authorized users with the correct key can decrypt it.

---

# 🧠 Real-World Analogy

Imagine a **super-secure locker**:

- Your file = 📄 Document
- AES-256 = 🔒 Locker
- Encryption Key = 🔑 Locker key
- Ciphertext = 📦 Locked locker

Without the key → Impossible to open.

---

# 🏆 Why AES-256?

AES-256 uses a **256-bit key**, which means:

```

2^256 possible keys

= 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936 possible combinations

```

Even the fastest supercomputers would take **billions of years** to brute-force.

---

# ⚙️ How AES Encryption Works (High Level)

AES is a **symmetric encryption algorithm**

Same key is used for:

- Encryption
- Decryption

```

Plaintext + Key → Encryption → Ciphertext
Ciphertext + Key → Decryption → Plaintext

```

---

# 🔄 AES Encryption Process

AES performs multiple rounds (AES-256 uses **14 rounds**):

Each round includes:

1. SubBytes (substitution)
2. ShiftRows (rearrangement)
3. MixColumns (diffusion)
4. AddRoundKey (key mixing)

```

Plaintext
↓
Round 1
↓
Round 2
↓
...
↓
Round 14
↓
Ciphertext

```

---

# 📦 Block Cipher Concept

AES encrypts data in fixed blocks:

```

Block size = 128 bits (16 bytes)

Example:

Input:
HelloWorld123456

Output:
EncryptedBlockXYZ

```

Large files are split into blocks and encrypted separately.

---

# 🔑 Key Size Comparison

| AES Version | Key Size | Security |
|------------|----------|----------|
| AES-128 | 128 bits | Very strong |
| AES-192 | 192 bits | Stronger |
| AES-256 | 256 bits | Maximum security |

AES-256 is used in:

- Banking
- Government
- Cloud platforms
- Military systems

---

# 🧩 Example: Encrypting a Password

Plaintext:

```

MyPassword123

```

Key:

```

SecretKey12345678901234567890

```

Encrypted:

```

U2FsdGVkX1+8K9sdf98sdf897sdf==

````

Cannot be read without the key.

---

# 💻 Example: Node.js AES-256 Encryption

```js
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv(algorithm, key, iv);

let encrypted = cipher.update('Hello World', 'utf8', 'hex');
encrypted += cipher.final('hex');

console.log(encrypted);
````

Output:

```
a3f5c92b1e...
```

---

# 💻 Example: Node.js AES-256 Decryption

```js
const decipher = crypto.createDecipheriv(algorithm, key, iv);

let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');

console.log(decrypted);
```

Output:

```
Hello World
```

---

# 💻 Example: OpenSSL AES-256 Encryption

Encrypt file:

```bash
openssl enc -aes-256-cbc -salt -in file.txt -out file.enc
```

Decrypt file:

```bash
openssl enc -d -aes-256-cbc -in file.enc -out file.txt
```

---

# ☁️ Example: Database Encryption

Before encryption:

```
Name: John Doe
SSN: 123-45-6789
```

After AES-256 encryption:

```
Name: John Doe
SSN: A8F92KJSDF9234KJSDF==
```

Protects sensitive data even if database is stolen.

---

# 🛡️ Why AES-256 is Trusted

Used by:

* Cloud platforms
* Banking systems
* VPNs
* Password managers
* Disk encryption

Examples:

* HTTPS
* TLS
* FileVault
* BitLocker

---

# ⚡ Performance Benefits

AES-256 is:

* Fast
* Hardware accelerated (AES-NI)
* Efficient for large data
* Secure and scalable

---

# 🔐 Symmetric vs Asymmetric Encryption

Symmetric (AES):

```
One key
Fast
Used for data encryption
```

Asymmetric (RSA):

```
Two keys (public/private)
Slower
Used for key exchange
```

Modern systems use both.

---

# 🔄 Real-World Example: HTTPS

Step 1:
Browser and server exchange keys using RSA

Step 2:
AES-256 encrypts data transfer

```
Browser ←AES-256→ Server
```

Secure communication.

---

# 📊 Visual Flow

```
Plaintext
   ↓
AES-256 Encryption
   ↓
Ciphertext
   ↓
AES-256 Decryption
   ↓
Plaintext
```

---

# 🚨 Without Encryption

Attacker sees:

```
Password: MyPassword123
```

With AES-256:

```
Password: A8f9K2pL0xQ9zM==
```

Data remains protected.

---

# 🧠 Key Takeaways

AES-256 is:

* Industry standard encryption
* Extremely secure
* Fast and efficient
* Widely used worldwide
* Protects sensitive data at rest and in transit

---

# ✅ Summary

AES-256 provides:

* Confidentiality
* Security
* Integrity
* Protection against attackers

It is one of the most trusted encryption standards today.

---

# 🔐 Thank You

Questions?

