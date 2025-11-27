# CatBot - Personalized AI Chatbot

A professional, personalized chatbot web application built with React, Firebase, and Google Gemini AI.

## Features

- **Modern Chat Interface**: Sleek UI with dark/light mode, typing indicators, and markdown support.
- **File Processing**: Drag-and-drop support for PDF, Images, TXT, etc. with OCR capabilities.
- **Personalization**: Customizable AI personality (System Prompts) and user settings.
- **Firebase Integration**: Real-time chat history, authentication, and file storage.
- **AI Powered**: Uses Google Gemini 1.5 Pro for advanced reasoning and multimodal capabilities.

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CatBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory with your Firebase and Gemini credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Generative AI SDK
- **Utilities**: pdfjs-dist, lucide-react, date-fns

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
