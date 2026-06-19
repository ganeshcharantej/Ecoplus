# EcoPulse 🌍

EcoPulse is a modern, single-page, full-stack Carbon Footprint Awareness Platform. It allows users to calculate their annual carbon footprint based on driving distance, electricity consumption, and diet pattern. In addition, users can interact with a live "What-If" reduction sandbox to preview the impact of potential lifestyle choices, and connect with a Google Gemini AI sustainability coach to generate personalized, encouraging, and highly actionable emission-reduction tips.

## Key Features

- **Earth-Toned User Interface**: Built using React, TypeScript, and Tailwind CSS. Modern layout featuring glassmorphism, smooth animations, dynamic color-coded indicators, and responsive charts.
- **Interactive Habit Input**: Sliders and number inputs for annual driving distance and monthly electricity usage, plus custom card selectors for diet patterns (Omnivore, Vegetarian, Vegan).
- **Emissions Calculator**: Calculations based on standard approximations:
  - **Transport**: `km driven * 0.0002` (in MTCO2e/yr)
  - **Energy**: `monthly kWh * 12 * 0.0008` (in MTCO2e/yr)
  - **Diet**: Omnivore (`2.5`), Vegetarian (`1.7`), Vegan (`1.2`)
  - **Total**: Sum of Transport, Energy, and Diet footprints.
- **Carbon Reduction Sandbox (What-If Simulator)**: Drag sliders to simulate lifestyle changes (e.g., driving less, reducing home power usage, or changing diets) and watch your footprint drop in real-time.
- **Gemini AI Coaching Integration**: Secure serverless API route communicating with the `gemini-2.5-flash` model. It passes the footprint breakdown to Gemini, generating 3 highly actionable, encouraging recommendations to reduce emissions in the highest-emitting categories.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v24.16.0 recommended)
- **NPM**: v9.0.0 or higher
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. Clone or download this project.
2. In the project root directory, install all required dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Duplicate the `.env.example` file and rename it to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and enter your API key:
     ```env
     GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```

### Running the Application Locally

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the platform.

### Build and Lint

To verify ESLint formatting:
```bash
npm run lint
```

To compile the production build:
```bash
npm run build
```

---

## File Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── insights/
│   │   │       └── route.ts       # Secure server-side API route for Gemini integration
│   │   ├── globals.css            # Styling imports
│   │   ├── layout.tsx             # Root Layout with metadata
│   │   └── page.tsx               # Main Dashboard page containing calculations and UI
├── .env.example                   # Template for environment variables
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript compiler settings
```

## Security & Deployment

- **Secret Protection**: The `GEMINI_API_KEY` is referenced solely on the server inside `src/app/api/insights/route.ts` and is never exposed to the client side.
- **Deployment**: The application is structured as a standard Next.js App Router project, fully prepared for simple single-click deployments on platforms like Vercel, Netlify, or AWS.
