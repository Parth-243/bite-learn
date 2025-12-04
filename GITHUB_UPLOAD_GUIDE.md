# GitHub Upload Instructions for BiteLearn

Your BiteLearn project is now initialized with Git! Follow these steps to upload it to GitHub.

## Steps to Push to GitHub

### 1. Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and log in
2. Click the **+** icon in the top right → **New repository**
3. Fill in the details:
   - **Repository name**: `bite-learn`
   - **Description**: "A modern microlearning platform with Next.js, TypeScript, Tailwind CSS, and Supabase"
   - **Visibility**: Public (or Private if preferred)
   - **Initialize repository**: Do NOT check "Add a README file" (we already have one)
4. Click **Create repository**

### 2. Add Remote and Push to GitHub

Copy the repository URL from GitHub (e.g., `https://github.com/yourusername/bite-learn.git`)

Then run these commands in your terminal:

```bash
cd "d:\QuickLearn app\bite-learn"

# Add the remote repository
git remote add origin https://github.com/yourusername/bite-learn.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. Verify Upload

Visit your GitHub repository URL to confirm all files are uploaded:

- `https://github.com/yourusername/bite-learn`

## What's Included in the Repository

✅ **Source Code**

- Next.js App Router pages
- React components
- TypeScript configuration
- Tailwind CSS setup

✅ **Configuration Files**

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variables template

✅ **Documentation**

- `README.md` - Complete project documentation
- Setup instructions
- Feature list
- API documentation
- Deployment guide

## Important: Environment Variables

⚠️ **Do NOT commit `.env.local`** - It's in `.gitignore` for security!

Create a `.env.example` file for other developers:

```env
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GROQ_API_KEY=your_groq_api_key_here
```

## Cloning the Repository

Others can now clone your project:

```bash
git clone https://github.com/yourusername/bite-learn.git
cd bite-learn
npm install
cp .env.example .env.local
# Edit .env.local with their credentials
npm run dev
```

## Git Workflow

### Making Changes

```bash
# Create a new branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create a Pull Request on GitHub
```

### Useful Commands

```bash
# View commit history
git log

# View changes
git status
git diff

# Undo changes
git restore <file>

# View branches
git branch -a
```

## GitHub Features to Enable

1. **GitHub Pages** (optional)

   - Go to Settings → Pages
   - Deploy from `main` branch (for documentation)

2. **GitHub Actions** (optional)

   - CI/CD pipeline for testing and deployment

3. **Discussions** (optional)
   - Enable for community discussions

## Deployment

### Option 1: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables
5. Deploy!

Your app will be live at: `https://bite-learn.vercel.app`

### Option 2: GitHub Pages + GitHub Actions

Use GitHub Actions to build and deploy automatically.

## Next Steps

- ✅ Commit code to GitHub
- ✅ Add collaborators (Settings → Manage access)
- ✅ Enable branch protection rules
- ✅ Set up CI/CD with GitHub Actions
- ✅ Deploy to Vercel or your hosting platform
- ✅ Configure custom domain

## Troubleshooting

### "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/yourusername/bite-learn.git
```

### "rejected ... push would lose commits"

```bash
git pull origin main --rebase
git push origin main
```

### "Authentication failed"

Use a GitHub Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create a token with `repo` scope
3. Use the token as your password

---

**Your BiteLearn project is ready for GitHub! 🚀**

For more help, visit [GitHub Docs](https://docs.github.com)
