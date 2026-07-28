# ADB E-Mobility Portfolio Dashboard

Interactive Asian Transport Observatory dashboard for exploring the ADB
e-mobility portfolio.

## Local development

```bash
pnpm install
pnpm dev
```

The local development server runs at `http://127.0.0.1:4186/`.

## Production build

```bash
pnpm build
pnpm preview
```

Production routing uses URL hashes so all views work on static hosting:

- `/#/`
- `/#/funding`
- `/#/profile`
- `/#/outputs`
- `/#/projects`

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the
dashboard whenever `main` is updated. It can also be started manually from the
Actions tab.

After pushing the repository:

1. Open **Settings > Pages** in GitHub.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run **Deploy dashboard to GitHub Pages** manually.

The workflow publishes `dist/` to the repository's GitHub Pages URL.
