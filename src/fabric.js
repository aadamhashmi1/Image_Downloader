export function openEditor(preparedImage, quote) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Image Editor</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #333; }
            canvas { border: 1px solid #ccc; }
            .download-btn {
              position: fixed;
              top: 10px;
              right: 10px;
              background-color: #fff;
              padding: 5px 10px;
              border: none;
              cursor: pointer;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/6.3.0/fabric.min.js"></script>
        </head>
        <body>
          <canvas id="canvas"></canvas>
          <button class="download-btn" onclick="downloadImage()">Download</button>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const canvas = new fabric.Canvas('canvas');
              const img = new fabric.Image.fromURL('${preparedImage}', function(img) {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                  scaleX: canvas.width / img.width,
                  scaleY: canvas.height / img.height
                });
              });
  
              const text = new fabric.Textbox('${quote}', {
                left: 50,
                top: 50,
                fontSize: 24,
                fill: '#fff',
                editable: true,
                fontFamily: 'Arial',
                fontWeight: 'bold'
              });
              canvas.add(text);
              canvas.setHeight(window.innerHeight);
              canvas.setWidth(window.innerWidth);
  
              window.downloadImage = function() {
                const dataURL = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = 'edited-image.png';
                a.click();
              };
            });
          </script>
        </body>
      </html>
    `);
  }
  