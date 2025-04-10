import os
import pickle
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        os.getenv('DATABASE_URL'),
        cursor_factory=RealDictCursor
    )
    return conn

# Load genre relationships if available
try:
    with open('models/genre_relationships.pkl', 'rb') as f:
        genre_relationships = pickle.load(f)
    print("Genre relationships loaded successfully")
except Exception as e:
    print(f"Error loading genre relationships: {e}")
    # Fallback genre relationships
    genre_relationships = {
        # Sports hierarchy
        "sport": {
            "football": 0.9,
            "basketball": 0.9,
            "tennis": 0.9,
            "cricket": 0.9,
            "swimming": 0.9,
            "athletics": 0.9,
            "fitness": 0.8,
            "health": 0.7
        },
        "football": {
            "sport": 0.9,
            "soccer": 0.95
        },
        "basketball": {
            "sport": 0.9
        },
        "tennis": {
            "sport": 0.9
        },
        "cricket": {
            "sport": 0.9
        },
        
        # Art and culture
        "art": {
            "painting": 0.9,
            "sculpture": 0.9,
            "photography": 0.8,
            "music": 0.7,
            "dance": 0.7,
            "theater": 0.7,
            "literature": 0.6
        },
        "music": {
            "art": 0.7,
            "dance": 0.6
        },
        
        # Science categories
        "science": {
            "physics": 0.9,
            "chemistry": 0.9,
            "biology": 0.9,
            "astronomy": 0.9,
            "mathematics": 0.8,
            "psychology": 0.6,
            "computer science": 0.8
        },
        
        # Fiction categories
        "fiction": {
            "mystery": 0.8,
            "thriller": 0.8,
            "romance": 0.7,
            "science fiction": 0.8,
            "fantasy": 0.8,
            "historical fiction": 0.8,
            "horror": 0.7,
            "adventure": 0.8
        }
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok"
    })

def calculate_similarity(genre1, genre2):
    """Calculate similarity between two genres"""
    # Convert to lowercase for comparison
    g1 = genre1.lower()
    g2 = genre2.lower()
    
    # Exact match
    if g1 == g2:
        return 1.0
    
    # Check relationship dictionary
    if g1 in genre_relationships and g2 in genre_relationships[g1]:
        return genre_relationships[g1][g2]
    
    # Reverse check
    if g2 in genre_relationships and g1 in genre_relationships[g2]:
        return genre_relationships[g2][g1]
    
    # Word matching as fallback
    words1 = g1.split()
    words2 = g2.split()
    
    # Count matching words
    matching_words = len(set(words1).intersection(set(words2)))
    if matching_words > 0:
        return matching_words / max(len(words1), len(words2))
    
    # Default low similarity
    return 0.1

@app.route('/api/recommendations/<book_id>', methods=['GET'])
def get_recommendations(book_id):
    try:
        # Get limit parameter, default is 5
        limit = request.args.get('limit', default=5, type=int)
        
        # Connect to the database and get books
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get the source book
        cur.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        source_book = cur.fetchone()
        
        if not source_book:
            return jsonify({"error": "Book not found"}), 404
        
        # Get all other books
        cur.execute("SELECT * FROM books WHERE id != %s", (book_id,))
        other_books = cur.fetchall()
        
        # Close database connection
        cur.close()
        conn.close()
        
        # Get source genre and process it
        source_genre = source_book['genre'].lower()
        
        # Calculate similarity for each book
        similarity_scores = []
        for i, book in enumerate(other_books):
            book_genre = book['genre'].lower()
            score = calculate_similarity(source_genre, book_genre)
            similarity_scores.append((i, score))
        
        # Sort by similarity score (highest first)
        similarity_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Get top N recommendations
        top_indices = [i for i, _ in similarity_scores[:limit]]
        
        # Format recommendations
        recommendations = []
        for idx in top_indices:
            book = other_books[idx]
            recommendations.append({
                "id": book['id'],
                "title": book['title'],
                "author": book['author'],
                "genre": book['genre'],
                "coverUrl": book['cover_url'],
                "coverColor": book['cover_color'],
                "rating": book['rating'],
                "totalCopies": book['total_copies'],
                "availableCopies": book['available_copies'],
                "description": book['description'],
                "videoUrl": book['video_url'],
                "summary": book['summary'],
                "similarityScore": similarity_scores[top_indices.index(idx)][1]
            })
        
        return jsonify({
            "success": True,
            "sourceBook": {
                "id": source_book['id'],
                "title": source_book['title'],
                "genre": source_book['genre']
            },
            "recommendations": recommendations
        })
    
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False) 