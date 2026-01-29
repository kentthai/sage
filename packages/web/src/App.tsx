import { Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <h1 className="text-2xl font-bold">Sage</h1>
        <p className="text-muted-foreground">Your Knowledge Journal</p>
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
    <div className="flex flex-col items-center py-12 gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to Sage</h2>
        <p className="text-muted-foreground max-w-md">
          AI-powered lifelong learning agent and knowledge journal. Capture,
          organize, and grow your knowledge through conversational AI.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Enter a topic you want to learn about
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="e.g., Machine Learning basics" />
          <Button>Start</Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline">Browse Knowledge</Button>
        <Button variant="secondary">View Graph</Button>
      </div>
    </div>
  );
}
