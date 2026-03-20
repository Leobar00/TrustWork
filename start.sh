#!/bin/bash

echo "🚀 TrustWork - AI Escrow Platform"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Note: The platform will run in SIMULATION MODE"
    echo "   To use real AI and blockchain:"
    echo "   1. Edit .env file"
    echo "   2. Add your OPENAI_API_KEY"
    echo "   3. Add your WDK_API_KEY"
    echo ""
fi

echo "🐳 Starting Docker containers..."
echo ""

# Start Docker Compose (try new syntax first, fall back to old)
if command -v docker &> /dev/null; then
    docker compose up -d
elif command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    echo "❌ Error: Docker is not installed or not in PATH"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running (try new syntax first)
if command -v docker &> /dev/null; then
    if docker compose ps | grep -q "Up"; then
        SERVICES_UP=true
    else
        SERVICES_UP=false
    fi
elif command -v docker-compose &> /dev/null; then
    if docker-compose ps | grep -q "Up"; then
        SERVICES_UP=true
    else
        SERVICES_UP=false
    fi
else
    SERVICES_UP=false
fi

if [ "$SERVICES_UP" = true ]; then
    echo ""
    echo "✅ TrustWork is running!"
    echo ""
    echo "🌐 Access the platform:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:4000"
    echo "   Health:    http://localhost:4000/health"
    echo ""
    echo "📖 Quick Start:"
    echo "   1. Open http://localhost:3000"
    echo "   2. Connect with any wallet address (0x...)"
    echo "   3. Create your first task!"
    echo ""
    echo "🛑 To stop: docker compose down"
    if command -v docker &> /dev/null; then
        echo "📋 View logs: docker compose logs -f"
    else
        echo "📋 View logs: docker-compose logs -f"
    fi
    echo ""
else
    echo ""
    echo "❌ Error: Services failed to start"
    if command -v docker &> /dev/null; then
        echo "Run 'docker compose logs' to see the error"
    else
        echo "Run 'docker-compose logs' to see the error"
    fi
    exit 1
fi
