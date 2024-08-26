import React, { useState, useRef, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { searchImages } from './pexelsService';
import { fetchRandomQuote } from './quoteService';
import { initializeCanvas } from './fabric'; // Import the initializeCanvas function

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const ImageGrid = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [quote, setQuote] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (currentIndex !== null && images[currentIndex]) {
      const canvas = initializeCanvas(canvasRef.current, images[currentIndex].src.medium, quote);

      return () => {
        canvas.dispose();
      };
    }
  }, [currentIndex, images, quote]);

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleGenerateQuote = async () => {
    try {
      const randomQuote = await fetchRandomQuote();
      setQuote(randomQuote);
      setQuery(randomQuote);
      if (randomQuote) performSearch(randomQuote);
    } catch (error) {
      console.error('Error generating images:', error);
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    try {
      const photos = await searchImages(searchQuery);
      setImages(photos);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  // Function to open image in a new tab with Fabric.js canvas
  const openImageInNewTab = (index) => {
    setCurrentIndex(index);
    const imageUrl = images[index]?.src?.medium || '';
    const quoteText = quote.replace(/'/g, "\\'"); // Escape single quotes for use in HTML

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Image Viewer</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #333; }
            canvas { border: 1px solid #ccc; }
          </style>
          <script>
            function loadFabric() {
              return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/6.3.0/fabric.min.js';
                script.onload = () => resolve();
                document.head.appendChild(script);
              });
            }

            document.addEventListener('DOMContentLoaded', async () => {
              await loadFabric();
              const canvas = new fabric.Canvas('fabric-canvas');

              fabric.Image.fromURL('${imageUrl}', (img) => {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                canvas.setWidth(img.width);
                canvas.setHeight(img.height);

                const text = new fabric.Textbox('${quoteText}', {
                  left: canvas.width / 2,
                  top: canvas.height / 2,
                  originX: 'center',
                  originY: 'center',
                  fontSize: 30,
                  fill: '#fff',
                  textAlign: 'center',
                  selectable: true,
                });

                canvas.add(text);
                text.setControlsVisibility({
                  mt: true,
                  mb: true,
                  ml: true,
                  mr: true,
                  bl: true,
                  br: true,
                  tl: true,
                  tr: true,
                  mtr: true,
                });

                text.set({
                  lockScalingFlip: true,
                  cornerStyle: 'circle',
                  cornerColor: 'blue',
                  transparentCorners: false,
                });

                canvas.centerObject(text);
                canvas.renderAll();
              });
            });
          </script>
        </head>
        <body>
          <canvas id="fabric-canvas" width="800" height="600"></canvas>
        </body>
      </html>
    `);
    newWindow.document.close(); // Close the document to finish writing
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images..."
        />
        <button type="submit">Search</button>
        <button type="button" onClick={handleGenerateQuote}>Generate Random Quote</button>
      </form>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((image, index) => (
          <div key={index} className="image-container">
            <img
              src={image.src.medium}
              alt={`img-${index}`}
              onClick={() => openImageInNewTab(index)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
      </Masonry>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default ImageGrid;
