# ML-Based Book Recommendation System

This document explains how to use the machine learning-based book recommendation system that you've implemented.

## Overview

The recommendation system uses a trained model to suggest books based on genre similarity. It provides more intelligent and semantically meaningful recommendations than simple text matching.

## Architecture

1. **ML Model Training**:

   - Model trained in Google Colab using TF-IDF and similarity metrics
   - Trained model exported as pickle files

2. **Python API**:

   - Flask API that uses the trained model
   - Connects directly to your Neon PostgreSQL database
   - Provides recommendations via a REST API

3. **Next.js Integration**:
   - Proxy API in Next.js that calls the Python API
   - React component to display recommendations
   - Fallback to simple recommendations if the ML API is unavailable

## Setup Instructions

### 1. Move Your Model Files

Move the trained model files to the appropriate directories:

```bash
# Create the models directory if it doesn't exist
mkdir -p python-api/models
mkdir -p lib/models

# Copy the files
cp path/to/tfidf_vectorizer.pkl python-api/models/
cp path/to/genre_relationships.pkl python-api/models/
cp path/to/books_reference.csv python-api/models/

# Also copy to lib/models for backup
cp path/to/tfidf_vectorizer.pkl lib/models/
cp path/to/genre_relationships.pkl lib/models/
cp path/to/books_reference.csv lib/models/
```

### 2. Run Locally Using Docker Compose

The easiest way to run both the Next.js app and the Python API together is with Docker Compose:

```bash
# From the project root
docker-compose up
```

This will start both the Next.js app and the Python API in development mode.

### 3. Run Manually (Alternative)

If you prefer not to use Docker, you can run both services manually:

**Python API:**

```bash
cd python-api
pip install -r requirements.txt
python app.py
```

**Next.js App:**

```bash
npm run dev
```

## How It Works

1. When a user views a book, the `MLBookRecommendations` component makes a request to `/api/ml-recommendations/[bookId]`
2. The Next.js API proxies this request to the Python API
3. The Python API:
   - Loads the book data from the database
   - Uses the TF-IDF vectorizer to transform genre text
   - Calculates similarity between books
   - Returns ranked recommendations
4. The React component displays the recommendations

## Fallback Mechanism

If the Python API is unavailable, the system will automatically fall back to the simpler TypeScript-based recommendation engine that's built into the Next.js app.

## Deployment

For deployment instructions, see `python-api/DEPLOYMENT.md`.

## Customizing the Model

To improve the model:

1. Update your Google Colab notebook with new techniques
2. Re-export the model files
3. Replace the files in the `models` directories
4. Restart the Python API

## Troubleshooting

If recommendations don't appear:

1. Check the browser console for errors
2. Verify the Python API is running (`http://localhost:5000/api/health`)
3. Check if the model files are loaded correctly
4. Ensure the database connection is working

## Additional Resources

- [Scikit-learn Documentation](https://scikit-learn.org/stable/documentation.html)
- [TF-IDF Explained](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction)
- [Cosine Similarity](https://scikit-learn.org/stable/modules/metrics.html#cosine-similarity)
