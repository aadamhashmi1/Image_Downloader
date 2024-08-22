import React, { useState } from 'react';


const ImageGallery = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpenLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {/* Example images, replace with your actual images */}
        <img
          src="https://via.placeholder.com/150"
          alt="Example"
          onClick={() => handleOpenLightbox('https://via.placeholder.com/600')}
          className="cursor-pointer"
        />
        {/* Add more images here */}
      </div>

      {lightboxOpen && (
        <ImageLightbox imageUrl={selectedImage} onClose={handleCloseLightbox} />
      )}
    </div>
  );
};

export default ImageGallery;
