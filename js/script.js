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

    // Remove unused or unwanted sections
    if (configs.SITE_TOGGLES.includePDFs == false && configs.SITE_TOGGLES.includeVideos == false && configs.SITE_TOGGLES.includePhotos == false){
        removeSectionFromSite("nav4");
    }
    
    // Single fetch for gallery manifest to serve all sensitive data
    try {
        const response = await fetch('./assets/gallery.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        loadPhotos(data.photos || []);
        loadVideos(data.videos || []);
		loadPDFs(data.pdfs || []);

        // Fade in to cover up loading issues. Transition time and toggle are in configs.js
        if (configs.SITE_TOGGLES.fadeIn){
            document.documentElement.style.setProperty('--fade-duration', `${configs.SITE_CONFIGS.fadeInTime}s`);
            document.body.classList.add('loaded');
        }
    } catch (error) {
        console.error('Error loading gallery manifest:', error);
        
        const photoContainer = document.getElementById('image-gallery');
        const videoContainer = document.getElementById('video-gallery');
        const pdfContainer = document.getElementById('pdf-gallery');

        if (photoContainer) photoContainer.innerHTML = '<p>Unable to load images at this time.</p>';
        if (videoContainer) videoContainer.innerHTML = '<p>Unable to load videos at this time.</p>';
        if (pdfContainer) pdfContainer.innerHTML = '<p>Unable to load PDFs at this time.</p>';
    }
}

// Renders Photos
function loadPhotos(photos) {
	const photoSection = document.getElementById('photo-section');
    const galleryContainer = document.getElementById('image-gallery');

	// If no Photos came in the import, hide the section
    if (configs.SITE_TOGGLES.includePhotos == false || !photos || photos.length === 0) {
        if (photoSection) {
            photoSection.style.display = 'none';
        }
        return;
    }
	
    if (photoSection) {
        photoSection.style.display = 'block';
    }
	
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
	const videoSection = document.getElementById('video-section');
    const galleryContainer = document.getElementById('video-gallery');

	// If toggled off or no Videos came in the import, hide the section
    if (configs.SITE_TOGGLES.includeVideos == false || !videos || videos.length === 0) {
        if (videoSection) {
            videoSection.style.display = 'none';
        }
        return;
    }
	
    if (videoSection) {
        videoSection.style.display = 'block';
    }

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

// Renders a PDF's first page as an image
function loadPDFs(PDFs) {
    const pdfSection = document.getElementById('pdf-section'); 
    const galleryContainer = document.getElementById('pdf-gallery');

    // If toggled off or no PDFs came in the import, hide the section
    if (configs.SITE_TOGGLES.includePDFs == false || !PDFs || PDFs.length === 0) {
        if (pdfSection) {
            pdfSection.style.display = 'none';
        }
        return;
    }

    if (pdfSection) {
        pdfSection.style.display = 'block';
    }

    if (!galleryContainer) {
        console.log('pdf-gallery container not found');
        return;
    }

    galleryContainer.innerHTML = '';

    PDFs.forEach(PDF => {
        const srcPath = PDF.thumbnailUrl;

        if (!srcPath) {
            console.warn(`No thumbnail available for ${PDF.name}`);
            return;
        }

        const link = document.createElement('a');
        link.href = PDF.url.startsWith('./') ? PDF.url : `./${PDF.url}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.src = srcPath.startsWith('./') ? srcPath : `./${srcPath}`;
        img.alt = PDF.name || 'PDF Document';
        img.loading = 'lazy';

        link.appendChild(img);
        galleryContainer.appendChild(link);
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

function removeSectionFromSite(sectionId){
    const element = document.getElementById(sectionId);
    element.style.display = 'none';

    const headerNav = Array.from(document.querySelectorAll(`#navbarNav li`));
    for (const navItem of headerNav){
        if (navItem.innerHTML.includes(sectionId)){
            navItem.remove();
        }
    }
}