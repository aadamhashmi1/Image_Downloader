// src/fabric.js
import * as fabric from 'fabric';

// Function to initialize the canvas and add text
export const initializeCanvas = (canvasRef, imageUrl, text) => {
  // Dispose of any existing canvas instance
  if (canvasRef.current && canvasRef.current.fabricCanvas) {
    canvasRef.current.fabricCanvas.dispose();
  }

  const canvas = new fabric.Canvas(canvasRef.current);
  canvasRef.current.fabricCanvas = canvas;

  const imgElement = new Image();
  imgElement.crossOrigin = 'Anonymous';
  imgElement.src = imageUrl;

  imgElement.onload = () => {
    fabric.Image.fromURL(imgElement.src, function(img) {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    const fabricText = new fabric.Textbox(text.toUpperCase(), {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 30,
      fill: '#fff',
      textAlign: 'center',
      selectable: true,
    });

    canvas.add(fabricText);
    fabricText.setControlsVisibility({
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

    fabricText.set({
      lockScalingFlip: true,
      cornerStyle: 'circle',
      cornerColor: 'blue',
      transparentCorners: false,
    });

    canvas.centerObject(fabricText);
    canvas.renderAll();
  };

  return canvas;
};
