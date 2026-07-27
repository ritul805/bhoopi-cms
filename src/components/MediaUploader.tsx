"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2 } from "lucide-react";

interface MediaUploaderProps {
  bucket: string;
  folder?: string;
  onUploadSuccess: (url: string) => void;
  accept?: string;
}

export function MediaUploader({ bucket, folder = "uploads", onUploadSuccess, accept = "image/*" }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUploadSuccess(data.publicUrl);
    } catch (err: any) {
      setError(err.message);
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
