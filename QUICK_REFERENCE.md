# AI Verifier - Quick Reference

## 🚀 Quick Start (3 Steps)

### Option A: Automated Setup (Recommended)

```bash
# 1. Run setup script
./setup.sh          # macOS/Linux
setup.bat           # Windows

# 2. Start both services
npm install         # Install root dependencies (concurrently)
npm run dev         # Starts backend and frontend together

# 3. Open browser
# Go to http://localhost:3000
```

### Option B: Manual Setup

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# Edit .env with MySQL password
npm run init-db
npm run dev         # Runs on port 3001

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev         # Runs on port 3000

# 3. Open browser
# Go to http://localhost:3000
```

## 🔧 Common Commands

```bash
# Root directory
npm run setup       # Install all dependencies
npm run dev         # Start both services
npm run init-db     # Initialize database

# Backend only
cd backend
npm run dev         # Development mode with auto-reload
npm start           # Production mode
npm run init-db     # Create/reset database

# Frontend only
cd frontend
npm run dev         # Development mode
npm run build       # Build for production
npm run preview     # Preview production build
```

## 📝 Configuration Checklist

### 1. MySQL Database
- [ ] MySQL installed and running
- [ ] Password set for root user
- [ ] Database `ai_verifier` created (auto-created by init-db)

### 2. Backend Configuration (`backend/.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE  # ⚠️ Change this!
DB_NAME=ai_verifier
DB_PORT=3306
```

### 3. AI Providers (via Settings UI)
- [ ] Add at least 2 AI providers
- [ ] One provider marked as "Verifier"
- [ ] All providers are "Active"

### Required: OpenAI Example
```
Name: OpenAI GPT-4
Type: OpenAI
API Key: sk-...your-key...
Model: gpt-4
Verifier: YES
Active: YES
```

## 🎯 First Time Usage

1. **Open App**: http://localhost:3000
2. **Go to Settings** → Click "Settings" in top menu
3. **Add AI Provider**:
   - Click "Add Provider" button
   - Enter OpenAI API key (get from https://platform.openai.com/api-keys)
   - Set model to `gpt-4` or `gpt-3.5-turbo`
   - Toggle "Use as Verifier" ON
   - Click "Add"
4. **Add More Providers** (optional but recommended):
   - Add another provider with different model
   - Keep "Use as Verifier" OFF for these
5. **Start Chatting**:
   - Click "Chat" in top menu
   - Click "New Chat"
   - Type a question
   - Click "Send"

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p

# Check port 3001 is not in use
lsof -ti:3001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3001   # Windows

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Check port 3000 is not in use
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
# Reset database
cd backend
npm run init-db

# If still failing, check MySQL connection
mysql -u root -p
# Then run: SHOW DATABASES;
```

### "No AI providers configured"
- Go to Settings page
- Add at least one provider with valid API key
- Make sure provider is "Active"
- Make sure at least one is "Verifier"

### API Key errors
- Verify key is correct (check for spaces)
- Ensure you have credits/quota
- Try different model (gpt-3.5-turbo is cheaper)

## 📊 Project Structure

```
ai-verifier/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/   # Database setup
│   │   ├── models/   # Database models
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # AI integrations
│   │   └── index.js  # Server entry
│   └── .env          # Configuration (YOU CREATE THIS)
│
├── frontend/         # React + Ant Design
│   ├── src/
│   │   ├── pages/    # ChatPage, SettingsPage
│   │   └── services/ # API client
│   └── .env          # Optional configuration
│
├── setup.sh          # Automated setup
├── start.sh          # Quick start
├── QUICKSTART.md     # Detailed guide
└── DEPLOYMENT.md     # Deployment options
```

## 🌐 API Endpoints

Base URL: `http://localhost:3001/api`

### AI Providers
- `GET /ai-providers` - List all
- `POST /ai-providers` - Add new
- `PUT /ai-providers/:id` - Update
- `DELETE /ai-providers/:id` - Remove
- `PATCH /ai-providers/:id/active` - Toggle status

### Chats
- `GET /chats` - List all chats
- `POST /chats` - Create new chat
- `GET /chats/:id/messages` - Get messages
- `POST /chats/:id/messages` - Send message
- `DELETE /chats/:id` - Delete chat

## 💡 Tips

- **Save API costs**: Use `gpt-3.5-turbo` instead of `gpt-4`
- **Speed up responses**: Fewer providers = faster results
- **Test connectivity**: Visit http://localhost:3001/api/health
- **Reset everything**: Run `npm run init-db` again
- **View logs**: Check terminal where services are running

## 🚢 Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)

**Easiest option**: Railway (Free tier)
1. Sign up at railway.app
2. Deploy MySQL database
3. Deploy backend (connect to MySQL)
4. Deploy frontend on Vercel (free)

**Cost**: $0-5/month

## 📚 More Help

- **Setup Issues**: See [QUICKSTART.md](QUICKSTART.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Features**: See [README.md](README.md)

## 🔑 Getting API Keys

### OpenAI
1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create new secret key
5. Copy and save it (shows only once!)

### Anthropic Claude
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Go to API Keys
4. Create key
5. Copy it

### Costs
- OpenAI GPT-3.5: ~$0.002 per 1K tokens
- OpenAI GPT-4: ~$0.03 per 1K tokens
- Claude: Similar to GPT-4

A typical chat message costs $0.001 - $0.01

## 📞 Support

Issues or questions? Check:
1. This Quick Reference
2. [QUICKSTART.md](QUICKSTART.md) for detailed setup
3. Terminal logs for error messages
4. Database connection with `mysql -u root -p`

---

**Ready to start?**

```bash
./setup.sh && npm install && npm run dev
```

Then open http://localhost:3000 🚀
