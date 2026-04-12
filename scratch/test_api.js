const fs = require('fs');

async function testCardGeneration() {
  console.log("1. Testing card mode generation...");
  const payload = {
    url: "https://google.com",
    theme: "neon cyberpunk city at night",
    mode: "card",
    cardTheme: "light",
    qrType: "url",
    name: "Alexander Sterling",
    title: "Managing Director",
    company: "Global Leadership",
    location: "Mayfair, London",
    email: "sterling@executive.com"
  };

  const res = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log("Success! Keys returned:", Object.keys(data));
  
  const cardBase64 = data.imageData.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync("test_generated_card.png", Buffer.from(cardBase64, 'base64'));
  console.log("Saved test_generated_card.png");

  if (data.artworkData) {
    const artBase64 = data.artworkData.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("test_generated_artwork.png", Buffer.from(artBase64, 'base64'));
    console.log("Saved test_generated_artwork.png");
  }

  if (data.qrCodeData) {
    const qrBase64 = data.qrCodeData.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFileSync("test_generated_qr.png", Buffer.from(qrBase64, 'base64'));
    console.log("Saved test_generated_qr.png");
  }
}

async function testSimpleGeneration() {
  console.log("2. Testing simple mode generation...");
  const payload = {
    url: "https://google.com",
    theme: "watercolor painting, soft colors, minimalist style",
    mode: "simple",
    cardTheme: "dark", // Testing dark theme simple card
  };

  const res = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log("Success! Keys returned:", Object.keys(data));
  
  const cardBase64 = data.imageData.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync("test_generated_simple.png", Buffer.from(cardBase64, 'base64'));
  console.log("Saved test_generated_simple.png");

  if (data.artworkData) {
    const artBase64 = data.artworkData.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("test_generated_simple_artwork.png", Buffer.from(artBase64, 'base64'));
    console.log("Saved test_generated_simple_artwork.png");
  }
}

async function run() {
  await testCardGeneration();
  console.log("---");
  await testSimpleGeneration();
  console.log("All tests completed successfully!");
}

run().catch(console.error);
