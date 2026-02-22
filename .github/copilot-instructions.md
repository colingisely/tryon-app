# Copilot instructions — tryon-app

Purpose
- This repository is a small Next.js (App Router) try-on demo that uploads a user photo
  from the client, stores a temporary image under `/tmp`, and calls the Replicate API
  to generate a try-on image.

Big picture / architecture
- Frontend: `app/page.tsx` is a client component ("use client") that reads an image file,
  converts it to base64 and POSTs `{ image }` to `/api/tryon`.
- Server: server route handlers live under `app/api/*` and implement `export async function POST/GET(req)`.
- Temp serving: uploaded files are written to `/tmp` and exposed via
  `app/api/tmp/temporaryfile/route.ts`.
- AI integration: the server uses the `replicate` SDK to run models. There are two similar
  implementations in the repo root and under `tryon-app/` — inspect both before editing.

Key files to inspect (examples)
- `app/page.tsx` — client upload flow and UI controls.
- `app/api/tryon/route.ts` — server-side handler that accepts `{ image }` and calls Replicate.
- `tryon-app/app/api/tryon/route.ts` — alternate implementation that uses
  `replicate.predictions.create` (returns a prediction id).
- `tryon-app/app/api/tryon/[id]/route.ts` — GET handler to poll prediction status.
- `app/api/tmp/temporaryfile/route.ts` — serves files saved to `/tmp`.

Project-specific patterns and conventions
- App Router + route handlers: follow the `export async function POST/GET(req)` pattern and
  return `NextResponse` or `Response` objects.
- Client-to-server payload: the client sends a JSON body with a base64 image string.
- Temporary files: server code writes uploaded buffers to `/tmp` and exposes them via
  an API route — tests and local debug should look in `/tmp` for files.
- Logging: code includes `console.log` traces (e.g., "Token", "Dados recebidos no backend!")
  — use these when debugging.

Environment and secrets
- Expected env vars: `NEXT_REPLICATE_API_TOKEN` (or `REPLICATE_API_TOKEN`) and
  `NEXT_PUBLIC_APP_URL` (used to build a public URL to `/api/tmp/`).
- Security note: there is a hard-coded Replicate token in
  `tryon-app/app/api/tryon/route.ts`. Do not commit real tokens — rotate and move to env.

Dev / debug workflow
- Start locally: run `npm run dev` from the project root (or inside `tryon-app/` if you
  intend to work on that copy). The app runs on `http://localhost:3000` by default.
- Manual test: open the UI, upload a photo, and click "Gerar look com IA" — watch server
  logs for the POST and Replicate calls. If an implementation uses prediction ids, poll
  `/api/tryon/[id]` to get the final `output`.

When making changes
- Prefer editing the top-level `app/` unless you intend to work on the `tryon-app/` copy.
- Small, focused changes: update prompts and model parameters where `replicate.run` or
  `replicate.predictions.create` is invoked (files above include concrete examples).
- Avoid adding or committing API keys. If you find secrets committed, notify the owner
  and rotate the credential immediately.

Examples (what to change)
- To adjust the generated imagery prompt, edit the `input.prompt` passed to `replicate.run`
  in `app/api/tryon/route.ts`.
- To switch to an asynchronous prediction model, follow the pattern in
  `tryon-app/app/api/tryon/route.ts` (create a prediction, return id) and poll the
  `[id]/route.ts` endpoint for status.

If something is unclear
- Tell me which implementation you want to standardize on (root `app/` or `tryon-app/`).
- If you want, I can also run the dev server, search for leaked secrets, or convert the
  synchronous `replicate.run` usage to the prediction/polling pattern used in the other copy.

— End of instructions
