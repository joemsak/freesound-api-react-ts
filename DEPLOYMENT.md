# Deployment Guide

This guide covers how to deploy this application to various free hosting platforms.

## Option 1: GitHub Pages (Current Setup)

### Prerequisites
- Repository must be public (or GitHub Pro for private repos)
- GitHub Actions enabled

### Setup Steps

1. **Configure GitHub Secrets** (for environment variables):
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VITE_FREESOUND_CLIENT_ID`
     - `VITE_FREESOUND_CLIENT_SECRET`
     - `VITE_FREESOUND_API_TOKEN`

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save

3. **Push to main branch**:
   ```bash
   git push origin main
   ```

4. **Deployment**:
   - GitHub Actions will automatically build and deploy
   - Your site will be available at: `https://joemsak.github.io/freesound-api-react-ts/`

### Custom Domain (Optional)
- Add a `CNAME` file in the `public/` folder with your domain
- Configure DNS settings as per GitHub Pages documentation

---

## Option 2: Vercel (Recommended - Easiest)

Vercel is the easiest option for React apps with automatic deployments.

### Setup Steps

1. **Install Vercel CLI** (optional, can use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Web**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `VITE_FREESOUND_CLIENT_ID`
     - `VITE_FREESOUND_CLIENT_SECRET`
     - `VITE_FREESOUND_API_TOKEN`
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts and add environment variables when asked.

### Benefits
- ✅ Automatic deployments on every push
- ✅ Custom domain support
- ✅ HTTPS by default
- ✅ No base path configuration needed
- ✅ Preview deployments for PRs

**Your site will be at**: `https://your-project-name.vercel.app`

---

## Option 3: Netlify

Similar to Vercel, very easy to use.

### Setup Steps

1. **Deploy via Web**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Site settings → Environment variables
   - Click "Deploy site"

2. **Deploy via CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Benefits
- ✅ Automatic deployments
- ✅ Custom domain support
- ✅ HTTPS by default
- ✅ Form handling (if needed)

**Your site will be at**: `https://your-project-name.netlify.app`

---

## Option 4: Cloudflare Pages

Free hosting with global CDN.

### Setup Steps

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Pages → Create a project
3. Connect your GitHub repository
4. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables
6. Deploy

### Benefits
- ✅ Global CDN
- ✅ Unlimited bandwidth
- ✅ Custom domains

---

## Environment Variables

All platforms require these environment variables to be set:

- `VITE_FREESOUND_CLIENT_ID` - Your Freesound API Client ID
- `VITE_FREESOUND_CLIENT_SECRET` - Your Freesound API Client Secret
- `VITE_FREESOUND_API_TOKEN` - Your Freesound API Token

**Important**: Never commit `.env` files to git. Always use platform-specific secret/environment variable settings.

---

## Troubleshooting

### GitHub Pages: Routes not working
- Ensure `404.html` is in the `public/` folder
- Check that `base` path in `vite.config.ts` matches your repo name

### Build fails
- Check that all environment variables are set
- Verify Node.js version (should be 20+)
- Check build logs for specific errors

### API calls failing
- Verify environment variables are correctly set
- Check browser console for CORS errors
- Ensure API credentials are valid

---

## Recommendation

**For easiest setup**: Use **Vercel** or **Netlify**
- No base path configuration needed
- Automatic deployments
- Better developer experience

**For GitHub integration**: Use **GitHub Pages**
- Already configured with GitHub Actions
- Good if you want everything in one place

