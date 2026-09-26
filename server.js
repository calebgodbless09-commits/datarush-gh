require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const BUNDLES = {
  "1GB": 3.50,
  "2GB": 6.00,
  "3GB": 8.50,
  "5GB": 14.00,
  "10GB": 27.00,
  "20GB": 52.00
};

app.get("/api/bundles", (_req, res) => {
  res.json(BUNDLES);
});

app.post("/api/payments/initialize", async (req, res) => {
  try {
    const { bundle, network, phone, email } = req.body;

    if (!BUNDLES[bundle]) {
      return res.status(400).json({ error: "Invalid bundle." });
    }

    if (!/^\+?\d{10,15}$/.test(String(phone || "").replace(/\s/g, ""))) {
      return res.status(400).json({ error: "Enter a valid phone number." });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        error: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to .env."
      });
    }

    const amountPesewas = Math.round(BUNDLES[bundle] * 100);
    const reference = `DRGH-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: String(amountPesewas),
        currency: "GHS",
        reference,
        callback_url: `${SITE_URL}/payment-success.html`,
        channels: ["card", "mobile_money"],
        metadata: {
          bundle,
          network,
          phone
        }
      })
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(400).json({
        error: data.message || "Could not initialize payment."
      });
    }

    res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment initialization failed." });
  }
});

app.get("/api/payments/verify/:reference", async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Paystack is not configured." });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(req.params.reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(400).json({ error: data.message || "Verification failed." });
    }

    const tx = data.data;
    res.json({
      status: tx.status,
      reference: tx.reference,
      amount: tx.amount,
      currency: tx.currency,
      metadata: tx.metadata,
      paid_at: tx.paid_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment verification failed." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`DataRush GH running at ${SITE_URL}`);
});