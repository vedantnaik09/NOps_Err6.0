// app/anomaly/page.tsx
import { AnomalyDisplay } from './anomaly-display'

export default function AnomalyPage() {
  return (
    <div className="bg-black min-h-screen">
      <div className="container px-4 py-24 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Anomaly Detection
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
            Anomaly detection results and analysis.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <AnomalyDisplay />
        </div>
      </div>
    </div>
  )
}