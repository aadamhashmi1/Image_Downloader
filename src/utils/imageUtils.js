// utils/imageUtils.js

export const isImageDark = (imageUrl, callback) => {
    const img = new Image();
    img.src = imageUrl;
  
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
  
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let totalBrightness = 0;
  
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // Using the luminance formula
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalBrightness += brightness;
      }
  
      const avgBrightness = totalBrightness / (pixels.length / 4);
      callback(avgBrightness < 128); // Consider dark if brightness < 128
    };
  };
  