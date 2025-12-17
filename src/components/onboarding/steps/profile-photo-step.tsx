"use client";

import { useState, useRef } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Camera, Upload, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfilePhotoStep() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [image, setImage] = useState(data.image);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleContinue = () => {
    updateData({ image });
    nextStep();
  };

  const handleSkip = () => {
    updateData({ image: "" });
    nextStep();
  };

  const removeImage = () => {
    setImage("");
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-linkedin-text-dark mb-2">
          Add a profile photo
        </h1>
        <p className="text-linkedin-text-gray">
          Members with a photo get up to 21x more profile views
        </p>
      </div>

      <div className="space-y-6">
        {/* Photo Preview / Upload Area */}
        <div className="flex flex-col items-center">
          {image ? (
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-linkedin-blue">
                <img
                  src={image}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border border-linkedin-border-gray shadow-md flex items-center justify-center hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-linkedin-blue rounded-full flex items-center justify-center hover:bg-linkedin-blue-hover"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-40 h-40 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                isDragging
                  ? "border-linkedin-blue bg-linkedin-blue/5"
                  : "border-linkedin-border-gray hover:border-linkedin-blue"
              )}
            >
              <User className="w-16 h-16 text-linkedin-border-gray" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-linkedin-blue bg-linkedin-blue/5"
                : "border-linkedin-border-gray"
            )}
          >
            <Upload className="w-8 h-8 mx-auto text-linkedin-text-gray mb-3" />
            <p className="text-sm text-linkedin-text-gray mb-2">
              Drag and drop your photo here, or
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-linkedin-blue font-semibold hover:underline"
            >
              browse to upload
            </button>
            <p className="mt-2 text-xs text-linkedin-text-gray">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={prevStep}
            className="btn-secondary flex-1 py-3"
          >
            Back
          </button>
          {image ? (
            <button onClick={handleContinue} className="btn-primary flex-1 py-3">
              Continue
            </button>
          ) : (
            <button onClick={handleSkip} className="btn-primary flex-1 py-3">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
