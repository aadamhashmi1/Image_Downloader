import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { searchImages } from './pexelsService';
import { getRandomQuote } from './quotesService';
import { analyzeQuote } from './textAnalyticsService';

const ImageGrid = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quote, setQuote] = useState({ content: '', author: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    const photos = await searchImages(query);
    setImages(photos);
  };

  const fetchQuote = async () => {
    const randomQuote = await getRandomQuote();
    console.log('Fetched Quote:', randomQuote);
    setQuote(randomQuote);

    // Analyze the quote and fetch images based on the keyword
    const keyword = await analyzeQuote(randomQuote.content);
    console.log('Analyzed Keyword:', keyword);
    setQuery(keyword);  // Set the query to the analyzed keyword
    const photos = await searchImages(keyword);  // Fetch images based on the keyword
    setImages(photos);
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const moveToNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const moveToPrev = () => {
    setCurrentIndex((currentIndex + images.length - 1) % images.length);
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="mb-4 flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded ml-2">
          Search
        </button>
        <button
          type="button"
          onClick={fetchQuote}
          className="bg-green-500 text-white p-2 rounded ml-2"
        >
          Get Random Quote
        </button>
      </form>

      {quote.content && (
        <div className="mb-4 border p-4 rounded bg-gray-100">
          <p className="text-lg italic">"{quote.content}"</p>
          <p className="text-right mt-2">— {quote.author || 'Unknown'}</p>
        </div>
      )}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((image, index) => (
          <div key={image.id} className="cursor-pointer" onClick={() => openLightbox(index)}>
            <img
              src={image.src.medium}
              alt={image.alt}
              className="w-full h-auto"
            />
          </div>
        ))}
      </Masonry>

      {isOpen && (
        <Lightbox
          mainSrc={images[currentIndex].src.large}
          nextSrc={images[(currentIndex + 1) % images.length].src.large}
          prevSrc={images[(currentIndex + images.length - 1) % images.length].src.large}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={moveToPrev}
          onMoveNextRequest={moveToNext}
          imageCaption={(
            <div className="text-center">
              <p>{images[currentIndex].alt}</p>
              <p>Photographer: {images[currentIndex].photographer}</p>
              <p>Credits: <a href={images[currentIndex].photographer_url} target="_blank" rel="noopener noreferrer">{images[currentIndex].photographer}</a></p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(images[currentIndex].src.large, `image-${images[currentIndex].id}.jpg`);
                }}
                className="mt-2 bg-blue-500 text-white p-2 rounded"
              >
                Download Image
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default ImageGrid;
