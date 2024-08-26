loadFabricScript(function() {
  console.log('Fabric.js loaded');
  const canvas = new fabric.Canvas('c');
  console.log('Canvas initialized');

  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Ensure CORS if needed
  img.src = 'https://via.placeholder.com/600x400'; // Static image URL
  console.log('Image source set');

  img.onload = () => {
    console.log('Image loaded');
    canvas.setWidth(img.width);
    canvas.setHeight(img.height);
    const fabricImage = new fabric.Image(img);
    canvas.add(fabricImage);
    
    const text = new fabric.Textbox('${quote.toUpperCase()}', {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fill: '${textColor}',
      fontSize: 30,
      originX: 'center',
      originY: 'center',
      editable: true
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  img.onerror = () => { console.error('Failed to load the image.'); };

  window.changeTextColor = function() {
    const colors = ['white', 'black', 'red', 'blue', 'green'];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    canvas.getActiveObject().set('fill', newColor);
    canvas.requestRenderAll();
  };

  window.downloadImage = function() {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'image.png';
    a.click();
  };
});
