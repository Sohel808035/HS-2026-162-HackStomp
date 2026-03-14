#!/bin/bash
echo "Preparing for Heroku Deployment..."

# Initialize Heroku CLI login
heroku login

# Create a new app (leave name blank for random)
heroku create

# Add buildpack for Python
heroku buildpacks:add --index 1 heroku/python

# Deploying via Git
git init
git add .
git commit -m "Initial Trust Score App Deployment"
git branch -M main
git push heroku main

# Scale dyno
heroku ps:scale web=1

echo "Deployment Successful!"
