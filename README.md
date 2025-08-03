AI Voice Assistant
A modern, privacy-focused AI Voice Assistant built with Next.js (App Router), Whisper.cpp compiled to WebAssembly, and OpenAI integration. This project enables real-time speech-to-text (STT), AI response generation, and text-to-speech (TTS) playback, with full offline capabilities after the initial load (except for OpenAI API calls). Designed as a Progressive Web App (PWA), it offers seamless installation and a modular architecture for easy maintenance and scalability.
Features

 Offline Speech Processing: Local speech-to-text using Whisper.cpp via WebAssembly in a Web Worker.
 AI-Powered Responses: Generates intelligent responses using the OpenAI API.
 Browser-Native TTS: Converts AI responses to speech using built-in browser Text-to-Speech APIs.
 Progressive Web App: Installable on desktop and mobile devices for a native-like experience.
 Fully Offline After Load: Operates offline for STT and TTS, with OpenAI API as the only online dependency.
 Modular Architecture: Organized folder structure for scalability and maintainability.

How It Works

Audio Capture: The browser captures user audio input via the microphone using the Web Audio API.
Speech-to-Text (STT): Audio is processed locally in a Web Worker using Whisper.cpp (WebAssembly) to transcribe speech to text.
AI Response Generation: Transcribed text is sent to the OpenAI API, which generates a natural language response.
Text-to-Speech (TTS): The response is converted to speech using the browser’s native SpeechSynthesis API.
Playback and Display: The generated speech is played back, and the response is displayed in the UI.
Offline Support: All components except the OpenAI API call operate offline after the initial load, leveraging cached assets and WebAssembly.

Getting Started
Follow these steps to set up and run the project locally.
Prerequisites

Node.js (v18 or higher)
npm or yarn
Git
OpenAI API key (for response generation)

Installation

Clone the Repository:
git clone https://github.com/username/ai-voice-assistant.git
cd ai-voice-assistant


Install Dependencies:
npm install

Or, if using Yarn:
yarn install


Run the Development Server:
npm run dev

Or:
yarn dev


Open http://localhost:3000 in your browser to access the application.


Whisper Model Setup
The project uses Whisper.cpp compiled to WebAssembly for local speech-to-text. Follow these steps to set up the Whisper model:

Download the Model:

Download a pre-trained Whisper model (e.g., tiny.en) from the Whisper.cpp repository.
Place the model file (e.g., ggml-tiny.en.bin) in the public/models directory.


Verify Web Worker Configuration:

Ensure the Web Worker script (public/worker.js) is configured to load the model from /models/ggml-tiny.en.bin.
The WebAssembly binary (whisper.wasm) should also be in the public directory.


Test STT:

Start the app and test the microphone input to confirm the Whisper model transcribes audio correctly.



Environment Variable Setup
Create a .env.local file in the project root and add your OpenAI API key:
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here


Note: Never commit your .env.local file to version control. Ensure it’s listed in .gitignore.

Project Folder Structure
ai-voice-assistant/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/                # API routes for OpenAI integration
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and helpers
│   └── page.tsx            # Main application entry point
├── public/                 # Static assets
│   ├── models/             # Whisper.cpp model files
│   └── worker.js           # Web Worker for Whisper.cpp
├── styles/                 # CSS/Tailwind styles
├── .env.local              # Environment variables (not committed)
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation

Offline Capabilities
The AI Voice Assistant is designed to work offline after the initial load, except for OpenAI API calls:

Service Worker: A service worker caches all static assets (HTML, CSS, JS, WebAssembly) and the Whisper model for offline access.
Whisper.cpp in WebAssembly: Runs STT entirely in the browser, eliminating the need for server-side processing.
Browser TTS: Uses the browser’s SpeechSynthesis API, which operates without an internet connection.
PWA Support: The app can be installed on devices, enabling offline access via a cached manifest.


Note: OpenAI API calls require an internet connection. For fully offline operation, consider replacing the OpenAI API with a local LLM in future iterations.

Build and Deploy
Local Build

Build the project:
npm run build

Or:
yarn build


Start the production server:
npm run start

Or:
yarn start



Deploy to Vercel

Push to GitHub:

Ensure your repository is pushed to GitHub or another git provider.


Import to Vercel:

Log in to Vercel and import your repository.
Set the environment variable NEXT_PUBLIC_OPENAI_API_KEY in the Vercel dashboard.


Deploy:

Vercel automatically detects the Next.js project and deploys it.
Ensure the Whisper model and WebAssembly files are included in the public directory for deployment.


Verify PWA:

After deployment, confirm the PWA manifest and service worker are functioning by testing installation on a device.



Useful Resources

Next.js Documentation - Official Next.js App Router guide.
Whisper.cpp - Whisper.cpp repository for WebAssembly setup.
OpenAI API - Documentation for OpenAI API integration.
Web Speech API - Browser-native STT and TTS APIs.
Workbox - Service worker library for PWA caching.
Vercel Deployment - Guide for deploying Next.js apps.

License and Acknowledgments
License: This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgments:

Thanks to the Whisper.cpp community for enabling efficient speech-to-text in WebAssembly.
Gratitude to OpenAI for providing powerful language models.
Built with love using Next.js and the Web Speech API.
