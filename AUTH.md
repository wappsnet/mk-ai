# Authentication Guide - AI Verifier

The AI Verifier now includes a complete authentication system with JWT-based access and refresh tokens.

## Features

- **User Registration & Login**: Secure email/password authentication
- **JWT Tokens**: Access tokens (15min) and refresh tokens (7 days)
- **Automatic Token Refresh**: Seamless token renewal without user interaction
- **Protected Routes**: All app features require authentication
- **User-specific Data**: Each user has their own AI providers and chats

## Quick Start

### 1. First Time Setup

After setting up the database (`npm run init-db`), start both backend and frontend:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Create Your Account

1. Open http://localhost:3000
2. You'll be redirected to the login page
3. Click "Sign up now"
4. Fill in:
   - Full Name
   - Email
   - Password (minimum 6 characters)
5. Click "Sign Up"

You'll be automatically logged in!

### 3. Start Using the App

Once logged in, you can:
- Configure AI providers in Settings
- Create and manage chats
- All your data is private to your account

## Authentication Flow

```
┌─────────────┐
│   Register  │
│  or Login   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Access Token (15m) │
│ Refresh Token (7d)  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│  Make API Requests   │
│ (Token auto-attached)│
└──────────┬───────────┘
           │
      Token Expired?
           │
           ▼
     ┌─────────┐
     │  Auto   │
     │ Refresh │
     └─────────┘
```

## API Endpoints

### Public Endpoints (No Auth Required)

```bash
POST /api/auth/register    # Create account
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh access token
POST /api/auth/logout      # Logout
```

### Protected Endpoints (Auth Required)

All other endpoints require authentication:

```bash
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update profile

GET  /api/ai-providers     # User's AI providers
POST /api/ai-providers     # Create provider
...

GET  /api/chats            # User's chats
POST /api/chats            # Create chat
...
```

## Token Management

### Access Tokens
- **Duration**: 15 minutes
- **Storage**: LocalStorage
- **Usage**: Sent with every API request
- **Auto-refresh**: Happens automatically when expired

### Refresh Tokens
- **Duration**: 7 days
- **Storage**: LocalStorage
- **Usage**: Used to get new access tokens
- **Security**: Invalidated on logout

## Security Features

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt (10 rounds)
- Never stored in plain text

### Token Security
- JWT tokens signed with secret key
- Tokens include expiration time
- Refresh tokens stored in database
- Automatic cleanup of expired tokens

### API Security
- All routes except auth are protected
- Tokens validated on every request
- User data isolated by user_id
- CORS enabled with credentials

## Configuration

### Backend (.env)

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

**IMPORTANT**: Change `JWT_SECRET` in production!

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Updated Tables
- `ai_providers` - added `user_id` foreign key
- `chats` - added `user_id` foreign key

## Frontend Implementation

### Auth Context

```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // user: { id, email, name }
  // isAuthenticated: boolean
  // login: (email, password) => Promise
  // logout: () => Promise
}
```

### Protected Routes

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### API Calls

API calls automatically include authentication:

```javascript
import { chatsAPI } from './services/api';

// Token automatically attached
const response = await chatsAPI.getAll();
```

## Troubleshooting

### "Access token required"
- You're not logged in
- Token expired and refresh failed
- **Solution**: Login again

### "Invalid refresh token"
- Refresh token expired (>7 days)
- **Solution**: Login again

### "User not found"
- Account was deleted
- **Solution**: Create new account

### "Email already exists"
- Account with that email exists
- **Solution**: Use different email or login

### Token keeps expiring
- Check system time is correct
- Verify JWT_ACCESS_TOKEN_EXPIRY in .env
- Check browser console for errors

### Can't login after registration
- Check backend logs for errors
- Verify database connection
- Ensure .env JWT_SECRET is set

## Testing Authentication

### Manual Testing

1. **Register**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

2. **Login**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Use Access Token**:
```bash
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

4. **Refresh Token**:
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Best Practices

### Development
- Use different JWT_SECRET for dev/prod
- Keep access token expiry short (15m)
- Log authentication errors for debugging

### Production
- Use strong, random JWT_SECRET
- Enable HTTPS only
- Set secure cookie flags
- Implement rate limiting on auth endpoints
- Add email verification
- Implement password reset
- Add 2FA for extra security

## Migration from Non-Auth Version

If you have existing data:

1. **Backup database first!**
2. Run the new `npm run init-db`
3. This creates new tables (users, refresh_tokens)
4. Updates existing tables (adds user_id columns)
5. **Note**: Existing data will need manual migration to associate with a user

### Manual Migration Script

```javascript
// Run after creating first user
const userId = 1; // Your first user ID

// Assign all providers to this user
UPDATE ai_providers SET user_id = userId WHERE user_id IS NULL;

// Assign all chats to this user
UPDATE chats SET user_id = userId WHERE user_id IS NULL;
```

## Future Enhancements

Potential authentication improvements:
- Email verification
- Password reset via email
- Social login (Google, GitHub)
- Two-factor authentication (2FA)
- Remember me functionality
- Session management dashboard
- Account deletion
- Password strength requirements
- Rate limiting on login attempts

## Support

For authentication-related issues:
1. Check this guide
2. Review backend logs (`backend/` terminal)
3. Check browser console (F12)
4. Verify database tables exist
5. Ensure JWT_SECRET is configured

---

**Security Notice**: Never commit your `.env` file with real credentials to version control!
