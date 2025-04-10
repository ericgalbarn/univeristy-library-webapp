FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create models directory (if it doesn't exist)
RUN mkdir -p models

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose the default port
EXPOSE 5000

# Command to run the application
CMD ["/app/entrypoint.sh"] 