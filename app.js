const canvas = document.querySelector('#meme-canvas');
const context = canvas.getContext('2d');
const imageUpload = document.querySelector('#image-upload');
const topText = document.querySelector('#top-text');
const bottomText = document.querySelector('#bottom-text');
const fontFamily = document.querySelector('#font-family');
const fontSize = document.querySelector('#font-size');
const fillColor = document.querySelector('#fill-color');
const outlineColor = document.querySelector('#outline-color');
const emptyHint = document.querySelector('#empty-hint');
const fileName = document.querySelector('#file-name');
const status = document.querySelector('#status');
const sizeOutput = document.querySelector('#font-size-value');

let photo = null;
let uploadedUrl = null;

function wrapText(text, maxWidth, size) {
  const words = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  context.font = `${size}px "${fontFamily.value}", sans-serif`;
  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (line && context.measureText(nextLine).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCaption(text, anchor) {
  if (!text.trim()) return;

  const size = Number(fontSize.value);
  const lineHeight = size * 1.08;
  const lines = wrapText(text, canvas.width - 104, size);
  const firstY = anchor === 'top'
    ? 52 + size
    : canvas.height - 42 - (lines.length - 1) * lineHeight;

  context.font = `${size}px "${fontFamily.value}", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.lineJoin = 'round';
  context.lineWidth = Math.max(5, size * 0.105);
  context.strokeStyle = outlineColor.value;
  context.fillStyle = fillColor.value;

  lines.forEach((line, index) => {
    const y = firstY + index * lineHeight;
    context.strokeText(line, canvas.width / 2, y, canvas.width - 84);
    context.fillText(line, canvas.width / 2, y, canvas.width - 84);
  });
}

function drawMeme() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (photo) {
    const scale = Math.max(canvas.width / photo.width, canvas.height / photo.height);
    const width = photo.width * scale;
    const height = photo.height * scale;
    context.drawImage(photo, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }

  drawCaption(topText.value, 'top');
  drawCaption(bottomText.value, 'bottom');
  emptyHint.hidden = Boolean(photo);
}

function useImage(source, name) {
  const nextPhoto = new Image();
  nextPhoto.onload = () => {
    photo = nextPhoto;
    fileName.textContent = name;
    status.textContent = 'Image loaded. Make it yours.';
    drawMeme();
  };
  nextPhoto.onerror = () => {
    status.textContent = 'That image could not be opened. Try another one.';
  };
  nextPhoto.src = source;
}

imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (!file) return;
  if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
  uploadedUrl = URL.createObjectURL(file);
  useImage(uploadedUrl, file.name);
});

document.querySelector('#sample-image').addEventListener('click', () => {
  const sample = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85';
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    photo = image;
    fileName.textContent = 'A quiet place (sample)';
    status.textContent = 'Sample loaded. Make it yours.';
    drawMeme();
  };
  image.onerror = () => {
    status.textContent = 'Sample unavailable. Choose an image from your device.';
  };
  image.src = sample;
});

[topText, bottomText, fontFamily, fillColor, outlineColor].forEach((control) => {
  control.addEventListener('input', drawMeme);
  control.addEventListener('change', drawMeme);
});

fontSize.addEventListener('input', () => {
  sizeOutput.value = fontSize.value;
  sizeOutput.textContent = fontSize.value;
  drawMeme();
});

document.querySelector('#download').addEventListener('click', () => {
  if (!photo) {
    status.textContent = 'Add an image before downloading your meme.';
    return;
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Could not export this image. Try another photo.';
      return;
    }
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'my-meme.png';
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = 'Your meme is on its way.';
  }, 'image/png');
});

drawMeme();