import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { searchImages } from './pexelsService';
import { fetchRandomQuote } from './quoteService';

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const ImageGrid = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [quote, setQuote] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preparedImages, setPreparedImages] = useState([]);

  useEffect(() => {
    if (images.length > 0) {
      prepareImagesWithText();
    }
  }, [images]);

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleGenerateQuote = async () => {
    try {
      const randomQuote = await fetchRandomQuote();
      setQuote(randomQuote);

      // Use the entire quote for the search query
      setQuery(randomQuote);

      if (randomQuote) {
        performSearch(randomQuote);
      }
    } catch (error) {
      console.error('Error generating images:', error);
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return; // Avoid search if the query is empty

    try {
      const photos = await searchImages(searchQuery);
      setImages(photos);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const prepareImagesWithText = async () => {
    const updatedImages = await Promise.all(images.map(async (image) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Handle CORS if needed

      const imageBrightness = await calculateImageBrightness(image);

      return new Promise((resolve) => {
        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);

          // Define text properties
          let fontSize = Math.max(canvas.width / 20, 20); // Set minimum font size
          let font = `bold ${fontSize}px Futura, Arial`;

          context.font = font;
          context.fillStyle = getTextColor(imageBrightness);
          context.textAlign = 'center';
          context.textBaseline = 'middle';

          const text = `"${query.toUpperCase()}"`;
          const textLines = wrapText(context, text, canvas.width * 0.9); // 90% of image width
          const textPosition = getTextPosition(canvas.width, canvas.height, textLines.length);

          textLines.forEach((line, index) => {
            context.fillText(line, canvas.width / 2, textPosition.y + (index * (fontSize + 10))); // Adjust line height
          });

          canvas.toBlob((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            resolve({ ...image, src: blobUrl });
          }, 'image/jpeg');
        };

        img.src = image.src.medium;
      });
    }));

    setPreparedImages(updatedImages);
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const moveToNext = () => {
    setCurrentIndex((currentIndex + 1) % preparedImages.length);
  };

  const moveToPrev = () => {
    setCurrentIndex((currentIndex + preparedImages.length - 1) % preparedImages.length);
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

  const downloadImage = async (url, filename) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Handle CORS if needed

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        // Add text overlay
        const imageBrightness = await calculateImageBrightness(img);
        const textColor = getTextColor(imageBrightness);
        const textPosition = getTextPosition(canvas.width, canvas.height, 1); // Assume 1 line of text

        context.font = 'bold 36px Futura, Arial'; // Use Futura font or fallback
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const formattedText = `"${query.toUpperCase()}"`;
        context.fillText(formattedText, textPosition.x, textPosition.y);

        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob');
            return;
          }

          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 'image/jpeg');
      };

      img.src = url;
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const calculateImageBrightness = (image) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Handle CORS if needed

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

        // Using luminance formula to determine brightness
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        resolve(brightness);
      };

      img.src = image.src.medium;
    });
  };

  const getTextColor = (brightness) => {
    return brightness < 128 ? 'white' : 'black';
  };

  const getTextPosition = (width, height, numberOfLines) => {
    return {
      x: width / 2,
      y: height / 2 - (numberOfLines * 20) / 2 // Center text vertically, adjusting for number of lines
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
        {preparedImages.map((image, index) => (
          <div key={index} className="image-container">
            <img
              src={image.src}
              alt={`img-${index}`}
              onClick={() => openLightbox(index)}
              style={{ cursor: 'pointer' }}
            />
            <button onClick={() => downloadImage(image.src, `image-${index}.jpg`)}>Download</button>
          </div>
        ))}
      </Masonry>

      {isOpen && (
        <Lightbox
          mainSrc={preparedImages[currentIndex].src}
          nextSrc={preparedImages[(currentIndex + 1) % preparedImages.length].src}
          prevSrc={preparedImages[(currentIndex + preparedImages.length - 1) % preparedImages.length].src}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={moveToPrev}
          onMoveNextRequest={moveToNext}
        />
      )}
    </div>
  );
};

export default ImageGrid;
