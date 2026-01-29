import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-sage-600 text-white p-4">
        <h1 className="text-2xl font-bold">Sage</h1>
        <p className="text-sage-100">Your Knowledge Journal</p>
      </header>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to Sage
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        AI-powered lifelong learning agent and knowledge journal. Capture,
        organize, and grow your knowledge through conversational AI.
      </p>
    </div>
  );
}
