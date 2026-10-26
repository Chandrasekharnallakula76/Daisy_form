# Daisy event inquiry form

React and Vite form served at **`/`**. Visitors submit inquiries without signing in. Administrators sign in at `/login` and review responses and download CSV at `/admin`.

Production runs in one Cloud Run container: Express serves this compiled frontend and the API on the same origin, and Cloud SQL PostgreSQL persists inquiries and administrator sessions. See the [manual Cloud Run guide](../Daisy_form_backend/deploy/cloud-run/README.md) for the source upload ZIP, image build, database setup, and Console deployment. Deployment resources and credentials are configured manually later.

## Local development

Use Node.js **22.12 or newer** and Yarn Classic **1.22.22**. Start the [backend](../Daisy_form_backend/README.md) on port 4000, then run:

```sh
yarn install --frozen-lockfile
cp .env.example .env
yarn dev
```

Open [http://localhost:5173/](http://localhost:5173/). The optional local API override is `VITE_API_URL=http://localhost:4000`; the backend's local `CLIENT_ORIGIN` is `http://localhost:5173` without a path. Use `localhost` consistently for the browser and API so the sign-in cookie works locally.

The configured fixed administrator account is `admin@daisyai.com`; its password is checked against the backend's existing salted hash. Requests include credentials for the HttpOnly session cookie. Sessions last 12 hours and signing out revokes them. Production sessions persist in PostgreSQL across revisions and restarts. The local SQLite development mode retains its in-memory session behavior, so restarting that backend signs administrators out while preserving local inquiries.

## Verify and build

```sh
yarn typecheck
yarn build:production
```

`build:production` explicitly clears `VITE_API_URL`, preventing a local `.env` from embedding a localhost API in the production bundle. The container build runs this command and copies `dist/` into `/app/frontend/dist`; Express serves it directly. `yarn preview` can serve a completed build locally.

With `VITE_API_URL` empty or unset, requests use the page's origin and Vite's base path: `/api/inquiries`. A nonempty override such as `https://api.example.com` sends requests to `https://api.example.com/api/inquiries`. Overrides are embedded at build time and require the backend's explicit `CLIENT_ORIGIN` to match the frontend origin and credentials-enabled CORS. Use `yarn build` only for an intentional override. `SameSite=Lax` administrator cookies also require the frontend and API to remain on the same site.

The default asset and route base is `/`, read from Vite's `BASE_URL`. For another deployment path, change the frontend build base and the backend's `APP_BASE_PATH` together:

```sh
VITE_API_URL= yarn build --base=/another-path/
```

Use `APP_BASE_PATH=/another-path` for that backend. The supplied Dockerfile uses the default root path, with `APP_BASE_PATH=/`. Direct visits and refreshes at the clean `/login` and `/admin` paths under the configured base serve the same frontend entry page; missing assets return `404`.

For the default root deployment, legacy `GET` and `HEAD` page URLs at `/daisy-gci-event-form`, `/daisy-gci-event-form/`, `/daisy-gci-event-form/login`, and `/daisy-gci-event-form/admin` redirect permanently (`301`) to the corresponding root pages, preserving query strings; login/admin URLs also accept a trailing slash. Old prefixed API, asset, and unknown page URLs return `404`. A custom non-root base keeps its configured routes and does not enable these root-migration redirects.

The [historical Nginx/systemd guide](../Daisy_form_backend/deploy/README.md) describes the earlier SQLite host and is retained for legacy reference. Follow the Cloud Run guide for the current production deployment.
