# AI Verifier

A full-stack application that allows users to interact with multiple AI providers simultaneously, compare their responses, and get an AI-powered verification to determine the best answer.

## Features

- **Multi-AI Chat Interface**: Send prompts to multiple AI providers at once
- **AI Response Verification**: Automatically analyzes all responses and identifies the best one
- **Provider Management**: Easy configuration of multiple AI providers (OpenAI, Anthropic, Custom APIs)
- **Chat History**: Create and manage multiple chat sessions
- **Real-time Responses**: Parallel processing of AI requests for fast results
- **Response Comparison**: View all AI responses side-by-side with performance metrics
- **Modern UI**: Built with React and Ant Design for a clean, professional interface

## Architecture

```
ai-verifier/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # AI service integration
│   │   └── index.js     # Server entry point
│   └── package.json
│
└── frontend/            # React + Ant Design
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── services/    # API client
    │   └── main.jsx     # App entry point
    └── package.json
```

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL** - Database
- **OpenAI SDK** - AI provider integration
- **Axios** - HTTP client

### Frontend
- **React 18** - UI library
- **Ant Design 5** - UI component library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - API client

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-verifier
```

### 2. Database Setup

1. Install and start MySQL server
2. Create a database:

```sql
CREATE DATABASE ai_verifier;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

Update the `.env` file with your configuration:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_verifier
DB_PORT=3306

VERIFIER_AI_PROVIDER=openai
VERIFIER_AI_MODEL=gpt-4
```

Initialize the database:

```bash
npm run init-db
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### 1. Configure AI Providers

1. Navigate to the **Settings** page
2. Click **Add Provider**
3. Fill in the configuration:
   - **Name**: A descriptive name for your provider
   - **Provider Type**: Select from OpenAI, Anthropic, or Custom API
   - **API Key**: Your API key for the provider
   - **Model**: (Optional) Specify the model (e.g., gpt-4, claude-3-sonnet)
   - **Base URL**: (Optional) Custom API endpoint
   - **Use as Verifier**: Toggle on to use this AI to analyze and verify responses

Example configurations:

**OpenAI:**
- Provider Type: OpenAI
- API Key: sk-...
- Model: gpt-4 or gpt-3.5-turbo

**Anthropic Claude:**
- Provider Type: Anthropic
- API Key: sk-ant-...
- Model: claude-3-sonnet-20240229

**Set up at least:**
- 2-3 AI providers for getting responses
- 1 AI provider marked as "Verifier" to analyze responses

### 2. Create a Chat

1. Go to the **Chat** page
2. Click **New Chat**
3. A new chat session will be created

### 3. Send Messages

1. Type your prompt in the message input box
2. Click **Send** or press Enter
3. The application will:
   - Send your prompt to all active AI providers simultaneously
   - Display each AI's response with performance metrics
   - Use the verifier AI to analyze all responses
   - Show a summary and identify the best response

### 4. View Results

Each message will show:
- **Your prompt**
- **Individual AI responses** with:
  - Provider name
  - Response time
  - Full response text
- **Verification summary** with:
  - Combined insights from all responses
  - Best response identification
  - Reasoning for the selection

## API Endpoints

### AI Providers

- `GET /api/ai-providers` - Get all providers
- `GET /api/ai-providers/active` - Get active providers
- `POST /api/ai-providers` - Create new provider
- `PUT /api/ai-providers/:id` - Update provider
- `DELETE /api/ai-providers/:id` - Delete provider
- `PATCH /api/ai-providers/:id/active` - Toggle provider status

### Chats

- `GET /api/chats` - Get all chats
- `GET /api/chats/:id` - Get chat by ID
- `GET /api/chats/:id/messages` - Get chat messages with responses
- `POST /api/chats` - Create new chat
- `POST /api/chats/:id/messages` - Send message to chat
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat

## Database Schema

### Tables

1. **ai_providers** - AI provider configurations
2. **chats** - Chat sessions
3. **messages** - User prompts
4. **ai_responses** - Individual AI responses
5. **verifications** - Verification results

See `backend/src/config/initDb.js` for detailed schema.

## Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u root -p`
- Check database credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### API Connection Issues

- Check backend is running on port 3001
- Verify CORS is enabled in backend
- Check browser console for errors

### AI Provider Errors

- Verify API keys are correct
- Check API key permissions and credits
- Ensure model names are valid for the provider
- Check network connectivity

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 3001 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | ai_verifier |
| DB_PORT | MySQL port | 3306 |

### Frontend

Frontend uses Vite's environment variable system. API URL is configured in `vite.config.js` proxy settings.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Export chat history
- [ ] Custom prompt templates
- [ ] Response rating system
- [ ] Cost tracking per provider
- [ ] Streaming responses
- [ ] File upload support
- [ ] More AI provider integrations (Google PaLM, Cohere, etc.)
- [ ] Response caching
- [ ] Conversation branching
