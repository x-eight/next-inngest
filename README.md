# Next.js + Inngest Orchestrator 🚀

A professional example of orchestrating long-running background tasks within a Next.js application using [Inngest](https://www.inngest.com/). This architecture allows you to bypass Vercel's serverless timeout limits by offloading heavy processing to an external orchestrator while maintaining a seamless developer experience.

## ✨ Features

- **Background Orchestration**: Handle tasks that exceed standard serverless timeouts (up to 24h+ execution).
- **Real-time Progress Tracking**: Monitor task execution in real-time through a premium dashboard built with Tailwind CSS and SSE (Server-Sent Events).
- **Mocked Services**: Includes ready-to-use mock services (FFmpeg, Google, AI) to simulate complex workflows without external dependencies.
- **Glassmorphism UI**: High-end modern dashboard with dark mode and smooth animations.
- **Vercel Optimized**: Pre-configured for seamless deployment on Vercel without Docker.

## 🛠️ Architecture

This project follows a decoupled architecture where the frontend triggers events that Inngest captures and executes in steps.

1. **Trigger**: The UI sends a POST request to `/api/start`.
2. **Event**: Inngest captures the event and starts the defined workflow.
3. **Execution**: Long-running steps simulate processing (Transcribing, AI Analysis, Video Generation).
4. **Updates**: Progress is pushed to a shared state and streamed to the UI via `/api/progress`.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/x-eight/next-inngest.git
   cd next-inngest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Inngest**:
   Install the Inngest CLI to test locally:
   ```bash
   npx inngest-cli@latest dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📦 Deployment

Deploy easily to Vercel:

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Set your `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` as environment variables.
4. Deploy!

## ⚖️ License

This project is licensed under the MIT License.
