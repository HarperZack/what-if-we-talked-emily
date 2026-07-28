const google = require('googleapis').google;
const fs = require('fs');
const path = require('path');

// Folder in your project where images will be saved
const OUTPUT_DIR = path.join(__dirname, '../assets/images');

async function downloadGallery() {
  const folderId = process.env.GDRIVE_FOLDER_ID;
  const rawKey = process.env.GDRIVE_SERVICE_ACCOUNT_KEY;

  if (!folderId || !rawKey) {
    throw new Error("Missing GDRIVE_FOLDER_ID or GDRIVE_SERVICE_ACCOUNT_KEY secrets.");
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const credentials = JSON.parse(rawKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  console.log('Fetching file list from Google Drive...');
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id, name, mimeType)',
  });

  const files = response.data.files || [];
  console.log(`Found ${files.length} images.`);

  const manifest = [];

  for (const file of files) {
    // Sanitize filename to prevent space/special character issues in URLs
    const safeFilename = file.name.replace(/\s+/g, '_');
    const filePath = path.join(OUTPUT_DIR, safeFilename);
    const dest = fs.createWriteStream(filePath);

    const res = await drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'stream' }
    );

    await new Promise((resolve, reject) => {
      res.data.pipe(dest).on('finish', resolve).on('error', reject);
    });

    console.log(`Downloaded: ${safeFilename}`);
    manifest.push({
      id: file.id,
      name: file.name,
      url: `assets/images/${safeFilename}`
    });
  }

  // Write a JSON manifest so your front-end JS can load the image list dynamically
  fs.writeFileSync(
    path.join(__dirname, '../assets/gallery.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Manifest written to gallery.json');
}

downloadGallery().catch((err) => {
  console.error('Error syncing images:', err);
  process.exit(1);
});