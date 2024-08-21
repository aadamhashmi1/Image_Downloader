import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { searchImages } from './pexelsService';

const ImageGrid = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    const photos = await searchImages(query);
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

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">
          Search
        </button>
      </form>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column">
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
            </div>
          )}
        />
      )}
    </div>
  );
};

export default ImageGrid;
