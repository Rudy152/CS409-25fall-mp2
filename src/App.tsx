import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchView from './components/SearchView';
import GalleryView from './components/GalleryView';
import DetailView from './components/DetailView';
import './App.css';

const App: React.FC = () => {
  return (
    <Router basename="/CS409-25fall-mp2">
      <div className="App">
        <header className="app-header">
          <h1 className="app-title">IMDB Top 250 Movie Directory</h1>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Search</Link>
            <Link to="/gallery" className="nav-link">Gallery</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<SearchView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/detail/:id" element={<DetailView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
