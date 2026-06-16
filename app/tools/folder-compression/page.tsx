'use client';

import BulkCompress from '@/components/BulkCompress';

export default function FolderCompressionPage() {
  return (
    <BulkCompress
      folderMode
      title="Folder Compression"
      description="Select an entire folder of images and compress them all into one ZIP — directory contents processed locally in your browser."
    />
  );
}
