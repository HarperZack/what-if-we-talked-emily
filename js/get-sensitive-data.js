require('dotenv').config();
const google = require('googleapis').google;
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../assets/images');
const MANIFEST_PATH = path.join(__dirname, '../assets/gallery.json');
const MEDIA_DOWNLOAD_LIMIT = 100;

async function loadMedia() {
    const folderId = process.env.GDRIVE_FOLDER_ID;
    const rawKey = process.env.GDRIVE_SERVICE_ACCOUNT_KEY;

    if (!folderId || !rawKey) {
        throw new Error("Missing GDRIVE_FOLDER_ID or GDRIVE_SERVICE_ACCOUNT_KEY secrets.");
    }

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
        q: `'${folderId}' in parents and trashed = false and (mimeType starts with 'image/' or mimeType starts with 'video/')`,
        fields: 'files(id, name, mimeType)',
        pageSize: MEDIA_DOWNLOAD_LIMIT
    });

    const files = response.data.files || [];
    console.log(`Found ${files.length} media files (images/videos).`);

    const photos = [];
    const videos = [];

    for (const file of files) {
        const safeFilename = file.name.replace(/[\/\\:?*"<>|]/g, '_').replace(/\s+/g, '_');
        const filePath = path.join(OUTPUT_DIR, safeFilename);
        const dest = fs.createWriteStream(filePath);

        const downloadResponse = await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' }
        );

        await new Promise((resolve, reject) => {
            downloadResponse.data.pipe(dest).on('finish', resolve).on('error', reject);
        });

        console.log(`Downloaded: ${safeFilename}`);

        const mediaObject = {
            id: file.id,
            name: file.name,
            url: `assets/images/${safeFilename}`
        };

        if (file.mimeType.startsWith('video/')) {
            videos.push(mediaObject);
        } else if (file.mimeType.startsWith('image/')) {
            photos.push(mediaObject);
        }
    }

    return { photos, videos };
}


function getFormMetadata() {
    const rawFormUrl = process.env.GOOGLE_FORM_URL || '';
    
    // You can perform formatting or pre-fill query parameter manipulation here if needed
    let formattedUrl = rawFormUrl.trim();

    return {
        formUrl: formattedUrl,
        formEnabled: Boolean(formattedUrl)
    };
}


async function buildManifest() {
    console.log('Starting sync process...');

    // Step A: Fetch media assets
    const { photos, videos } = await loadMedia();

    // Step B: Fetch and format Google Form details
    const formData = getFormMetadata();

    // Step C: Construct final manifest
    const manifest = {
        lastUpdated: new Date().toISOString(),
        ...formData,
        photos,
        videos
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    console.log(`Manifest saved successfully! (${photos.length} photos, ${videos.length} videos)`);
}

// Execute build pipeline
buildManifest().catch((err) => {
    console.error('Error syncing media and secrets:', err);
    process.exit(1);
});