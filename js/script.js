import * as configs from './config.js';

// Setup
document.title = configs.SITE_CONFIGS.title
setup();


// Functions
function setup(){
    // Site Configs
    for (const [key, value] of Object.entries(configs.SITE_CONFIGS)) {
        setPageText(key, value);
    }

    // Header Navigation
    for (const [key, value] of Object.entries(configs.HEADER_NAV)) {
        setPageText(key, value);
    }
};

function setPageText(elementPlaceholderName, input){
    const allElements = document.getElementsByClassName(elementPlaceholderName.toString());
    for (const element of allElements){
        element.innerText = input;
    }
}

