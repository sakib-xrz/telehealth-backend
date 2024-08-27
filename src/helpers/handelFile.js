const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const config = require('../config/index.js');

// Cloudinary configuration
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

// Multer configuration for storing files locally
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: function (_req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Function for uploading files to Cloudinary
const uploadToCloudinary = async (file, options) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file.path,
            {
                folder: options?.folder,
                public_id: options?.public_id,
                filename_override: options?.filename_override,
                format: options?.format,
                overwrite: options?.overwrite ?? true,
                invalidate: options?.invalidate ?? true
            },
            (error, result) => {
                fs.unlinkSync(file.path);
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

// Function for deleting files from Cloudinary
const deleteFromCloudinary = async publicIds => {
    return new Promise((resolve, reject) => {
        cloudinary.api.delete_resources(
            publicIds,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

// Exporting the file uploader functionality
module.exports = {
    upload,
    uploadToCloudinary,
    deleteFromCloudinary
};
