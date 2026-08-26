"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface MediaUploaderProps {
  bucket: string;
  folder?: string;
  fileName?: string | ((fileExtension: string) => string);
  onUploadSuccess: (url: string, durationSeconds?: number) => void;
  accept?: string;
}

function safePathPart(value: string) {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function MediaUploader({ bucket, folder = "uploads", fileName, onUploadSuccess, accept = "image/*" }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      const file = event.target.files?.[0];
      if (!file) return;

      let detectedDuration = 0;
      if (file.type.startsWith('audio/')) {
        try {
          const audioUrl = URL.createObjectURL(file);
          const audio = new Audio(audioUrl);
          await new Promise((resolve) => {
            audio.onloadedmetadata = () => {
              detectedDuration = Math.round(audio.duration || 0);
              resolve(null);
            };
            audio.onerror = () => resolve(null);
          });
        } catch (e) {
          console.warn("Audio duration detection failed:", e);
        }
      }

      const fileExt = safePathPart(file.name.split('.').pop() || "");
      const uploadName =
        typeof fileName === "function"
          ? fileName(fileExt || "")
          : fileName || `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt || "bin"}`;
      const filePath = `${folder}/${uploadName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUploadSuccess(data.publicUrl, detectedDuration);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Input 
          type="file" 
          accept={accept}
          onChange={handleUpload}
          disabled={uploading}
          className="w-full max-w-sm"
        />
        {uploading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
