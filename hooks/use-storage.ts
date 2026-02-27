import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase-client';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (uri: string, path: string) => {
    setUploading(true);
    setError(null);
    try {
      // 1. Fetch blob from URI
      const response = await fetch(uri);
      const blob = await response.blob();

      // 2. Create reference
      const storageRef = ref(storage, path);

      // 3. Upload
      await uploadBytes(storageRef, blob);

      // 4. Get URL
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
};
