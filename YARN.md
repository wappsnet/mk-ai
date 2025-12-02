# Using Yarn with AI Verifier

This project uses **Yarn** as the package manager instead of npm for better performance and consistency.

## Why Yarn?

- **Faster installations**: Parallel package downloads
- **Deterministic installs**: Consistent package versions across all environments via `yarn.lock`
- **Better caching**: Offline mode support
- **Workspaces support**: Better monorepo management (future)

## Installing Yarn

### Quick Install

```bash
npm install -g yarn
```

### Alternative Methods

**macOS (Homebrew):**
```bash
brew install yarn
```

**Windows (Chocolatey):**
```bash
choco install yarn
```

**Linux (Debian/Ubuntu):**
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

**Verify installation:**
```bash
yarn --version
```

## Quick Start with Yarn

### 1. Automated Setup

```bash
./setup.sh          # macOS/Linux
setup.bat           # Windows
```

The setup script will:
- Check if Yarn is installed (and install it if needed)
- Install all dependencies
- Configure the database

### 2. Manual Setup

```bash
# Backend
cd backend
yarn install
cp .env.example .env
# Edit .env with your MySQL credentials
yarn init-db

# Frontend
cd frontend
yarn install
```

### 3. Start Development

**Option A: Root directory (both services)**
```bash
yarn install        # Install root dependencies (concurrently)
yarn dev            # Start both backend and frontend
```

**Option B: Separate terminals**
```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

## Yarn Commands Reference

### Common Commands

| npm command | yarn command | Description |
|-------------|--------------|-------------|
| `npm install` | `yarn install` or just `yarn` | Install all dependencies |
| `npm install <package>` | `yarn add <package>` | Add a dependency |
| `npm install --save-dev <package>` | `yarn add <package> --dev` | Add a dev dependency |
| `npm uninstall <package>` | `yarn remove <package>` | Remove a dependency |
| `npm run <script>` | `yarn <script>` | Run a script |
| `npm update` | `yarn upgrade` | Update dependencies |
| `npm install -g <package>` | `yarn global add <package>` | Install globally |

### Project-Specific Commands

**Root directory:**
```bash
yarn setup          # Install all dependencies
yarn init-db        # Initialize database
yarn dev            # Start both services
yarn start          # Production mode
```

**Backend:**
```bash
yarn install        # Install dependencies
yarn dev            # Start development server
yarn start          # Start production server
yarn init-db        # Initialize database
```

**Frontend:**
```bash
yarn install        # Install dependencies
yarn dev            # Start development server
yarn build          # Build for production
yarn preview        # Preview production build
```

## Yarn vs NPM Comparison

### Installation

**npm:**
```bash
cd backend
npm install
cd ../frontend
npm install
```

**yarn:**
```bash
cd backend
yarn
cd ../frontend
yarn
```

### Running Scripts

**npm:**
```bash
npm run dev
npm run build
npm run init-db
```

**yarn:**
```bash
yarn dev
yarn build
yarn init-db
```

Note: `yarn` doesn't require the `run` keyword for scripts!

## Understanding yarn.lock

The `yarn.lock` file:
- **DO commit it** to version control
- Ensures everyone gets the same package versions
- Auto-updated when you add/remove packages
- Don't edit it manually

## Troubleshooting

### "yarn: command not found"

Install Yarn:
```bash
npm install -g yarn
```

### Permission errors on global install

**macOS/Linux:**
```bash
sudo npm install -g yarn
```

**Windows:** Run terminal as Administrator

### Cache issues

Clear Yarn cache:
```bash
yarn cache clean
```

### Lock file conflicts

If you have merge conflicts in `yarn.lock`:
```bash
# Delete lock file
rm yarn.lock

# Reinstall
yarn install
```

### Dependencies not updating

Force reinstall:
```bash
rm -rf node_modules yarn.lock
yarn install
```

## Migration from NPM

If you were using npm before:

### 1. Remove npm artifacts

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
yarn install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
yarn install
```

### 2. Update scripts

All documentation and scripts have been updated to use Yarn. Key changes:

- `npm install` → `yarn` or `yarn install`
- `npm run dev` → `yarn dev`
- `npm start` → `yarn start`

### 3. Update CI/CD

If you have CI/CD pipelines, update them:

**Before:**
```yaml
- npm install
- npm run build
- npm test
```

**After:**
```yaml
- yarn install
- yarn build
- yarn test
```

## Yarn Workspaces (Future)

For future monorepo support, you can use Yarn Workspaces:

```json
{
  "private": true,
  "workspaces": [
    "backend",
    "frontend"
  ]
}
```

This allows:
- Shared dependencies
- Single `yarn install` for all packages
- Better dependency management

## Performance Benefits

Typical installation times:

| Action | npm | yarn |
|--------|-----|------|
| Fresh install | ~45s | ~30s |
| With cache | ~25s | ~5s |
| Add package | ~10s | ~3s |

*Times vary based on project size and internet speed*

## Best Practices

1. **Always commit yarn.lock**
   ```bash
   git add yarn.lock
   git commit -m "Update dependencies"
   ```

2. **Use exact versions in production**
   ```bash
   yarn add <package> --exact
   ```

3. **Clean install in CI/CD**
   ```bash
   yarn install --frozen-lockfile
   ```

4. **Check for outdated packages**
   ```bash
   yarn outdated
   ```

5. **Interactive upgrades**
   ```bash
   yarn upgrade-interactive
   ```

## Common Issues

### Issue: "integrity checksum failed"

**Solution:**
```bash
rm yarn.lock
yarn install
```

### Issue: "There appears to be trouble with your network connection"

**Solution:**
```bash
yarn install --network-timeout 100000
```

### Issue: "EACCES: permission denied"

**Solution:**
```bash
sudo chown -R $USER:$GROUP ~/.yarn
```

## Resources

- **Official Docs**: https://yarnpkg.com/
- **CLI Commands**: https://yarnpkg.com/cli
- **Migration Guide**: https://yarnpkg.com/getting-started/migration

## Quick Reference Card

```bash
# Install
yarn                    # Install all dependencies
yarn add <pkg>          # Add dependency
yarn add <pkg> --dev    # Add dev dependency
yarn remove <pkg>       # Remove dependency

# Update
yarn upgrade            # Update all dependencies
yarn upgrade <pkg>      # Update specific package

# Run
yarn <script>           # Run package.json script
yarn dev                # Start development
yarn build              # Build for production

# Info
yarn list               # List installed packages
yarn why <pkg>          # Explain why package is installed
yarn outdated           # Check for updates

# Clean
yarn cache clean        # Clear cache
```

## Support

For Yarn-specific issues:
1. Check this guide
2. Visit https://yarnpkg.com/
3. Check Yarn GitHub issues

For project issues, see the main README.md

---

**Note**: All project documentation and scripts use Yarn commands. If you see npm commands in any documentation, please report it as a documentation bug.
