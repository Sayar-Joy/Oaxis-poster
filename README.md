# OAXISMM Poster Generator Studio

A high-performance client-side web application for generating promotional banners and social media posts for **oaxismm.com**, supporting both **16:9 Banner (1920 × 1080)** and **1:1 Square Post (1080 × 1080)** formats.

---

## ✨ Features

- **Dual Aspect Ratios**:
  - **16:9 Banner (1920 × 1080)**: Landscape website and movie banner layout.
  - **1:1 Square Post (1080 × 1080)**: Social media feed post layout (Telegram, Facebook, Instagram) with top landscape poster card.
  - **1-Click Ratio Switcher**: Seamless instant switching in both the control panel and the live preview toolbar with 100% shared state.
  - **Batch Export**: "Download Both (16:9 + 1:1)" to save both formats at once.

- **Exact Burmese Typography & Layout**:
  - **Upper Branding**: Permanent `/oaxismm.com မှဘာသာပြန်တင်ဆက်သည်` in **A10_YoeShin Bold** with exact yellow/white branding colors and crisp stroke outline.
  - **Bottom VIP Footer**: Permanent `Vip ဝင်ရန် Telegram - OAXis69 • Viber - 09 668 668 584` in **A10_YoeShin Bold**.
  - **Middle Header & Caption**:
    - **ThuNgalTan (သူငယ်တန်း)** set as default display font.
    - Full multi-line break (Enter key) support with automatic vertical re-centering and collision protection.
    - Vertically balanced in blank spaces with comfortable breathing room.
  - **Brand Logo Badge**: Framed circular corner logo.

- **Atmospheric Background & Poster Framing**:
  - Automatic blurred and dimmed backdrop from the poster image.
  - Interactive image crop tool powered by Cropper.js.
  - Fine-tuning sliders: blur radius, darkness level, card corner radius, text outline thickness, and vertical offset.

- **100% Client-Side & Mobile Friendly**:
  - Runs entirely in the browser with zero external server dependencies.
  - Offline-safe with embedded fallback assets.
  - Mobile tab switcher ("Edit Content" vs "Live Banner") with touch controls.

---

## 🌐 How to Host on the Web (Free & Fast)

Because this is a pure static web app (HTML/CSS/JS with custom TTF fonts and images), it can be hosted for **free** on any static web host in just a few clicks:

### Method 1: GitHub Pages (Recommended — Built into this repo)

Since your code is pushed to GitHub (`Sayar-Joy/Oaxis-poster`), you can enable GitHub Pages in 30 seconds:

1. Open your repository on GitHub: [https://github.com/Sayar-Joy/Oaxis-poster](https://github.com/Sayar-Joy/Oaxis-poster)
2. Click **Settings** (gear icon in the top repository tabs).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Branch**:
   - Select **`main`** from the branch dropdown.
   - Leave the folder as **`/(root)`**.
5. Click **Save**.
6. Wait 1–2 minutes, and your site will be live at:
   `https://sayar-joy.github.io/Oaxis-poster/`

---

### Method 2: Vercel (Instant HTTPS & Global CDN)

1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** > **Project**.
3. Select and import **`Oaxis-poster`**.
4. Leave all default build settings as-is (Framework Preset: "Other", Root Directory: `./`).
5. Click **Deploy**.
6. Your web app will be live with a free `.vercel.app` domain in seconds!

---

### Method 3: Netlify (Drag & Drop or Git Integration)

1. Go to [https://netlify.com](https://netlify.com) and sign in.
2. Click **Add new site** > **Import an existing project** > **GitHub**.
3. Choose `Sayar-Joy/Oaxis-poster`.
4. Click **Deploy Oaxis-poster**.
5. Your web app is live instantly with an SSL certificate.

---

### Method 4: Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select `Sayar-Joy/Oaxis-poster`.
4. Click **Begin setup** and then **Save and Deploy**.

---

## 💻 Local Usage

Simply double-click `index.html` or run:

```bash
# Using Python 3 built-in HTTP server:
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in any web browser.
