# 🤖 TrustWork - AI-Powered Escrow Platform

> **Hackathon MVP**: Decentralized freelance marketplace with AI validation and blockchain escrow

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)
![Status](https://img.shields.io/badge/Status-MVP-orange.svg)

---

## 🎯 The Problem

Traditional freelance platforms face three critical issues:

1. **Trust Gap**: Clients worry about work quality, freelancers worry about payment
2. **Slow Disputes**: Manual resolution takes weeks, burning time and money
3. **Generic AI Limitations**: ChatGPT and similar tools lack specialization for complex, niche tasks

---

## 💡 Our Solution

**TrustWork** is a decentralized platform that combines:

- **🔒 On-Chain Escrow**: USDT funds cryptographically locked in Tether smart contracts
- **🤖 AI Validation**: Multi-stage automated work quality assessment
- **⚖️ Fair Disputes**: AI-powered mediation with transparent resolution
- **🎓 Specialist AI Agents** *(Future)*: Custom-trained AI that can complete tasks and earn money

### How It Works Today (MVP)

```
┌─────────────┐
│   Client    │ Creates task + locks USDT on-chain
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Freelancer  │ Submits work
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI Agent   │ Validates in 4 stages (Quality, Requirements, Content, Decision)
└──────┬──────┘
       │
       ├─── Score ≥80 → ✅ Auto-release payment on-chain
       ├─── Score 60-79 → 👁️ Manual review required
       └─── Score <60 → ❌ Reject + detailed feedback
```

### Key Innovation: **No Trust Required**

- Platform **never controls** the funds
- Everything happens **on-chain** via Tether WDK
- AI validation is **transparent** and **reproducible**
- Disputes resolved in **minutes**, not weeks

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- 2GB free RAM

### One-Command Launch

```bash
git clone <repo-url>
cd TrustWork
./start.sh
```

That's it! Access at **http://localhost:3000**

### First Steps

1. **Connect Wallet**: Use any Ethereum address (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5`)
2. **Choose Role**: 
   - **Hire** (post tasks as client)
   - **Work** (complete tasks as freelancer)
   - **Both** (full flexibility)
3. **Create Task**: Post your first task with USDT budget
4. **Experience AI**: Submit work and watch AI validate it in real-time

---

## 🏗️ Architecture

### Current Stack (MVP)

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js 14)              │
│            Wallet Connection + Dashboard             │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                Backend API (Express + TypeScript)    │
│              REST endpoints + Business Logic         │
└───────┬──────────────┬──────────────┬───────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────┐    ┌──────────┐   ┌──────────────┐
│PostgreSQL│    │LangChain │   │  Tether WDK  │
│ Metadata │    │ AI Agent │   │ On-Chain $   │
└──────────┘    └──────────┘   └──────────────┘
```

### Multi-Stage AI Validation

**Stage 1: Quality Check** (30% weight)
- Professional presentation
- Structure and formatting
- Attention to detail

**Stage 2: Requirements Matching** (50% weight)
- Fulfillment of task description
- Completeness of deliverables
- Missing elements identification

**Stage 3: Content Verification** (20% weight)
- Originality assessment
- Depth and effort analysis
- Plagiarism detection

**Stage 4: Final Decision**
- Weighted score aggregation
- Auto-approve, Review, or Reject
- Detailed feedback generation

### Dispute Resolution (5 Stages)

1. **Evidence Collection**: Gather all claims and responses
2. **Party Assessment**: Evaluate validity of each side (0-100)
3. **Work Re-Validation**: Re-analyze with dispute context
4. **Fair Decision**: 5 outcome levels (100%, 75%, 50%, 25%, 0%)
5. **On-Chain Execution**: Automatic payment split via smart contract

---

## 🎓 Future Vision: Specialist AI Marketplace

### The Next Evolution

Today's AI (ChatGPT, Claude, etc.) is like a **general practitioner** - good at many things, master of none. But what if you could hire a **specialist**?

### 🤖 AI Agents as Service Providers

**Imagine this workflow:**

```
Client Posts Task → "Build a Rust blockchain indexer"
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   Available AI Agents (Specialist) │
        │                                    │
        │  🤖 RustExpert AI (trained on      │
        │     10,000 Rust codebases)         │
        │     Success Rate: 94%              │
        │     Price: 50 USDT                 │
        │                                    │
        │  🤖 BlockchainDev AI (specialized  │
        │     in Web3 + Rust)                │
        │     Success Rate: 89%              │
        │     Price: 75 USDT                 │
        │                                    │
        │  🤖 GenericAI (general purpose)    │
        │     Success Rate: 62%              │
        │     Price: 30 USDT                 │
        └────────────┬─────────────────────┘
                     │
                     ▼
        Client Chooses Specialist AI
                     │
                     ▼
        Funds Locked → AI Completes Task → Validation → Payment Released
```

### Why This Changes Everything

#### For AI Owners (Trainers)

- **💰 Monetize Your Models**: Train specialized AI, earn passive income
- **🎯 Niche Expertise**: Focus on specific domains (legal docs, CAD design, financial analysis)
- **📈 Build Reputation**: Higher success rate = higher pricing power
- **🔄 Continuous Earning**: AI works 24/7, completing tasks while you sleep

#### For Clients

- **🎯 Get Specialists, Not Generalists**: 
  - Generic ChatGPT: "I can try to help with that"
  - Specialist AI: "I've completed 1,000+ similar tasks with 95% approval"
  
- **⚡ Faster Results**: Specialized training = better output, less revision
- **💎 Quality Guarantee**: AI validation + on-chain escrow = zero risk
- **💵 Transparent Pricing**: See success rates before you pay

### Real-World Use Cases

#### 1. Legal Document Analysis
```
Task: "Review this 50-page contract for compliance issues"
Generic AI: May miss nuances, liability concerns
Specialist AI: Trained on 10,000+ legal documents, knows case law
Result: Professional-grade analysis in minutes
```

#### 2. CAD/3D Modeling
```
Task: "Convert these 2D blueprints to 3D CAD model"
Generic AI: Struggles with technical constraints
Specialist AI: Trained on engineering standards, material specs
Result: Manufacturing-ready files
```

#### 3. Financial Forecasting
```
Task: "Build revenue projection model for SaaS startup"
Generic AI: Generic formulas, no industry context
Specialist AI: Trained on 1,000+ SaaS financials, knows benchmarks
Result: Investor-ready model with industry comparisons
```

#### 4. Medical Literature Review
```
Task: "Summarize recent research on immunotherapy for melanoma"
Generic AI: Surface-level summary, potential inaccuracies
Specialist AI: Trained on PubMed, knows clinical terminology
Result: Research-grade synthesis with proper citations
```

### Why Not Just Use ChatGPT?

**Same reason you hire a consultant instead of asking a friend:**

| Generic AI (ChatGPT) | Specialist AI on TrustWork |
|---------------------|---------------------------|
| ❌ General knowledge | ✅ Domain expertise |
| ❌ No quality guarantee | ✅ On-chain escrow + validation |
| ❌ One-size-fits-all | ✅ Trained on specific tasks |
| ❌ No accountability | ✅ Reputation system + refunds |
| ❌ Manual quality check | ✅ Multi-stage AI validation |
| ❌ No payment protection | ✅ Smart contract escrow |

### Economic Model

**For AI Trainers:**
```
1. Train specialized AI model (one-time effort)
2. List on TrustWork marketplace
3. Set pricing based on complexity
4. Earn 90% of each completed task
5. Build reputation → charge premium prices
```

**Platform Economics:**
```
Task Budget: 100 USDT
├─ AI Agent Owner: 90 USDT (90%)
├─ Platform Fee: 5 USDT (5%)
└─ Validator Rewards: 5 USDT (5%)
```

### Technical Implementation (Future)

```python
# AI Agent Integration API
class SpecialistAI:
    def __init__(self, model_id, specialty):
        self.model_id = model_id
        self.specialty = specialty
        self.success_rate = load_reputation()
    
    async def complete_task(self, task_description, budget):
        # AI executes task
        result = await self.model.generate(task_description)
        
        # Submit to platform validation
        validation = await platform.validate(result, task_description)
        
        # If approved, payment released on-chain
        if validation.approved:
            await blockchain.release_payment(budget, self.wallet_address)
        
        return result
```

### Integration Points

1. **AI Model Registry**: Public listing of available specialist AI
2. **Reputation System**: On-chain record of success rates
3. **Pricing Oracle**: Dynamic pricing based on demand + reputation
4. **Quality Benchmarks**: Domain-specific validation criteria
5. **Training Marketplace**: Datasets for training new specialists

---

## 🔥 Current Features (MVP)

### ✅ Implemented

- [x] Wallet-based authentication (no passwords!)
- [x] Role selection (Client, Freelancer, Both)
- [x] Task creation with USDT budgets
- [x] On-chain escrow with Tether WDK
- [x] Multi-stage AI work validation (LangChain + GPT-4)
- [x] 5-stage dispute resolution system
- [x] Reputation scoring
- [x] AI chat assistant
- [x] Docker one-command deployment
- [x] Full TypeScript stack
- [x] PostgreSQL with Sequelize ORM
- [x] Next.js 14 with App Router
- [x] Responsive UI with Tailwind + shadcn/ui

### 🚧 Coming Soon (Post-Hackathon)

- [ ] AI Agent Marketplace (specialist AI integration)
- [ ] AI Model Registry & Discovery
- [ ] Training Dataset Marketplace
- [ ] Real-time notifications via WebSocket
- [ ] File upload for submissions
- [ ] Multi-currency support (ETH, BTC)
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] DAO governance for platform decisions
- [ ] Staking mechanism for AI validators

---

## 🧪 Demo Flow

### As a Client (Hiring)

1. **Connect Wallet** → Choose "Hire" role
2. **Create Task**: 
   - Title: "Build a Shopify integration"
   - Description: Detailed requirements
   - Budget: 500 USDT
3. **Lock Funds**: Initiate on-chain escrow transaction
4. **Assign Freelancer**: Choose from applicants
5. **Review Work**: Automatically validated by AI
6. **Payment Released**: If approved, funds go to freelancer

### As a Freelancer (Working)

1. **Connect Wallet** → Choose "Work" role
2. **Browse Tasks**: See available opportunities
3. **Apply**: Submit proposal
4. **Get Assigned**: Client selects you
5. **Submit Work**: Upload deliverables
6. **Get Paid**: If AI validates, receive USDT on-chain

### As AI Validation

```
Submission Received
  ↓
Stage 1: Quality = 85/100 ✅
  ↓
Stage 2: Requirements = 90/100 ✅
  ↓
Stage 3: Content = 88/100 ✅
  ↓
Stage 4: Final Score = 88.5/100
  ↓
Decision: AUTO-APPROVE ✅
  ↓
Smart Contract Releases 500 USDT to Freelancer
```

---

## 📊 Technical Highlights

### On-Chain Escrow

```typescript
// Real blockchain integration, not simulated
await walletService.lockFunds(
  clientPrivateKey,
  amount,
  taskId
);
// Returns: { txHash: '0x...', contractAddress: '0x...' }
// Verifiable on blockchain explorer
```

### Multi-Stage Validation

```typescript
// 4 independent AI analysis stages
const stage1 = await aiService.validateWorkQuality(content);
const stage2 = await aiService.validateRequirements(content, description);
const stage3 = await aiService.validateContent(content);
const decision = await aiService.makeFinalDecision(
  stage1.score,
  stage2.score,
  stage3.score
);
// Weighted: 30% + 50% + 20% = Final Decision
```

### Dispute Resolution

```typescript
// 5-stage AI mediation
const evidence = await aiService.collectDisputeEvidence(...);
const assessment = await aiService.assessEachParty(evidence);
const revalidation = await aiService.revalidateSubmission(...);
const resolution = await aiService.makeDisputeDecision(...);
// Outcomes: 100%, 75%, 50%, 25%, or 0% to freelancer
// Executed on-chain automatically
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 15 with Sequelize ORM
- **AI**: LangChain + OpenAI GPT-4
- **Blockchain**: Tether WDK (Wallet Development Kit)
- **Security**: JWT, Helmet, Rate Limiting, Zod Validation

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **API Client**: Axios with interceptors

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL with auto-migrations
- **Development**: Hot-reload for both services

---

## 📚 API Documentation

### Authentication
```bash
POST /api/users/connect
Body: { walletAddress: "0x...", role: "both" }
Response: { user: {...}, token: "..." }
```

### Tasks
```bash
POST /api/tasks
Body: { title: "...", description: "...", budget: 100 }

GET /api/tasks?status=open&role=client
Response: { tasks: [...] }
```

### AI Validation
```bash
POST /api/submissions/:id/validate
Response: {
  qualityScore: 85,
  requirementScore: 90,
  contentScore: 88,
  finalScore: 88.5,
  decision: "auto_approve"
}
```

### Escrow
```bash
POST /api/escrow/lock
Body: { taskId: "...", clientPrivateKey: "0x..." }
Response: { txHash: "0x...", contractAddress: "0x..." }

POST /api/escrow/release
Body: { taskId: "..." }
Response: { txHash: "0x...", status: "success" }
```

---

## 🔐 Security

### What We Do Right

✅ **Private keys never stored** (only wallet addresses)  
✅ **Funds locked on-chain** (platform never controls money)  
✅ **Transaction verification** (all blockchain ops verified)  
✅ **Input validation** (Zod schemas on all endpoints)  
✅ **Rate limiting** (prevent API abuse)  
✅ **CORS policies** (restricted origins)  

### Production Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Use mainnet for real USDT
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Implement proper logging
- [ ] Add multi-sig for large amounts
- [ ] Audit smart contract interactions

---

## 🎮 Simulation Mode

**Perfect for demos and testing!**

Without API keys, the platform runs in **simulation mode**:
- ✅ Mock blockchain transactions
- ✅ Simulated AI validation with realistic scores
- ✅ Full UI functionality
- ✅ Zero external dependencies

To enable real features:
```bash
# Edit .env
OPENAI_API_KEY=sk-your-key-here
WDK_API_KEY=your-wdk-key-here

# Restart
docker-compose restart backend
```

---

## 🤝 Contributing

This is a hackathon MVP! Post-hackathon, we welcome:

- Bug reports and fixes
- Feature suggestions
- UI/UX improvements
- Documentation enhancements
- AI model integration ideas

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file

---

## 🏆 Why TrustWork Wins

### Innovation
- ✨ **First** to combine multi-stage AI validation with on-chain escrow
- ✨ **Trustless** system where platform never controls funds
- ✨ **Future-ready** with AI agent marketplace vision

### Technical Excellence
- 💪 Production-ready TypeScript codebase
- 💪 Clean architecture (MVC pattern)
- 💪 Comprehensive error handling
- 💪 Docker containerization
- 💪 RESTful API design

### User Experience
- 🎯 One-command deployment
- 🎯 Wallet-based auth (no passwords!)
- 🎯 Intuitive UI with real-time feedback
- 🎯 Works without API keys (simulation mode)

### Business Potential
- 💰 Clear monetization path (platform fees)
- 💰 Massive TAM (global freelance market = $1.5T)
- 💰 AI marketplace creates new revenue streams
- 💰 Network effects (more AI = more value)

---

## 👥 Team

Built for [Hackathon Name] by passionate builders who believe AI and blockchain can solve the trust problem in online work.

---

## 📧 Contact

- Demo: http://localhost:3000
- Documentation: This README
- Issues: GitHub Issues

---

**🚀 Start building the future of work with TrustWork!**

*Where AI specialists meet blockchain trust.*
