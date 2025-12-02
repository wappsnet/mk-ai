# Quick Start Guide - AI Verifier

This guide will help you get the AI Verifier application running locally in just a few minutes.

## Prerequisites

Before you start, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
3. At least one **AI API Key**:
   - OpenAI API key: [Get it here](https://platform.openai.com/api-keys)
   - OR Anthropic API key: [Get it here](https://console.anthropic.com/)

## Step 1: Install MySQL (if not already installed)

### On macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### On Windows:
Download and install from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)

### Set MySQL Root Password (if needed):
```bash
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
EXIT;
```

## Step 2: Setup Backend

Open a terminal and run:

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your settings
nano .env
```

Update the `.env` file with your MySQL password:
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=ai_verifier
DB_PORT=3306

VERIFIER_AI_PROVIDER=openai
VERIFIER_AI_MODEL=gpt-4
```

Save and close the file (Ctrl+X, then Y, then Enter if using nano).

### Initialize the Database:
```bash
npm run init-db
```

You should see:
```
Creating database...
Creating tables...
Database initialized successfully!
```

### Start the Backend Server:
```bash
npm run dev
```

You should see:
```
🚀 AI Verifier Backend is running on port 3001
📡 API endpoint: http://localhost:3001/api
💚 Health check: http://localhost:3001/api/health
```

**Keep this terminal open!**

## Step 3: Setup Frontend

Open a **NEW terminal window** and run:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Keep this terminal open too!**

## Step 4: Open the Application

Open your web browser and go to:
```
http://localhost:3000
```

You should see the AI Verifier interface!

## Step 5: Configure AI Providers

1. Click on **Settings** in the top menu
2. Click **Add Provider** button
3. Fill in the form:

### Example: Add OpenAI
- **Provider Name**: OpenAI GPT-4
- **Provider Type**: OpenAI
- **API Key**: sk-... (your OpenAI API key)
- **Model**: gpt-4 (or gpt-3.5-turbo for faster/cheaper)
- **Use as Verifier**: OFF (for now)
- **Active**: ON

4. Click **Add**

### Add Another Provider (for comparison)
- **Provider Name**: OpenAI GPT-3.5
- **Provider Type**: OpenAI
- **API Key**: sk-... (same OpenAI API key)
- **Model**: gpt-3.5-turbo
- **Use as Verifier**: OFF
- **Active**: ON

### Add Verifier AI
- **Provider Name**: Verifier AI
- **Provider Type**: OpenAI
- **API Key**: sk-... (same or different API key)
- **Model**: gpt-4
- **Use as Verifier**: ON ⭐ (Important!)
- **Active**: ON

**Note**: You need at least 2 providers (one must be marked as Verifier) for the app to work properly.

## Step 6: Start Chatting!

1. Click on **Chat** in the top menu
2. Click **New Chat** button
3. Type a message in the input box, for example:
   ```
   What are the benefits of exercise?
   ```
4. Click **Send** or press Enter

You should see:
- Your message
- Responses from all active AI providers
- A verification summary showing the best response

## Troubleshooting

### Backend won't start
- **Error: Access denied for user 'root'@'localhost'**
  - Check your MySQL password in `backend/.env`
  - Make sure MySQL is running: `mysql -u root -p`

- **Error: Cannot find module**
  - Run `npm install` again in the backend folder

### Frontend won't start
- **Error: Cannot find module**
  - Run `npm install` again in the frontend folder

### Can't send messages
- **"No AI providers configured"**
  - Go to Settings and add at least one AI provider
  - Make sure at least one provider is marked as "Verifier"

- **AI Provider errors**
  - Check your API key is correct
  - Verify you have credits/quota available
  - Check the model name is valid (e.g., gpt-4, gpt-3.5-turbo)

### Database errors
- **Table doesn't exist**
  - Run `npm run init-db` again from the backend folder

### Port already in use
- **Backend (3001) in use**:
  ```bash
  # On macOS/Linux
  lsof -ti:3001 | xargs kill -9

  # On Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  ```

- **Frontend (3000) in use**:
  ```bash
  # On macOS/Linux
  lsof -ti:3000 | xargs kill -9

  # On Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## Testing the API

Test if the backend is working:

```bash
# Health check
curl http://localhost:3001/api/health

# Should return: {"status":"ok","message":"AI Verifier API is running"}
```

## Next Steps

- Try different prompts to compare AI responses
- Add more AI providers (Anthropic Claude, custom APIs)
- Experiment with different models
- Create multiple chats for different topics

## Need Help?

Check the main [README.md](README.md) for more detailed information, or create an issue in the repository.

## Deployment Options

Once you're ready to deploy online, see [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on:
- Heroku
- DigitalOcean
- AWS
- Vercel (frontend) + Railway (backend)
