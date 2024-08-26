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
                const imageBrightness = await calculateImageBrightness({ src: { medium: preparedImage } });
                const textColor = getTextColor(imageBrightness);

                const textPosition = { x: 100, y: 100 }; // Default text position
                const textSize = { width: 200, height: 50 }; // Default text size

                const newWindow = window.open('', '_blank');
                if (!newWindow) {
                    console.error('Failed to open a new window. Please check your browser settings.');
                    return;
                }

                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Image Viewer</title>
                      <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #333; }
                        .canvas-container { position: relative; }
                        canvas { max-width: 100%; max-height: 100%; }
                        .control {
                          position: absolute;
                          width: 10px;
                          height: 10px;
                          background-color: #fff;
                          border: 1px solid #000;
                          cursor: pointer;
                        }
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
                        <div id="handle-tl" class="control" style="top: 0px; left: 0px;"></div>
                        <div id="handle-tr" class="control" style="top: 0px; right: 0px;"></div>
                        <div id="handle-bl" class="control" style="bottom: 0px; left: 0px;"></div>
                        <div id="handle-br" class="control" style="bottom: 0px; right: 0px;"></div>
                      </div>
                      <button class="download-btn" onclick="downloadImage()">Download</button>
                      <button class="color-btn" onclick="changeTextColor()">Change Text Color</button>
                      <script>
                        const canvas = document.getElementById('imageCanvas');
                        const context = canvas.getContext('2d');
                        const img = new Image();
                        img.src = '${preparedImage}';

                        let textColor = '${textColor}';
                        let textX = ${textPosition.x};
                        let textY = ${textPosition.y};
                        let textWidth = ${textSize.width};
                        let textHeight = ${textSize.height};

                        const handleTL = document.getElementById('handle-tl');
                        const handleTR = document.getElementById('handle-tr');
                        const handleBL = document.getElementById('handle-bl');
                        const handleBR = document.getElementById('handle-br');

                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          drawText();
                          positionHandles();
                        };

                        function drawText() {
                          context.clearRect(0, 0, canvas.width, canvas.height);
                          context.drawImage(img, 0, 0);

                          const fontSize = Math.max(textWidth / 10, 20);
                          context.font = 'bold ' + fontSize + 'px Futura, Arial';
                          context.fillStyle = textColor;
                          context.textAlign = 'center';
                          context.textBaseline = 'middle';

                          context.fillText("${quote.toUpperCase()}", textX + textWidth / 2, textY + textHeight / 2);
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

                        function positionHandles() {
                          handleTL.style.left = textX + 'px';
                          handleTL.style.top = textY + 'px';

                          handleTR.style.left = textX + textWidth - 10 + 'px';
                          handleTR.style.top = textY + 'px';

                          handleBL.style.left = textX + 'px';
                          handleBL.style.top = textY + textHeight - 10 + 'px';

                          handleBR.style.left = textX + textWidth - 10 + 'px';
                          handleBR.style.top = textY + textHeight - 10 + 'px';
                        }

                        function onMouseMove(e) {
                          if (e.target === handleTL) {
                            textX = e.clientX - canvas.getBoundingClientRect().left;
                            textY = e.clientY - canvas.getBoundingClientRect().top;
                            textWidth += handleBR.getBoundingClientRect().left - e.clientX;
                            textHeight += handleBR.getBoundingClientRect().top - e.clientY;
                          } else if (e.target === handleTR) {
                            textY = e.clientY - canvas.getBoundingClientRect().top;
                            textWidth = e.clientX - canvas.getBoundingClientRect().left - textX;
                            textHeight += handleBR.getBoundingClientRect().top - e.clientY;
                          } else if (e.target === handleBL) {
                            textX = e.clientX - canvas.getBoundingClientRect().left;
                            textWidth += handleBR.getBoundingClientRect().left - e.clientX;
                            textHeight = e.clientY - canvas.getBoundingClientRect().top - textY;
                          } else if (e.target === handleBR) {
                            textWidth = e.clientX - canvas.getBoundingClientRect().left - textX;
                            textHeight = e.clientY - canvas.getBoundingClientRect().top - textY;
                          }
                          drawText();
                          positionHandles();
                        }

                        handleTL.addEventListener('mousedown', () => {
                          document.addEventListener('mousemove', onMouseMove);
                        });
                        handleTR.addEventListener('mousedown', () => {
                          document.addEventListener('mousemove', onMouseMove);
                        });
                        handleBL.addEventListener('mousedown', () => {
                          document.addEventListener('mousemove', onMouseMove);
                        });
                        handleBR.addEventListener('mousedown', () => {
                          document.addEventListener('mousemove', onMouseMove);
                        });

                        document.addEventListener('mouseup', () => {
                          document.removeEventListener('mousemove', onMouseMove);
                        });
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
