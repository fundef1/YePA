import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index'; // Assuming this is your main page
import { FooterAttribution } from './components/FooterAttribution'; // Assuming this is used

function App() {
  return (
    <Router basename="/YePA"> {/* Set the basename to your repository name */}
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