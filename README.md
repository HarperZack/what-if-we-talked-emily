Zack Harper - harper.zack@gmail.com

Variables needed in .env (as strings) or GitHub Repository Secrets:

- GDRIVE_FOLDER_ID
    - ID of Folder media is pulled from. The last section of the URL when inside it in drive
- GDRIVE_SERVICE_ACCOUNT_KEY
    - json file that allows APIs to reach Google Drive
    1. Go to the Google Cloud Console Service Accounts Page.
    2. Select your project from the top dropdown menu.
    3. Click on the email address of your service account.
    4. Go to the Keys tab at the top.
    5. Click Add Key -> Create new key.
    6. Choose JSON and click Create.
    7. A .json file will automatically download to your computer.
- GOOGLE_FORM_URL
    - URL for Google form for linking and formatting

==================

7/28/26 - 0.1
- Setup basic structure with baseline CSS and headers for sections 
- Nav works and sits on top 
- No APIs or other connectivity is setup
- Going through plain text (config.js) for updating HTML elements
- Changed header to stay with scroll/focus
- Setup auto deploy on push to main

07/29/26 - 0.2
- Set up node.js in github pages building the site
- Set up secrets in github to hook into Google Drive API to get images from specified folder
- Fixed auto deploy to query for new images
- Added dummy images and gallery.json files to test locally
- Video and Picture parsing now exists in separate places for even more control
- Added video CSS in Photos and Videos section
- Refactored setup function to catch more errors