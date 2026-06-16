# StoryDucks

En webbapp för föräldrar som vill hitta barnböcker, sätta betyg och hålla koll på vad de läst.

**Live:** https://bookducks.netlify.app

---

## Vad man kan göra

- Bläddra bland barnböcker
- Skapa konto och logga in
- Spara böcker i en personlig läslista
- Markera böcker som lästa
- Sätta betyg 1–10 på böcker
- Se sin profil med läslista, lästa böcker och betygsättningar

---

## Tekniker

**Frontend**
- HTML, CSS, JavaScript (vanilla)
- Axios för API-anrop
- GSAP för animationer på landningssidan

**Backend**
- Strapi CMS (headless)
- SQLite-databas

**Deploy**
- Frontend: Netlify
- Backend: körs lokalt / separat server

---

## Komma igång lokalt

### Frontend
Öppna `frontend/index.html` i en webbläsare eller kör med Live Server.

### Backend
```bash
cd backend/my-strapi-project
npm install
npm run develop
```
Strapi startar på `http://localhost:1337`.

Skapa en `.env` fil i backend-mappen med dina egna värden om det behövs.

---

## Struktur

```
projektarbete---Book-Ducks/
├── frontend/
│   ├── landing.html     # Animerad startsida
│   ├── index.html       # Alla böcker
│   ├── details.html     # Bokdetaljer
│   ├── profile.html     # Användarprofil
│   ├── login.html
│   ├── register.html
│   ├── style.css
│   ├── index.js
│   ├── landing.css
│   └── landing.js
├── backend/
│   └── my-strapi-project/
└── netlify.toml
```

---

Projektarbete — Farideh Pakdaman
