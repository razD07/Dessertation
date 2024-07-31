const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load the credentials from a file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Scopes for accessing Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let drive;

// Authenticate with Google Drive
async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });

  drive = google.drive({ version: 'v3', auth });
}

// Upload file to Google Drive
async function uploadFile(filePath, fileName) {
  if (!drive) {
    await authenticate();
  }

  const fileMetadata = {
    name: fileName,
    parents: ['11hs8KAAbI-xM--fgkno3wPLK9zTQahhg'], 
  };
  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  return response.data;
}

module.exports = {
  uploadFile,
};
