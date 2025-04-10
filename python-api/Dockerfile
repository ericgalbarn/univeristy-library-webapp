FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create models directory (if it doesn't exist)
RUN mkdir -p models

# Expose the port (Railway sets PORT env var)
ENV PORT=5000
EXPOSE ${PORT}

# Command to run the application
CMD gunicorn --bind 0.0.0.0:${PORT} app:app 