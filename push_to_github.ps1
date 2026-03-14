# Git Push Script for TrustScore AI
$repoUrl = "https://github.com/Sohel808035/HS-2026-162-HackStomp.git"

if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed on this system. Please install it from https://git-scm.com/" -ForegroundColor Red
    exit
}

Write-Host "Initializing Git..." -ForegroundColor Cyan
git init

Write-Host "Adding files..." -ForegroundColor Cyan
git add .

Write-Host "Commiting..." -ForegroundColor Cyan
git commit -m "Initial HackStomp Submission: TrustScore AI"

Write-Host "Setting remote origin..." -ForegroundColor Cyan
# Remove origin if it already exists
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

Write-Host "Done! Check your repo at $repoUrl" -ForegroundColor Green
