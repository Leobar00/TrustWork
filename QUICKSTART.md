# TrustWork - Quick Reference

## Start the Platform

```bash
# Single command to start everything
./start.sh

# Or manually with Docker Compose
docker-compose up
```

Access at: **http://localhost:3000**

## First Steps

1. **Connect Wallet**: Use any Ethereum address format
   - Example: `0x1234567890123456789012345678901234567890`
   
2. **Create Task**:
   - Title: "Build a website"
   - Description: Detailed requirements
   - Budget: 100 USDT

3. **Test AI Validation**:
   - Assign freelancer
   - Submit work
   - Watch AI analyze in 4 stages

## Key Features

### On-Chain Escrow
- Funds locked in smart contract
- Platform never controls money
- All transactions on blockchain

### AI Validation (4 Stages)
1. Quality Check (30%)
2. Requirements Match (50%)
3. Content Verification (20%)
4. Final Decision

### Dispute Resolution (5 Stages)
1. Evidence Collection
2. Party Assessment
3. Work Re-Validation
4. Fair Decision (5 outcomes: 100%, 75%, 50%, 25%, 0%)
5. On-Chain Execution

## API Quick Reference

### Connect Wallet
```bash
POST /api/users/connect
{
  "walletAddress": "0x..."
}
```

### Create Task
```bash
POST /api/tasks
{
  "title": "Task name",
  "description": "Details",
  "budget": 100
}
```

### Lock Funds (On-Chain)
```bash
POST /api/escrow/lock
{
  "taskId": "uuid",
  "clientPrivateKey": "0x..."
}
```

### Submit Work
```bash
POST /api/submissions
{
  "taskId": "uuid",
  "content": "Deliverables"
}
```

### Validate with AI
```bash
POST /api/submissions/:id/validate
```

### Raise Dispute
```bash
POST /api/disputes
{
  "taskId": "uuid",
  "reason": "Explanation"
}
```

### Resolve Dispute with AI
```bash
POST /api/disputes/:id/resolve
```

## Docker Commands

```bash
# Start
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Clean restart
docker-compose down -v && docker-compose up
```

## Troubleshooting

### Port Already in Use
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8080:3000"  # Frontend
  - "8081:4000"  # Backend
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up
```

### View Backend Logs
```bash
docker-compose logs backend
```

## Simulation Mode

Without API keys, the platform runs in **simulation mode**:
- ✅ Mock blockchain transactions
- ✅ Simulated AI validation
- ✅ Full UI functionality
- ✅ Perfect for demos

To enable real features, add to `.env`:
```env
OPENAI_API_KEY=sk-your-key
WDK_API_KEY=your-wdk-key
```

## Project Structure

```
TrustWork/
├── docker-compose.yml    # Start here
├── start.sh              # Quick start script
├── .env                  # Your configuration
├── backend/              # Express + TypeScript
│   ├── src/
│   │   ├── server.ts
│   │   ├── services/
│   │   │   ├── aiService.ts      # LangChain AI
│   │   │   └── walletService.ts  # Blockchain
│   │   ├── models/               # Database
│   │   └── controllers/          # API logic
└── frontend/             # Next.js 14
    └── src/
        ├── app/
        │   ├── page.tsx          # Landing
        │   └── dashboard/        # Main app
        └── components/           # UI components
```

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **Database**: localhost:5432

## Demo Workflow

1. Connect wallet → Dashboard appears
2. Create task → Escrow created
3. Lock funds → On-chain transaction
4. Freelancer submits → AI validates
5. Auto-payment or dispute → Resolution

## Support

- Full docs: README.md
- Logs: `docker-compose logs -f`
- Issues: Check Docker status first

---

**For Hackathon Judges**: Everything runs with one command (`./start.sh`). No setup required!
