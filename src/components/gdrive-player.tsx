"use client";

import { getDriveEmbedUrl } from "@/lib/gdrive";

interface GDrivePlayerProps {
  fileId: string;
  isActive: boolean;
}

export function GDrivePlayer({ fileId, isActive }: GDrivePlayerProps) {
  return (
    <div className="absolute inset-0 bg-black">
      {isActive ? (
        <>
          <iframe
            src={getDriveEmbedUrl(fileId)}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
          />
          {/* Google Drive toolbar'ını (paylaş butonu) gizle */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-11 bg-black" />
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
        </div>
      )}
    </div>
  );
}
