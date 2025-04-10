import os
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def root():
    return "API is running"

@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "port": os.environ.get("PORT", "5000"),
        "environment": os.environ
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True) 