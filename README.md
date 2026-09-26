# DataRush GH — iOS-style Glass Edition

A glassmorphism-inspired Ghana data bundle storefront with animated gradients, translucent cards, a CSS smartphone mockup, responsive mobile layout, bundle selection, and Paystack checkout initialization.

## Run it

1. Open this folder in VS Code.
2. Open Terminal → New Terminal.
3. If PowerShell blocks npm, open Command Prompt instead.
4. Run:

```bash
npm install
npm start
```

5. Visit http://localhost:3000

## Paystack

Create a `.env` file based on `.env.example` and use a Paystack **test** secret key while developing.

Never put the secret key in browser JavaScript.

## Important production note

This starter does not connect to a data-bundle fulfillment provider. A real service needs a legitimate provider/API, server-side order records, webhook handling, amount validation, duplicate-fulfillment protection, and an authenticated admin system.

The bundle prices in this demo are example prices and should be replaced with your real provider pricing before selling anything.

## Design

The UI is inspired by modern iPhone/iOS glassmorphism: translucent surfaces, blur, floating gradients, glossy controls, soft neon light, animated phone mockup, and responsive layouts.
