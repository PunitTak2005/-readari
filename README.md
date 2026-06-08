<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ffed0ecd-8a43-4959-84d6-89424e14fb10

## Run Locally

**Project layout:**
- `frontend/` contains the React app and Vite configuration
- `backend/` contains backend config and server files

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `frontend/.env.local` to your Gemini API key
3. Run the frontend app in one terminal:
   `npm run start:frontend`
4. Run the backend server in another terminal:
   `npm run start:backend`

Or start both together from one terminal:
- `npm run start`
# Readari
