"use client";

import { useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import type { UploadedFile } from "../types";

interface CompactOrderDetailsProps {
  description?: string;
  files?: UploadedFile[];
  onDescriptionChange: (description: string) => void;
  onFilesAdd: (files: UploadedFile[]) => void;
  onFileRemove: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function CompactOrderDetails({
  description,
  files = [],
  onDescriptionChange,
  onFilesAdd,
  onFileRemove,
  maxFiles = 10,
  maxSizeMB = 50,
}: CompactOrderDetailsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const processFiles = (raw: FileList | null) => {
    if (!raw) return;
    setError(null);
    const toAdd: UploadedFile[] = [];

    Array.from(raw).forEach((file) => {
      if (files.length + toAdd.length >= maxFiles) {
        setError(`Máximo de ${maxFiles} ficheiros.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`"${file.name}" excede ${maxSizeMB} MB.`);
        return;
      }
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setError(`"${file.name}" não é suportado.`);
        return;
      }
      toAdd.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? "image" : "video",
        name: file.name,
        size: file.size,
      });
    });

    if (toAdd.length > 0) onFilesAdd(toAdd);
  };

  const imageCount = files.filter((f) => f.type === "image").length;
  const videoCount = files.filter((f) => f.type === "video").length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      {/* Header */}
      <h3 className="text-base font-semibold text-slate-900">Detalhes do pedido</h3>

      {/* Description textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-900">
          Descrição adicional
        </label>
        <p className="text-xs text-slate-600">
          Opcional — descreva detalhes que ajudem a equipa CLYON
        </p>
        <textarea
          value={description || ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Exemplo: os móveis estão desmontados, há alguns sacos pequenos, o acesso é por garagem..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
          rows={4}
        />
        {description && (
          <p className="text-xs text-slate-500">
            {description.length} caracteres
          </p>
        )}
      </div>

      {/* Upload section */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        {/* Upload button */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar fotos ou vídeos
        </button>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* File counter */}
        {files.length > 0 && (
          <p className="text-xs text-slate-600">
            {files.length} ficheiro{files.length !== 1 ? "s" : ""} adicionado
            {files.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* File previews grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                {/* Thumbnail */}
                <div className="w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {file.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.previewUrl || ""}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs mt-1">Vídeo</p>
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onFileRemove(file.id)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                    <X className="w-3 h-3" />
                  </div>
                </button>

                {/* File name tooltip */}
                <p className="text-xs text-slate-600 truncate mt-1">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
