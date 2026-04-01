// Firebase configuration for Shaper Shed
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDeqarmdvtCd2hAtRu6eOFTcHUtJtang9c",
  authDomain: "shaper-shed.firebaseapp.com",
  projectId: "shaper-shed",
  storageBucket: "shaper-shed.firebasestorage.app",
  messagingSenderId: "150988173370",
  appId: "1:150988173370:web:aad8b3543b16bd3b0bc503",
  measurementId: "G-DB5TZZ39S3"
};

// Initialize Firebase (singleton pattern)
export function getFirebaseApp() {
  return getApps()[0] || initializeApp(firebaseConfig);
}

// Get storage instance
export function getFirebaseStorage() {
  const app = getFirebaseApp();
  return getStorage(app);
}

// Upload image file with progress tracking
export async function uploadImage(file, folder, onProgress) {
  const storage = getFirebaseStorage();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${timestamp}_${safeName}`;
  const fileRef = ref(storage, filePath);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: filePath,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// Upload video file with progress tracking
export async function uploadVideo(file, userId, onProgress) {
  return uploadImage(file, `videos/${userId}`, onProgress);
}

// Delete file from storage
export async function deleteFile(filePath) {
  const storage = getFirebaseStorage();
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
}

// Alias for backward compatibility
export const deleteVideo = deleteFile;

// Generate a shareable link (the download URL is already shareable)
export function generateShareableLink(videoUrl, videoId) {
  // For now, return the direct URL. Later we can add access control via backend
  return videoUrl;
}
