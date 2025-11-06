# Use standard Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p output

# Expose port
EXPOSE 7860

# Start application
CMD ["python3", "main.py"]