# AI Boardroom 🎯

A collaborative AI conversation space where you can chat with Claude and ChatGPT simultaneously or individually.

## Features

- 🤖 Chat with Claude and ChatGPT in one interface
- 🎯 Use `@claude` or `@gpt` to direct questions to specific AIs
- 💬 Autocomplete for @mentions
- 🔄 Full conversation context maintained for both AIs
- ⚡ Built with Next.js 14 and TypeScript
- 🎨 Beautiful Tailwind CSS UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Anthropic API key ([Get it here](https://console.anthropic.com/))
- OpenAI API key ([Get it here](https://platform.openai.com/api-keys))

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts. When asked:
   - Link to existing project? **No**
   - Project name: **ai-boardroom** (or your choice)
   - Directory: **./ai-boardroom-app**
   - Override settings? **No**

4. **Add environment variables:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add OPENAI_API_KEY
   ```
   
   Paste your API keys when prompted. Select "Production" when asked which environment.

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   
3. **Configure project:**
   - Framework Preset: **Next.js**
   - Root Directory: **ai-boardroom-app** (if needed)
   - Build Command: **npm run build**
   - Output Directory: **.next**

4. **Add Environment Variables:**
   In the deployment settings, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `OPENAI_API_KEY` = your OpenAI API key

5. **Deploy!**
   Click "Deploy" and wait for it to finish.

## Usage

### Mention Syntax

- **@claude** - Only Claude responds
- **@gpt** - Only ChatGPT responds
- **No mention** or **both mentions** - Both AIs respond

### Autocomplete

- Type `@` to see available AI options
- Use arrow keys to navigate
- Press Enter or click to select

## Project Structure

```
ai-boardroom-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── claude/
│   │       │   └── route.ts      # Claude API endpoint
│   │       └── gpt/
│   │           └── route.ts      # ChatGPT API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main boardroom interface
├── public/                        # Static assets
├── .env.local.example            # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## API Routes

### `/api/chat/claude`
Handles Claude API calls with conversation context.

### `/api/chat/gpt`
Handles ChatGPT API calls with conversation context.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **APIs:** Anthropic Claude, OpenAI GPT-4

## Cost Considerations

- **Vercel Free Tier:**
  - 100GB bandwidth/month
  - Unlimited function invocations
  - Perfect for personal use

- **API Costs:**
  - Claude API: Pay per token
  - OpenAI API: Pay per token
  - Monitor usage in respective dashboards

## Future Enhancements

- [ ] Supabase integration for persistent chat history
- [ ] User authentication
- [ ] Export conversations
- [ ] Add more AI models (Gemini, Perplexity)
- [ ] n8n middleware for complex orchestration
- [ ] Analytics and usage tracking

## Troubleshooting

**API Keys not working?**
- Make sure they're in `.env.local` for local dev
- For Vercel, add them in project settings → Environment Variables
- Redeploy after adding environment variables

**Build fails on Vercel?**
- Check that all dependencies are in `package.json`
- Ensure TypeScript errors are resolved
- Check Vercel build logs for specific errors

## License

MIT

## Author

Built with ❤️ for AI collaboration
