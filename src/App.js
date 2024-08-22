import React from 'react';
import ImageGrid from './ImageGrid';
// index.js or App.js
import './index.css'; // Adjust the path as necessary



function App() {
  return (
    <div className="App">
      <h1 className="text-3xl text-center my-4">Pexels Image Search</h1>
      <ImageGrid />
    </div>
  );
}

export default App;
