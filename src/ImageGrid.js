// src/ImageGrid.js
import React, { useState, useRef, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { searchImages } from './pexelsService';
import { fetchRandomQuote } from './quoteService';
import * as fabric from 'fabric';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preparedImage, setPreparedImage] = useState(null);

  useEffect(() => {
    if (preparedImage) {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>Image Viewer</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #333; }
              img { max-width: 100%; max-height: 100%; }
              .download-btn {
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: #fff;
                padding: 5px 10px;
                border: none;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <img src="${preparedImage}" alt="Opened Image" />
            <button class="download-btn" onclick="downloadImage('${preparedImage}')">Download</button>
            <script>
              function downloadImage(url) {
                const a = document.createElement('a');
                a.href = url;
                a.download = url.split('/').pop();
                a.click();
              }
            </script>
          </body>
        </html>
      `);
    }
  }, [preparedImage]);

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

  const prepareImageWithText = async (image) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const imageBrightness = await calculateImageBrightness(image);

    return new Promise((resolve) => {
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        let fontSize = Math.max(canvas.width / 20, 20);
        let font = `bold ${fontSize}px Futura, Arial`;

        context.font = font;
        context.fillStyle = getTextColor(imageBrightness);
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const text = `"${quote.toUpperCase()}"`;
        const textLines = wrapText(context, text, canvas.width * 0.9);
        const textPosition = getTextPosition(canvas.width, canvas.height, textLines.length);

        textLines.forEach((line, index) => {
          context.fillText(line, canvas.width / 2, textPosition.y + (index * (fontSize + 10)));
        });

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      img.src = image.src.medium;
    }).then((dataUrl) => {
      setPreparedImage(dataUrl);
    });
  };

  const calculateImageBrightness = (image) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let r = 0, g = 0, b = 0, count = imageData.data.length / 4;

        for (let i = 0; i < imageData.data.length; i += 4) {
          r += imageData.data[i];
          g += imageData.data[i + 1];
          b += imageData.data[i + 2];
        }

        r = r / count;
        g = g / count;
        b = b / count;

        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        resolve(brightness);
      };

      img.src = image.src.medium;
    });
  };

  const getTextColor = (brightness) => {
    return brightness < 128 ? 'white' : 'black';
  };

  const wrapText = (context, text, maxWidth) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    return lines;
  };

  const getTextPosition = (width, height, numberOfLines) => {
    return {
      x: width / 2,
      y: height / 2 - (numberOfLines * 20) / 2
    };
  };

  const openImageInNewTab = (index) => {
    prepareImageWithText(images[index]);
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
    </div>
  );
};

export default ImageGrid;
