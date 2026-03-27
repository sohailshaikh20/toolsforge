# ToolsForge - Free AI-Powered Tools

8 tools live (2 AI + 6 free). Monetize with Google AdSense.

## DEPLOY IN 10 MINUTES

### Prerequisites
- GitHub account (free): https://github.com/signup
- Vercel account (free): https://vercel.com/signup (sign up with GitHub)
- Anthropic API key: https://console.anthropic.com/ (for AI tools)

### Step 1: Get your Anthropic API key
1. Go to https://console.anthropic.com/
2. Create account, add $5 credit (this lasts 1-3 months with our limits)
3. Go to API Keys > Create Key
4. Copy the key (starts with sk-ant-)

### Step 2: Push to GitHub
Open terminal and run:
```bash
cd toolsforge
npm install
git init
git add .
git commit -m "ToolsForge v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/toolsforge.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your toolsforge repo
4. Framework: Vite (auto-detected)
5. Click Deploy - wait 1 minute

### Step 4: Add API key to Vercel
1. In Vercel > your project > Settings > Environment Variables
2. Name: ANTHROPIC_API_KEY
3. Value: sk-ant-your-key-here (paste your real key)
4. Click Save
5. Go to Deployments tab > click ... on latest > Redeploy

### Step 5: Your site is LIVE
Visit: https://toolsforge.vercel.app (or your project name)

## COST BREAKDOWN

| Item | Cost |
|------|------|
| Vercel hosting | FREE (hobby plan) |
| Domain (optional) | ~$10/year |
| Anthropic API (Haiku) | ~$5-30/month |
| Google AdSense | FREE to apply |
| **Total startup** | **$5 (API credit)** |

## HOW THE MONEY WORKS

- 6 free JS tools = ZERO cost, pure ad revenue profit
- 2 AI tools = 5 uses/day per visitor limit = capped cost
- Using Haiku model ($1/$5 per M tokens) = cheapest option
- Each AI call costs ~$0.003 = 1000 calls = $3
- At 50K monthly visitors: ~$15 API cost vs ~$300 ad revenue

## ADDING GOOGLE ADSENSE (when ready)

1. Apply at https://adsense.google.com/ (need ~15+ pages of content)
2. Once approved, add the script tag to index.html <head>
3. Place ad units between tools on the homepage
4. Expected: $3-8 per 1000 pageviews depending on niche

## ADDING NEW TOOLS

In src/App.jsx:
1. Create a new function component (copy pattern from existing tools)
2. Add entry to TOOLS array
3. Add to TC (tool components) map
4. Remove from COMING array if it was listed there

## FILE STRUCTURE

```
toolsforge/
  api/chat.js          - Serverless function (Haiku model, keeps API key secret)
  public/favicon.svg   - Site icon
  src/App.jsx          - All 8 tools + homepage
  src/main.jsx         - React entry
  src/index.css        - Global styles
  index.html           - SEO meta tags
  vercel.json          - Routing config
  package.json         - Dependencies
```
