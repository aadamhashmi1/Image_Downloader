import * as fabric from 'fabric';
// Initialize Fabric.js canvas
export const initCanvas = (canvasId, imageSrc, text) => {
  const canvas = new fabric.Canvas(canvasId);
  
  fabric.Image.fromURL(imageSrc, (img) => {
    canvas.setWidth(img.width);
    canvas.setHeight(img.height);
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    
    const fabricText = new fabric.Text(text, {
      left: 50,
      top: 50,
      fontSize: 30,
      fill: 'white',
      originX: 'center',
      originY: 'center',
      hasControls: true,
      lockRotation: false,
    });

    canvas.add(fabricText);

    canvas.on('object:modified', () => {
      // Optional: Handle events when the object is modified
    });
  });
};
