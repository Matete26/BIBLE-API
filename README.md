# Bible Verse Display

A beautiful voice-activated Bible verse lookup application built with React, Vite, and Claude AI.

## Features

- 🎤 **Voice Recognition** - Speak a Bible verse or reference
- 🤖 **AI-Powered** - Uses Claude Sonnet to identify and retrieve verses
- ✨ **Beautiful UI** - Elegant design with animated particles and smooth transitions
- 📱 **Responsive** - Works on desktop and mobile
- ⚡ **Fast** - Built with Vite for instant dev experience

## Prerequisites

- Node.js 16+ and npm
- An [Anthropic API key](https://console.anthropic.com)
- A modern browser with Web Speech API support (Chrome, Edge, Safari)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key:
     ```
     VITE_ANTHROPIC_API_KEY=your-api-key-here
     ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

## Usage

1. Click the microphone button to start listening
2. Speak a Bible verse reference (e.g., "John 3:16") or part of a verse
3. The app will identify the verse and display it with the full text

## How It Works

1. **Voice Input** - Uses Web Speech API to capture spoken text
2. **AI Processing** - Sends the transcript to Claude Sonnet
3. **Verse Lookup** - Claude identifies the Bible verse
4. **Display** - Shows the full verse text with reference

## Building for Production

```bash
npm run build
npm run preview
```

## Browser Support

- Chrome/Chromium 25+
- Firefox 25+ (with `about:config` setting)
- Safari 14.1+
- Edge 79+

## Troubleshooting

**"API key not configured" error**
- Ensure your `.env` file has `VITE_ANTHROPIC_API_KEY` set correctly
- Restart the dev server after changing `.env`

**"Your browser doesn't support voice recognition"**
- Use a supported browser (Chrome recommended)
- Ensure microphone permissions are granted

**Verse not found**
- Try speaking the verse reference more clearly
- The app works best with standard Bible verse references (e.g., "Matthew 6:9", "Luke 1:26")

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Claude AI** - Verse identification
- **Web Speech API** - Voice input

## License

MIT
