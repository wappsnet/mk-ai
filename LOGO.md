# AI Verifier Logo

The AI Verifier logo represents the core concept of the application: verifying and comparing AI responses from multiple sources.

## Logo Design Concept

### Visual Elements

1. **Central Shield with Checkmark**
   - Represents verification and trust
   - The checkmark symbolizes approval and accuracy
   - Shield shape conveys protection and reliability

2. **Neural Network Nodes**
   - Left and right sides show AI nodes/sources
   - Represents multiple AI providers
   - Different colors indicate different AI sources

3. **Connection Lines**
   - Show data flow from AI sources to the verification center
   - Illustrates the comparison and analysis process

4. **Gradient Colors**
   - Primary: Purple gradient (#667eea to #764ba2)
   - Accent 1: Pink gradient (#f093fb to #f5576c)
   - Accent 2: Blue gradient (#4facfe to #00f2fe)

## Logo Files

### Available Versions

```
frontend/public/
├── logo.svg          # Full logo (200x200) - Main version
├── logo-icon.svg     # Icon version (64x64) - For favicon
└── logo-light.svg    # Light version - For dark backgrounds
```

### Usage Guide

#### 1. Full Logo (`logo.svg`)
**Use for:**
- Landing pages
- Documentation headers
- Large displays
- Marketing materials

**Size:** 200x200px (scalable)

**Example:**
```html
<img src="/logo.svg" alt="AI Verifier" width="200" />
```

#### 2. Icon Version (`logo-icon.svg`)
**Use for:**
- Favicon (already configured in index.html)
- App icons
- Toolbar buttons
- Small UI elements

**Size:** 64x64px (scalable)

**Example:**
```html
<link rel="icon" type="image/svg+xml" href="/logo-icon.svg" />
```

#### 3. Light Version (`logo-light.svg`)
**Use for:**
- Dark mode interfaces
- Dark backgrounds
- Night theme
- Presentations with dark slides

**Size:** 200x200px (scalable)

**Example:**
```html
<img src="/logo-light.svg" alt="AI Verifier" width="200" />
```

## Integration

### HTML Favicon (Already Configured)

The favicon is automatically loaded in `frontend/index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/logo-icon.svg" />
<meta name="theme-color" content="#667eea" />
```

### React Component Usage

To use the logo in your React components:

```tsx
// In a component
function Header() {
  return (
    <div>
      <img
        src="/logo.svg"
        alt="AI Verifier Logo"
        style={{ width: '50px', height: '50px' }}
      />
      <h1>AI Verifier</h1>
    </div>
  );
}
```

### In the App Header

You can add the logo to the navigation header in `App.tsx`:

```tsx
<div style={{ display: 'flex', alignItems: 'center' }}>
  <img
    src="/logo-icon.svg"
    alt="AI Verifier"
    style={{ width: '32px', height: '32px', marginRight: '12px' }}
  />
  <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
    AI Verifier
  </div>
</div>
```

## Color Palette

### Primary Colors
```css
--primary-gradient-start: #667eea;
--primary-gradient-end: #764ba2;
--primary: #667eea;
```

### Accent Colors
```css
--accent-pink-start: #f093fb;
--accent-pink-end: #f5576c;

--accent-blue-start: #4facfe;
--accent-blue-end: #00f2fe;
```

### Usage in CSS
```css
.logo-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo-glow {
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}
```

## Design Specifications

### Spacing & Layout
- Minimum size: 24x24px (maintain readability)
- Recommended sizes: 32px, 48px, 64px, 128px, 200px
- Clear space around logo: 25% of logo height
- Aspect ratio: 1:1 (square)

### Color Variations

#### Standard (Default)
- Use on white or light backgrounds
- Full gradient colors

#### Light Version
- Use on dark backgrounds (#000000 to #333333)
- Adjusted opacity and contrast

#### Monochrome
For single-color applications, use:
- Primary color: #667eea
- White: #FFFFFF
- Black: #000000

## Export Formats

The logos are provided in SVG format, which offers:
- ✅ Infinite scalability (vector)
- ✅ Small file size
- ✅ Perfect for web
- ✅ Retina/HiDPI ready
- ✅ Easy to animate
- ✅ Can be styled with CSS

### Converting to Other Formats

If you need PNG or other formats:

**Using a browser:**
1. Open the SVG file in a browser
2. Right-click → "Save as"
3. Choose PNG format

**Using ImageMagick (command line):**
```bash
# Install ImageMagick
brew install imagemagick  # macOS

# Convert to PNG at different sizes
convert logo.svg -resize 512x512 logo-512.png
convert logo.svg -resize 256x256 logo-256.png
convert logo.svg -resize 128x128 logo-128.png
convert logo.svg -resize 64x64 logo-64.png
convert logo.svg -resize 32x32 logo-32.png
```

## Brand Guidelines

### Do's ✅
- Use the logo with adequate clear space
- Maintain the original aspect ratio
- Use approved color variations
- Ensure logo is readable at small sizes
- Use high-quality versions

### Don'ts ❌
- Don't distort or stretch the logo
- Don't change the colors arbitrarily
- Don't add drop shadows or effects
- Don't place on busy backgrounds
- Don't rotate the logo
- Don't modify the design elements

## Accessibility

### Alt Text Examples

**Decorative usage:**
```html
<img src="/logo.svg" alt="" role="presentation" />
```

**Functional usage:**
```html
<img src="/logo.svg" alt="AI Verifier Logo" />
<img src="/logo.svg" alt="AI Verifier - Home" />
```

### Contrast Requirements

The logo meets WCAG 2.1 contrast requirements:
- Shield + checkmark: High contrast
- Readable on both light and dark backgrounds
- Icon version optimized for small sizes

## File Sizes

```
logo.svg        : ~3 KB
logo-icon.svg   : ~1 KB
logo-light.svg  : ~3 KB
```

All files are optimized for web performance.

## Future Variations

Consider creating:
- [ ] Animated SVG version (for loading states)
- [ ] PNG exports (512x512, 256x256, 128x128, etc.)
- [ ] App icon for mobile (iOS/Android)
- [ ] Social media versions (1200x630 for OG image)
- [ ] Monochrome version (single color)
- [ ] Horizontal lockup (logo + text)

## Credits

Logo designed for the AI Verifier project.
- Design: Custom SVG
- Style: Modern, minimalist, tech-focused
- Inspiration: AI, verification, trust, comparison

---

For questions or logo modifications, please refer to this guide or create an issue in the repository.
