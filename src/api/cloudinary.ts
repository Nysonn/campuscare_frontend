const CLOUD_NAME = 'df3lhzzy7';
const UPLOAD_PRESET = 'unibuzz_unsigned';

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? 'Image upload failed');
  }

  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}
