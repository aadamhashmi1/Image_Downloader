// src/ImageGrid.js
import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { searchImages } from './pexelsService';
import { fetchRandomQuote } from './quoteService';


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
  const [preparedImage, setPreparedImage] = useState(null);

  useEffect(() => {
    const openImageInNewWindow = async () => {
      if (preparedImage) {
        try {
          // Calculate image brightness and determine text color
          const imageBrightness = await calculateImageBrightness({ src: { medium: preparedImage } });
          const textColor = getTextColor(imageBrightness);
      
          // Open a new window
          const newWindow = window.open('', '_blank');
          if (!newWindow) {
            console.error('Failed to open a new window. Please check your browser settings.');
            return;
          }
      
          // Write HTML content to the new window
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Image Viewer</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #333; }
                .canvas-container { position: relative; }
                canvas { max-width: 100%; max-height: 100%; }
                .handle { 
                  position: absolute; 
                  width: 20px; 
                  height: 20px; 
                  background-color: rgba(255, 255, 255, 0.8); 
                  border: 1px solid #000; 
                  cursor: pointer; 
                }
                .handle-tl { top: 4px; left: 4px; cursor: nw-resize; }
                .handle-tr { top: 4px; right: 4px; cursor: ne-resize; }
                .handle-bl { bottom: 10px; left: 10px; cursor: sw-resize; }
                .handle-br { bottom: 10px; right: 10px; cursor: se-resize; }
                .download-btn, .color-btn { 
                  position: fixed; 
                  top: 10px; 
                  background-color: #fff; 
                  padding: 5px 10px; 
                  border: none; 
                  cursor: pointer; 
                  z-index: 1; 
                }
                .download-btn { right: 10px; }
                .color-btn { right: 120px; }
              </style>
            </head>
            <body>
              <div class="canvas-container">
                <canvas id="imageCanvas"></canvas>
                <div id="handle-tl" class="handle handle-tl"></div>
                <div id="handle-tr" class="handle handle-tr"></div>
                <div id="handle-bl" class="handle handle-bl"></div>
                <div id="handle-br" class="handle handle-br"></div>
              </div>
              <button class="download-btn" onclick="downloadImage()">Download</button>
              <button class="color-btn" onclick="changeTextColor()">Change Text Color</button>
              <script>
                const canvas = document.getElementById('imageCanvas');
                const context = canvas.getContext('2d');
                const img = new Image();
                img.src = '${preparedImage}';
                
                let textColor = '${textColor}';
                let textX = canvas.width / 2;
                let textY = canvas.height / 2;
                let fontSize = Math.max(canvas.width / 20, 20);
                const textHandleTl = document.getElementById('handle-tl');
                const textHandleTr = document.getElementById('handle-tr');
                const textHandleBl = document.getElementById('handle-bl');
                const textHandleBr = document.getElementById('handle-br');
                
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  drawText();
                };
  
                function drawText() {
                  context.clearRect(0, 0, canvas.width, canvas.height);
                  context.drawImage(img, 0, 0);
  
                  const font = \`bold \${fontSize}px Futura, Arial\`;
                  context.font = font;
                  context.fillStyle = textColor;
                  context.textAlign = 'center';
                  context.textBaseline = 'middle';
  
                  const text = '"${quote.toUpperCase()}"';
                  const textLines = wrapText(context, text, canvas.width * 0.9);
                  const textPosition = getTextPosition(canvas.width, canvas.height, textLines.length);
  
                  textLines.forEach((line, index) => {
                    context.fillText(line, textX, textY + (index * (fontSize + 10)));
                  });
  
                  updateHandles(textPosition, textLines.length, fontSize);
                }
  
                function updateHandles(textPosition, numberOfLines, fontSize) {
                  const textBoxWidth = canvas.width * 0.9;
                  const textBoxHeight = (fontSize + 10) * numberOfLines;
  
                  textHandleTl.style.top = \`\${textPosition.y - textBoxHeight / 2}px\`;
                  textHandleTl.style.left = \`\${textPosition.x - textBoxWidth / 2}px\`;
  
                  textHandleTr.style.top = \`\${textPosition.y - textBoxHeight / 2}px\`;
                  textHandleTr.style.left = \`\${textPosition.x + textBoxWidth / 2 - 20}px\`;
  
                  textHandleBl.style.top = \`\${textPosition.y + textBoxHeight / 2 - 20}px\`;
                  textHandleBl.style.left = \`\${textPosition.x - textBoxWidth / 2}px\`;
  
                  textHandleBr.style.top = \`\${textPosition.y + textBoxHeight / 2 - 20}px\`;
                  textHandleBr.style.left = \`\${textPosition.x + textBoxWidth / 2 - 20}px\`;
                }
  
                function changeTextColor() {
                  const colors = ['white', 'black', 'red', 'blue', 'green'];
                  textColor = colors[Math.floor(Math.random() * colors.length)];
                  drawText();
                }
  
                function downloadImage() {
                  const dataURL = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = dataURL;
                  a.download = 'image.png';
                  a.click();
                }
  
                function wrapText(context, text, maxWidth) {
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
                }
  
                function getTextPosition(width, height, numberOfLines) {
                  return {
                    x: width / 2,
                    y: height / 2 - (numberOfLines * 20) / 2
                  };
                }
  
                function onMouseMove(e, handle) {
                  if (e.buttons === 1) {
                    const rect = canvas.getBoundingClientRect();
                    const handleOffset = 10; // Offset from handle to the text center
                    
                    if (handle === 'tl') {
                      textX = e.clientX - rect.left + handleOffset;
                      textY = e.clientY - rect.top + handleOffset;
                    } else if (handle === 'tr') {
                      textX = e.clientX - rect.left - handleOffset;
                      textY = e.clientY - rect.top + handleOffset;
                    } else if (handle === 'bl') {
                      textX = e.clientX - rect.left + handleOffset;
                      textY = e.clientY - rect.top - handleOffset;
                    } else if (handle === 'br') {
                      textX = e.clientX - rect.left - handleOffset;
                      textY = e.clientY - rect.top - handleOffset;
                    }
  
                    drawText();
                  }
                }
  
                function onHandleMouseDown(e, handle) {
                  document.addEventListener('mousemove', (moveEvent) => onMouseMove(moveEvent, handle));
                  document.addEventListener('mouseup', onHandleMouseUp);
                }
  
                function onHandleMouseUp() {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onHandleMouseUp);
                }
  
                textHandleTl.addEventListener('mousedown', (e) => onHandleMouseDown(e, 'tl'));
                textHandleTr.addEventListener('mousedown', (e) => onHandleMouseDown(e, 'tr'));
                textHandleBl.addEventListener('mousedown', (e) => onHandleMouseDown(e, 'bl'));
                textHandleBr.addEventListener('mousedown', (e) => onHandleMouseDown(e, 'br'));
              </script>
            </body>
            </html>
          `);
  
          newWindow.document.close();
        } catch (error) {
          console.error('Error opening new window:', error);
        }
      }
    };
  
    openImageInNewWindow();
  }, [preparedImage, quote]);
  
  

  
  
  
  

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

  const prepareImageWithoutText = async (image) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    return new Promise((resolve) => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

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

 

  

  const openImageInNewTab = (index) => {
    prepareImageWithoutText(images[index]);
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
