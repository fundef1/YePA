import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index'; // Assuming this is your main page
import { FooterAttribution } from './components/FooterAttribution'; // Assuming this is used

function App() {
  // Determine the basename dynamically based on the environment.
  // In development (local), process.env.NODE_ENV is 'development', so basename will be '/'.
  // In production (build for GitHub Pages), process.env.NODE_ENV is 'production', so basename will be '/YePA'.
  const basename = process.env.NODE_ENV === 'production' ? '/YePA' : '/';

  return (
    <Router basename={basename}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Add other routes here if you have them */}
          </Routes>
        </main>
        <FooterAttribution />
      </div>
    </Router>
  );
}

export default App;