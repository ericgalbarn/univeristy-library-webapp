# Python ML API Deployment Guide

This document explains how to deploy the Python ML API that powers the book recommendation engine.

## 1. Local Development

To run the API locally for development:

```bash
# Navigate to the python-api directory
cd python-api

# Install dependencies
pip install -r requirements.txt

# Copy your model files to the models directory
cp path/to/tfidf_vectorizer.pkl models/
cp path/to/genre_relationships.pkl models/

# Set up environment variables
# Create a .env file with:
# DATABASE_URL=postgresql://username:password@host:port/dbname
# PORT=5000

# Run the application
python app.py
```

## 2. Using Docker Compose (Development)

The easiest way to run both the Next.js app and the Python API together is using Docker Compose:

```bash
# From the project root
docker-compose up
```

This will:

- Build and start the Python API container
- Mount your model files to the container
- Start the Next.js development server
- Connect the two services

## 3. Production Deployment Options

### Option 1: Deploying to Heroku

```bash
# From the python-api directory
heroku create your-ml-api-name
heroku config:set DATABASE_URL=your-neon-db-url
git init
heroku git:remote -a your-ml-api-name
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option 2: Deploying to Railway

1. Create a new project in Railway
2. Connect your GitHub repository or use Railway's CLI
3. Set the following:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
   - Environment variables: `DATABASE_URL`

### Option 3: Deploying to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login

# Launch application (from python-api directory)
fly launch

# Set secrets
fly secrets set DATABASE_URL=your-neon-db-url

# Deploy
fly deploy
```

## 4. Updating the Next.js Application

After deploying the Python API, update your Next.js application's environment variables to point to your deployed API:

```
PYTHON_API_URL=https://your-deployed-api-url
```

## 5. Model Files

Ensure your model files are available in the `models` directory of your deployed application:

- `tfidf_vectorizer.pkl`: The trained TF-IDF vectorizer
- `genre_relationships.pkl`: The genre relationship data

Some deployment platforms may require you to include these files in your repository or upload them as part of the deployment process.

## Troubleshooting

If you encounter any issues with the API:

1. Check the logs: `heroku logs --tail` or equivalent for your platform
2. Verify the model files are being loaded correctly
3. Test the database connection
4. Ensure the environment variables are set correctly

For production performance, consider:

1. Adding caching to reduce database load
2. Implementing rate limiting
3. Setting up monitoring and error tracking
