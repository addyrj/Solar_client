const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
    const dirs = [
        './files',
        './files/donor-logos',
        './files/device-images',
        './files/rew-photos' 
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = "./files";
        // Make sure to check for both singular and plural field names
        if (file.fieldname === 'logo') dest = "./files/donor-logos";
        else if (file.fieldname === 'rew_photo' || file.fieldname === 'rew_photos') dest = "./files/rew-photos";
        else if (file.fieldname === 'deviceImage') dest = "./files/device-images";
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const ext = path.extname(cleanName);
        const baseName = path.basename(cleanName, ext);
        cb(null, `${baseName}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.log(`❌ Rejected file: ${file.originalname} (${file.mimetype}) - Not an image`);
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;