const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const credentials = require('./credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials.json'),
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

async function uploadFile(filePath, filename) {
  const fileMetadata = {
    name: filename,
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

  const fileId = response.data.id;

  // Make the file public
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Get the public URL
  const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

  return {
    id: fileId,
    url: fileUrl,
  };
}

module.exports = { uploadFile };
