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
  const [preparedImage, setPreparedImage] = useState(null);

  useEffect(() => {
    const openImageInNewWindow = async () => {
      if (preparedImage) {
        try {
          // Calculate the text color asynchronously
          const imageBrightness = await calculateImageBrightness({ src: { medium: preparedImage } });
          const textColor = getTextColor(imageBrightness);

          // Open a new window and check if it was successful
          const newWindow = window.open('', '_blank');
          if (!newWindow) {
            console.error('Failed to open a new window. Please check your browser settings.');
            return;
          }

          // Define a function to initialize Fabric.js and the canvas
          const initCanvasScript = `
            function initCanvas(canvasId, imageSrc, text, textColor) {
              const canvas = new fabric.Canvas(canvasId);
              fabric.Image.fromURL(imageSrc, (img) => {
                const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(scaleFactor);
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                  originX: 'left',
                  originY: 'top'
                });

                const textObj = new fabric.Text(text, {
                  left: canvas.width / 2,
                  top: canvas.height / 2,
                  fontSize: 30,
                  fill: textColor,
                  originX: 'center',
                  originY: 'center',
                  hasControls: true,
                  lockScalingFlip: true
                });
                canvas.add(textObj);
                canvas.setActiveObject(textObj);

                textObj.setControlsVisibility({
                  mt: true,
                  mb: true,
                  ml: true,
                  mr: true,
                  bl: true,
                  br: true,
                  tl: true,
                  tr: true,
                  mtr: true
                });

                canvas.on('object:scaling', () => canvas.renderAll());
                canvas.on('object:moving', () => canvas.renderAll());
                canvas.on('object:rotating', () => canvas.renderAll());
              }, { crossOrigin: 'Anonymous' });
            }
          `;

          newWindow.document.open();
          newWindow.document.write(`
            <html>
              <head>
                <title>Image Viewer</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #333; }
                  canvas { max-width: 100%; max-height: 100%; }
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
                <canvas id="imageCanvas" width="800" height="600"></canvas>
                <button class="download-btn" onclick="downloadImage('${preparedImage}')">Download</button>
                <button class="color-btn" onclick="changeTextColor()">Change Text Color</button>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.0.2/fabric.min.js"></script>
                <script>
                  ${initCanvasScript}
                  const imageSrc = '${preparedImage}';
                  const text = "${quote.toUpperCase()}";
                  const textColor = '${getTextColor(await calculateImageBrightness({ src: { medium: preparedImage } }))}';
                  initCanvas('imageCanvas', imageSrc, text, textColor);

                  function downloadImage(url) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = url.split('/').pop();
                    a.click();
                  }

                  function changeTextColor() {
                    const colors = ['white', 'black', 'red', 'blue', 'green'];
                    const canvas = window.fabric.Canvas.instances[0];
                    const textObjects = canvas.getObjects('text');
                    textObjects.forEach(text => {
                      text.set({ fill: colors[Math.floor(Math.random() * colors.length)] });
                    });
                    canvas.renderAll();
                  }
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
              onClick={() => prepareImageWithText(image)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default ImageGrid;
