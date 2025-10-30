

//INSTALLATION DU PROJET
npm create astro@latest XRPwebsite
cd C:\Users\xavie\XRPwebsite
npm run dev
npm run build
npx astro preview
   
//LOCAL URL
http://localhost:4321/   
demo.we-theagency.com
   

//GitHub token 
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
git remote set-url origin https://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@github.com/xavierperruche-byte/XRPwebsite.git 



//Git commands

# Check status of changes
git status

# Add all changed files
git add .

# Or add specific file
git add src/pages/contact.astro

# Commit changes with message
git commit -m "Enhance Index Page"

# Push to GitHub
git push

# Pull latest changes (if working from multiple devices)
git pull

# View commit history
git log --oneline

# Create a new branch for features
git checkout -b feature/new-feature

# Switch back to main branch
git checkout main

# Merge branch into main
git merge feature/new-feature