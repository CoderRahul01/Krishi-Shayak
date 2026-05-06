# Krishi Shayak (Agricultural Assistant) 🌾

Krishi Shayak is an AI-powered agricultural assistant designed specifically for Indian farmers. It leverages the power of Google Gemini to provide real-time plant disease detection, smart weather-based farming insights, and expert agricultural advice.

## Key Features 🚀

- **AI Vision Detection**: Instantly identify pests and diseases from plant photos with scientific grounding based on Indian agricultural research (ICAR, IARI).
- **Gemini-Powered Weather Insights**: Get localized weather data along with disease risks, irrigation advice, and spraying alerts—all powered by Gemini's real-time information retrieval.
- **Expert Agri-Bot**: Chat with an AI agricultural expert that understands local Indian farming terminology and provides scientifically proven solutions in multiple Indian languages.
- **Natural Voice System**: High-quality, human-like voice output in Hindi and other regional languages (Marathi, Telugu, etc.) for easy accessibility.
- **Multilingual Support**: Fully localized in English, Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, and Punjabi.
- **Offline History**: View your previous detections and reports even when you are not in the field.

## Setup Instructions 🛠️

### Prerequisites

- Node.js (v18+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
- A Firebase project for authentication and database

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template) and add your keys:

```env
# Required for AI Features
GEMINI_API_KEY=your_gemini_api_key_here

# Required for Hosting / Callbacks
VITE_APP_URL=your_deployed_url
```

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment 🌐

To deploy Krishi Shayak to production:

1. **Build the Project**:
   ```bash
   npm run build
   ```
2. **Configure Secrets**: 
   Ensure `GEMINI_API_KEY` is securely stored in your production environment variables (e.g., Cloud Run Secrets).
3. **Firebase Rules**:
   Deploy the `firestore.rules` to your Firebase project to ensure data security.
4. **Static Hosting**: 
   The `dist/` folder contains the production-ready application that can be served by any static hosting provider or served via an Express server.

## Scientific Grounding 📚

All AI-generated advice is grounded in scientific principles and cross-referenced with Indian agricultural research standards. For disease detection, the AI provides both organic (Prakritik kheti) and chemical treatment options consistent with Integrated Pest Management (IPM) practices in India.

## Contributing 🤝

Contributions are welcome! If you have suggestions for new features or improvements (e.g., more localized voices, better detection models), please feel free to open a pull request.

---
*Built with ❤️ for Indian Farmers.*
