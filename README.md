# Dandiya Night 2026 – Next.js website

Booking form → sends all details + a QR code by email:
- **Organiser** gets: name, mobile, email, ticket, quantity, total, QR code, and the payment screenshot attached.
- **Customer** gets: their booking details + QR code (marked "pending payment verification").

## 1. Add your images
Put these in the `public/` folder (same file names):
- `poster-1.jpg`, `poster-2.jpg` – event posters
- `upi-qr.png` – your PhonePe / UPI QR

## 2. Create a Gmail App Password (for sending emails)
1. Use the Gmail account that will send emails. Turn on **2-Step Verification**.
2. Go to https://myaccount.google.com/apppasswords → create one named "Dandiya" → copy the 16-character password.

## 3. Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # open http://localhost:3000
```

## 4. Deploy on Vercel
1. Push this folder to GitHub, then import it at https://vercel.com/new
2. In **Settings → Environment Variables**, add:
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ORGANISER_EMAIL`
3. Redeploy.

## Change event details
Edit `lib/event.js` (date, venue, prices, UPI ID, phone numbers).

Note: Gmail allows ~500 emails/day – plenty for one event.
