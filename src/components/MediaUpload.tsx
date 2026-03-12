'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/utils';

interface MediaUploadProps {
    value: string; // Comma-separated URLs or single URL
    onChange: (value: string) => void;
    multiple?: boolean;
    label?: string;
    accept?: string;
}

export default function MediaUpload({ value, onChange, multiple = false, label, accept = "image/*,video/*" }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mediaItems = value ? value.split(',').filter(Boolean).map(s => s.trim()) : [];

    const isVideo = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        return ['mp4', 'mov', 'avi', 'webm'].includes(ext || '');
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.detail || 'Upload failed');
                }

                const data = await res.json();
                uploadedUrls.push(data.url);

                if (!multiple) break;
            }

            if (multiple) {
                const newUrls = [...mediaItems, ...uploadedUrls].join(', ');
                onChange(newUrls);
            } else {
                onChange(uploadedUrls[0]);
            }

            toast.success('Uploaded successfully');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeMedia = (index: number) => {
        const newMedia = [...mediaItems];
        newMedia.splice(index, 1);
        onChange(newMedia.join(', '));
    };

    return (
        <div className="space-y-3">
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            <div className="flex flex-wrap gap-3">
                {mediaItems.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group bg-black flex items-center justify-center">
                        {isVideo(url) ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <video
                                    src={url}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A.7.7 0 005 3.41V16.59a.7.7 0 001.3.569l10.7-6.59a.7.7 0 000-1.138l-10.7-6.59z" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <Image
                                src={getMediaUrl(url)}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}

                {(multiple || mediaItems.length === 0) && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-gray-400 hover:text-accent disabled:opacity-50"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                multiple={multiple}
                accept={accept}
                className="hidden"
            />

            <p className="text-[11px] text-gray-400">
                Supports: images and videos
            </p>
        </div>
    );
}
