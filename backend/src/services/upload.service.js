const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

// ─── Ensure Upload Directory Exists ──────────────────────────────────────────

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    logger.info(`Upload directory created at: ${UPLOAD_DIR}`);
  }
}

ensureUploadDir();

// ─── Get Public URL for a File ────────────────────────────────────────────────

function getFileUrl(filename) {
  if (!filename) return null;
  return `${BASE_URL}/uploads/${filename}`;
}

// ─── Delete a File from Disk ──────────────────────────────────────────────────

async function deleteFile(filename) {
  if (!filename) return false;

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filename}`);
      return true;
    }
    logger.warn(`File not found for deletion: ${filename}`);
    return false;
  } catch (error) {
    logger.error(`Failed to delete file ${filename}:`, error.message);
    return false;
  }
}

// ─── Delete Multiple Files ────────────────────────────────────────────────────

async function deleteFiles(filenames = []) {
  const results = await Promise.all(filenames.map(deleteFile));
  return results.every(Boolean);
}

// ─── Validate File Exists ─────────────────────────────────────────────────────

function fileExists(filename) {
  if (!filename) return false;
  return fs.existsSync(path.join(UPLOAD_DIR, filename));
}

// ─── Get File Size in Bytes ───────────────────────────────────────────────────

function getFileSize(filename) {
  try {
    const stats = fs.statSync(path.join(UPLOAD_DIR, filename));
    return stats.size;
  } catch {
    return 0;
  }
}

// ─── Build KYC Document URLs ──────────────────────────────────────────────────

function buildKYCDocumentUrls(verification) {
  if (!verification) return null;
  return {
    ...verification,
    license_image_url: getFileUrl(verification.license_image),
    id_card_image_url: getFileUrl(verification.id_card_image),
    selfie_image_url: getFileUrl(verification.selfie_image)
  };
}

// ─── Move Temp File to Final Destination ──────────────────────────────────────

async function moveFile(sourcePath, destFilename) {
  const destPath = path.join(UPLOAD_DIR, destFilename);
  try {
    fs.renameSync(sourcePath, destPath);
    logger.info(`File moved to: ${destFilename}`);
    return destFilename;
  } catch (error) {
    logger.error(`Failed to move file:`, error.message);
    throw new Error('File processing failed');
  }
}

// ─── Clean Up Old/Orphaned Uploads (run as scheduled job) ─────────────────────

async function cleanOrphanedUploads(knownFilenames = []) {
  try {
    const allFiles = fs.readdirSync(UPLOAD_DIR);
    let cleaned = 0;

    for (const file of allFiles) {
      if (file === '.gitkeep') continue;
      if (!knownFilenames.includes(file)) {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

        // Only delete files older than 24 hours that are not referenced
        if (ageHours > 24) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    }

    logger.info(`Orphan cleanup complete. Removed ${cleaned} files.`);
    return cleaned;
  } catch (error) {
    logger.error('Orphan cleanup failed:', error.message);
    return 0;
  }
}

module.exports = {
  getFileUrl,
  deleteFile,
  deleteFiles,
  fileExists,
  getFileSize,
  buildKYCDocumentUrls,
  moveFile,
  cleanOrphanedUploads
};
