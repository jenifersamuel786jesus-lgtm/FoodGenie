import React, { useState } from 'react';
import { Camera, Upload, Link as LinkIcon, Check, X, Sparkles } from 'lucide-react';
import { GENERATED_IMAGES } from '../../data/seedData.ts';
import { containsHtml } from '../../utils/security.ts';

interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  url: string;
}

// Preset avatars curated for FoodGenie diners & culinary enthusiasts
const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'diner-original',
    name: 'Jenifer Samuel',
    role: 'Verified Diner',
    url: GENERATED_IMAGES.avatar,
  },
  {
    id: 'chef-toque',
    name: 'Executive Chef',
    role: 'Artisanal Kitchen',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'gourmet-critic',
    name: 'Gourmet Critic',
    role: 'Food & Wine Connoisseur',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'baker-patisserie',
    name: 'Artisan Baker',
    role: 'Sourdough & Pastry Specialist',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'street-explorer',
    name: 'Street Food Explorer',
    role: 'Global Culinary Traveler',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barista-specialty',
    name: 'Espresso Barista',
    role: 'Single-Origin Coffee Lover',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  },
];

interface AvatarEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  onSaveAvatar: (newUrl: string) => Promise<boolean | void>;
}

export default function AvatarEditorModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSaveAvatar,
}: AvatarEditorModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatarUrl);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const compressAndCropAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Target avatar dimension: 320x320 square
            const size = 320;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(img.src);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Center-crop (cover) calculation to keep aspect ratio perfect
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

            // Export as optimized JPEG at 0.85 quality (~25KB-35KB)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(compressedDataUrl);
          } catch {
            resolve(img.src);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image element.'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File is too large. Please select an image under 15MB.');
      return;
    }

    try {
      setProcessing(true);
      const compressedDataUrl = await compressAndCropAvatar(file);
      setSelectedUrl(compressedDataUrl);
    } catch {
      setUploadError('Failed to process image. Please try another image file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    if (containsHtml(trimmed) || trimmed.toLowerCase().startsWith('javascript:')) {
      setUploadError('Image URL cannot contain HTML tags (e.g. <h1>test</h1>) or scripts.');
      return;
    }
    setUploadError(null);
    setSelectedUrl(trimmed);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveAvatar(selectedUrl);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-stone-200/90 shadow-2xl p-6 md:p-7 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D94E1F] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-stone-950">
                Edit Profile Picture
              </h2>
              <p className="text-xs text-stone-500">
                Personalize your diner avatar across FoodGenie
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <div className="relative">
            <img
              src={selectedUrl || currentAvatarUrl}
              alt="Avatar Preview"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md bg-stone-200"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-stone-900">Live Avatar Preview</p>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              This photo will appear next to your reviews, orders, and greeting pill in the header.
            </p>
            {selectedUrl !== currentAvatarUrl && (
              <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                New photo ready to save
              </span>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Curated Avatars
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Upload Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#D94E1F] text-[#D94E1F]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Image Link
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-500">
              Select one of our curated culinary character portraits:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedUrl(preset.url)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center text-center ${
                      isSelected
                        ? 'border-[#D94E1F] bg-orange-50/50 shadow-xs ring-2 ring-orange-200'
                        : 'border-stone-200 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover mb-2 border border-stone-200 bg-stone-100"
                    />
                    <p className="font-semibold text-stone-900 text-xs line-clamp-1">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-stone-500 line-clamp-1">
                      {preset.role}
                    </p>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D94E1F] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {processing ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-orange-50/50">
                <div className="w-8 h-8 border-3 border-[#D94E1F] border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-semibold text-stone-900">
                  Optimizing photo for your profile avatar...
                </span>
                <span className="text-[11px] text-stone-500 mt-1">
                  Resizing and cropping to crisp 320x320 portrait
                </span>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#D94E1F] rounded-xl p-8 text-center cursor-pointer transition-colors bg-stone-50/60 hover:bg-orange-50/20">
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-xs font-semibold text-stone-900">
                  Click to browse photo from your device
                </span>
                <span className="text-[11px] text-stone-500 mt-1">
                  Supports JPG, PNG, WebP (Auto-optimized for avatar)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
            {uploadError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleApplyUrl} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Web Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900 font-mono text-xs"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-500">
              Paste any public avatar URL from Cloudinary, Gravatar, Unsplash, or GitHub.
            </p>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#D94E1F] hover:bg-stone-900 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Picture'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
