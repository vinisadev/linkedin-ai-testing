"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (url: string) => void;
  title: string;
  uploadEndpoint: string;
  currentImage?: string | null;
  aspectRatio?: "square" | "banner";
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  uploadEndpoint,
  currentImage,
  aspectRatio = "square",
}: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    const maxSize = aspectRatio === "banner" ? 8 : 4;
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onSuccess(data.url);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {/* Preview Area */}
        <div
          className={`relative border-2 border-dashed border-linkedin-border-gray rounded-lg overflow-hidden ${
            aspectRatio === "banner" ? "aspect-[3/1]" : "aspect-square max-w-[200px] mx-auto"
          }`}
        >
          {preview || currentImage ? (
            <>
              <img
                src={preview || currentImage || ""}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {preview && (
                <button
                  onClick={handleRemovePreview}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-linkedin-text-gray" />
                </button>
              )}
            </>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-linkedin-warm-gray transition-colors"
            >
              <Upload className="w-8 h-8 text-linkedin-text-gray mb-2" />
              <p className="text-sm text-linkedin-text-gray">Click to select an image</p>
              <p className="text-xs text-linkedin-text-gray mt-1">
                Max size: {aspectRatio === "banner" ? "8MB" : "4MB"}
              </p>
            </div>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Select Button */}
        {!preview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full btn-secondary"
          >
            Select Image
          </button>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-linkedin-border-gray">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-linkedin-text-gray hover:text-linkedin-text-dark"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
