# 🎨 ArtCertify Landing Page

Landing page professionale per ArtCertify - Piattaforma di Certificazione Blockchain.

## 🚀 Quick Start

### Installazione

```bash
npm install
```

### Sviluppo

```bash
npm run dev
```

La landing page sarà disponibile su `http://localhost:5174`

### Build Produzione

```bash
npm run build
```

I file ottimizzati saranno generati nella cartella `dist/`

### Preview Build

```bash
npm run preview
```

## 📋 Struttura

```
landingpage/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Header con menu navigazione
│   │   ├── HeroSection.tsx      # Sezione hero con CTA principale
│   │   ├── FeaturesSection.tsx  # Griglia funzionalità
│   │   ├── HowItWorksSection.tsx # Processo step-by-step
│   │   ├── FAQSection.tsx       # FAQ accordion
│   │   └── Footer.tsx           # Footer con link
│   ├── App.tsx                  # Componente principale
│   ├── main.tsx                 # Entry point
│   └── index.css                # Stili globali
├── public/                      # Asset statici
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Design System

### Colori Brand

- **Primary**: Blue (#0ea5e9) - Colore principale brand
- **Success**: Green (#22c55e) - Stati positivi
- **Purple**: Purple (#a855f7) - Accenti e gradients
- **Slate**: Dark theme palette

### Componenti

- **Header**: Navigazione sticky con effetto scroll
- **Hero**: CTA principale con trust indicators
- **Features**: 9 feature cards in griglia responsiva
- **How It Works**: 5 step processo certificazione
- **FAQ**: 10 domande frequenti con accordion
- **Footer**: Link utili e informazioni contatti

## 🔗 Link Esterni

Il bottone "APRI APP" punta a:
```
https://app.artcertify.com
```

Modifica questo link in `src/components/Header.tsx`, `HeroSection.tsx`, `HowItWorksSection.tsx` e `Footer.tsx` se necessario.

## 🌐 SEO

Il file `index.html` include:
- Meta tags SEO ottimizzati
- Open Graph tags per social sharing
- Twitter Card tags
- Favicon e app icons

## 📱 Responsive Design

La landing page è completamente responsive:
- **Mobile**: < 768px (menu hamburger)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deploy

### Netlify / Vercel

1. Connetti il repository
2. Imposta build command: `npm run build`
3. Imposta publish directory: `dist`
4. Deploy!

### Manuale

```bash
npm run build
# Carica contenuto cartella dist/ sul tuo hosting
```

## 📞 Supporto

Per domande o supporto:
- **Email**: info@activadigital.it
- **Website**: https://www.activadigital.it

---

Sviluppato da **Activa Digital** con ❤️

