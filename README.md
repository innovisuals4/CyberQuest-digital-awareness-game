# CyberQuest: The Digital Awareness Challenge

A 15-level cybersecurity awareness game. 480 question modules, 3 lives per run,
XP/streaks/badges, and CyberMentor — a hint chatbot that nudges without spoiling.

**Privacy by design:** progress is stored in `sessionStorage` only. It survives
refreshes while the tab is open and is wiped automatically the moment the visitor
leaves. Nothing is ever sent to a server, and no data persists between visits.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (Vitest)
npm run build    # static export into ./out
```

## Deploy to GitHub Pages

The repo ships with `.github/workflows/deploy.yml`, which builds the static
export and publishes it to GitHub Pages on every push to `main`. The base path
is derived automatically from the repository name — no manual configuration.

### One-time setup

1. **Create the repository** on GitHub (e.g. `digital-awareness-game`).
   Do **not** initialize it with a README (avoids a merge conflict).

2. **Connect and push this folder:**

   ```bash
   cd "C:\Users\Roshani\Desktop\digital awareness game"
   git init
   git add .
   git commit -m "CyberQuest — initial release"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<REPO-NAME>.git
   git push -u origin main
   ```

3. **Enable Pages from Actions:**
   GitHub → your repo → **Settings → Pages →**
   *Build and deployment → Source:* **GitHub Actions**.

4. Wait for the **Deploy to GitHub Pages** workflow to finish (repo → *Actions* tab).

5. Your game is live at:

   ```
   https://<YOUR-USERNAME>.github.io/<REPO-NAME>/
   ```

### Notes

- Every later `git push` to `main` redeploys automatically.
- The workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo-name>` at build time, so all
  links and assets resolve correctly under the sub-path. Local dev stays at
  `http://localhost:3000` with no base path.
- `public/.nojekyll` is included so GitHub serves the `_next/` assets as-is.
- If the site 404s on a sector page, confirm Pages source is set to
  **GitHub Actions** (not "Deploy from a branch") and that the workflow ran green.

## Adding an AI model to CyberMentor

The site is fully static, so there is no server to hold a secret key. Instead,
CyberMentor supports **bring-your-own-key**: each player can connect their own
AI account from inside the game.

1. Get an API key from one of these providers:
   - **OpenAI** — <https://platform.openai.com/api-keys> (paid, `gpt-4o-mini`)
   - **Groq** — <https://console.groq.com/api-keys> (generous free tier)
   - **Google Gemini** — <https://aistudio.google.com/apikey> (free tier)
2. In the game, open **CyberMentor → ⚙ AI settings**, pick the provider preset,
   paste the key. The badge switches to `AI online`.
3. The key is stored **only in that browser** (this visit by default, or the
   device if "Remember" is ticked). It is never committed to the repo and never
   sent anywhere except directly to the AI provider over HTTPS.
4. No key? CyberMentor automatically falls back to the built-in progressive
   hint engine — the game is fully playable without any AI.

> ⚠️ Never paste an API key into the source code or a `.env` file that gets
> committed — on GitHub Pages anyone could read it.

## Project structure

```
src/app/            landing, dashboard, play/[id] (static params 1–15)
src/components/     CyberMentor, SignalBackdrop, MotionProvider, Confetti
src/lib/            game logic, 480-question bank, session-only persistence
tests/              Vitest unit tests
.github/workflows/  GitHub Pages deploy pipeline
```
