const sharp = require('sharp');
const QRCode = require('qrcode');

const SIZE = 512;

async function testComposite() {
  console.log('Testing new artistic QR composite...');

  // 1. Generate a test gradient as fake "AI art" — output as PNG for sharp pipeline
  const artBase = await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 3,
      background: { r: 88, g: 28, b: 135 }
    }
  })
    .png()
    .toBuffer();

  console.log('Art base created');

  // 2. Create darkened version
  const darkArt = await sharp(artBase)
    .modulate({ brightness: 0.3, saturation: 0.7 })
    .removeAlpha()
    .png()
    .toBuffer();
  console.log('Dark art created');

  // 3. Create brightened version  
  const lightArt = await sharp(artBase)
    .modulate({ brightness: 1.4, saturation: 0.85 })
    .linear(0.6, 100)
    .removeAlpha()
    .png()
    .toBuffer();
  console.log('Light art created');

  // 4. Generate QR code
  const qrBuffer = await QRCode.toBuffer('https://example.com', {
    errorCorrectionLevel: 'H',
    width: SIZE,
    margin: 3,
    color: { dark: '#000000ff', light: '#ffffffff' },
  });
  console.log('QR buffer created');

  // 5. Create mask from QR
  const qrGray = await sharp(qrBuffer)
    .resize(SIZE, SIZE, { kernel: 'nearest' })
    .grayscale()
    .threshold(128)
    .raw()
    .toBuffer();
  console.log('QR mask raw size:', qrGray.length, 'expected:', SIZE * SIZE);

  // 6. Get raw pixels of lightArt
  const lightRaw = await sharp(lightArt)
    .resize(SIZE, SIZE)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  console.log('Light raw:', lightRaw.info);

  // 7. Create RGBA buffer: lightArt RGB + qrGray as alpha
  const rgbaBuffer = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) {
    rgbaBuffer[i * 4 + 0] = lightRaw.data[i * 3 + 0];
    rgbaBuffer[i * 4 + 1] = lightRaw.data[i * 3 + 1];
    rgbaBuffer[i * 4 + 2] = lightRaw.data[i * 3 + 2];
    rgbaBuffer[i * 4 + 3] = qrGray[i]; // white=255 where light modules, black=0 where dark
  }
  console.log('RGBA buffer created, size:', rgbaBuffer.length);

  // 8. Final composite: darkArt base + masked lightArt on top
  const finalImage = await sharp(darkArt)
    .resize(SIZE, SIZE)
    .composite([
      {
        input: rgbaBuffer,
        raw: { width: SIZE, height: SIZE, channels: 4 },
        blend: 'over',
      },
    ])
    .jpeg({ quality: 94 })
    .toBuffer();

  require('fs').writeFileSync('test_artistic_qr.jpg', finalImage);
  console.log('Done! Saved to test_artistic_qr.jpg, size:', finalImage.length, 'bytes');
}

testComposite().catch(console.error);
