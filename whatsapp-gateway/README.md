# WhatsApp Web Automation Gateway for TimeFlow

This is a Node.js microservice that connects to WhatsApp Web using `whatsapp-web.js`, `qrcode-terminal`, and `express`.

It allows your personal phone's WhatsApp to send scheduled reminders automatically from TimeFlow.

---

## 🚀 How to Run

1. Open a terminal in this folder:
   ```bash
   cd "e:\Task Scheduler\whatsapp-gateway"
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the gateway:
   ```bash
   npm start
   ```

4. **Scan the QR Code**:
   - On startup, a QR code will be printed directly in the terminal.
   - Open WhatsApp on your phone:
     - Android: Tap **Three Dots** > **Linked Devices** > **Link a Device**.
     - iPhone: Tap **Settings** > **Linked Devices** > **Link a Device**.
   - Point your camera at the QR code in the terminal.
   - Once linked, the session is saved locally in `./.wwebjs_auth`. You will **not** need to scan again on subsequent restarts!

---

## 📡 API Endpoints

- **Status Check**:
  - `GET http://localhost:3000/status`
- **Send Message**:
  - `POST http://localhost:3000/send-whatsapp`
  - Body:
    ```json
    {
      "to": "919876543210",
      "message": "Drink water and stretch!"
    }
    ```
