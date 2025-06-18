import API_BASE_URL from '../config';

export interface UploadResponse {
  imageUrl: string;
}

export const uploadProfileImage = async (file: any, token: string): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    
    // Create file object for React Native
    const fileToUpload = {
      uri: file.uri,
      type: file.mimeType || 'image/jpeg',
      name: file.fileName || 'profile-image.jpg',
    };
    
    formData.append('image', fileToUpload as any);
    
    const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to upload image');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteProfileImage = async (imageUrl: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/profile-image`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete image');
  }
};

export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL, prepend the API base URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  return imageUrl;
}; 