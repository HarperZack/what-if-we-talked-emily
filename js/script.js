import * as configs from './config.js';

// Setup on Startup
document.title = configs.SITE_CONFIGS.title;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
} else {
    setup();
}


async function setup() {
    // Site Configs
    for (const [key, value] of Object.entries(configs.SITE_CONFIGS)) {
        setPageText(key, value);
    }
    // Header Navigation
    for (const [key, value] of Object.entries(configs.HEADER_NAV)) {
        setPageText(key, value);
    }

    // Single fetch for gallery manifest to serve both photos and videos
    try {
        const response = await fetch('./assets/gallery.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        loadPhotos(data.photos || []);
        loadVideos(data.videos || []);

    } catch (error) {
        console.error('Error loading gallery manifest:', error);
        
        const photoContainer = document.getElementById('image-gallery');
        const videoContainer = document.getElementById('video-gallery');

        if (photoContainer) photoContainer.innerHTML = '<p>Unable to load images at this time.</p>';
        if (videoContainer) videoContainer.innerHTML = '<p>Unable to load videos at this time.</p>';
    }
}

// Renders Photos
function loadPhotos(photos) {
    const galleryContainer = document.getElementById('image-gallery');
    if (!galleryContainer) {
		console.log('image-gallery container not found')
		return;
	}
    if (photos.length === 0) {
        galleryContainer.innerHTML = '<p>No images found in the gallery.</p>';
        return;
    }

    galleryContainer.innerHTML = '';

    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.url.startsWith('./') ? photo.url : `./${photo.url}`;
        img.alt = photo.name || 'A pretty picture of yours truly';
        img.loading = 'lazy';

        galleryContainer.appendChild(img);
    });
}

// Renders Videos
function loadVideos(videos) {
    const galleryContainer = document.getElementById('video-gallery');
    if (!galleryContainer) {
		console.log('video-gallery container not found')
		return;
	}
    if (videos.length === 0) {
        galleryContainer.innerHTML = '<p>No videos found in the gallery.</p>';
        return;
    }

    galleryContainer.innerHTML = '';

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';

        const vid = document.createElement('video');
        vid.src = video.url.startsWith('./') ? video.url : `./${video.url}`;
        vid.controls = true;
        vid.preload = 'metadata';

        card.appendChild(vid);
        galleryContainer.appendChild(card);
    });
}

function populateGoogleForm() {
    return true;
}

// Helper Functions
// Adds text to each part of the site based on Configs
function setPageText(elementPlaceholderName, input) {
    const allElements = document.getElementsByClassName(elementPlaceholderName.toString());
    for (const element of allElements) {
        element.innerText = input;
    }
}