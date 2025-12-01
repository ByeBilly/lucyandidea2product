"use client";

import React from 'react';
import { Download, Play, Maximize2, Music, Share2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  createdAt: number | Date;
  cost: number;
  model: string;
}

interface AssetCardProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
  onShare?: (asset: Asset) => void;
}

// ============================================
// ASSET CARD COMPONENT
// ============================================

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, onShare }) => {
  const handleClick = () => {
    onClick?.(asset);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onShare) {
      onShare(asset);
      return;
    }

    // Default share behavior using Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out what I created!',
          text: asset.prompt,
          url: asset.url,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  const getFileExtension = () => {
    switch (asset.type) {
      case 'video': return 'mp4';
      case 'audio': return 'mp3';
      default: return 'png';
    }
  };

  const formatDate = (date: number | Date) => {
    const d = typeof date === 'number' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      {/* Media Preview */}
      <div className="aspect-video w-full bg-gray-900 relative flex items-center justify-center">
        {asset.type === 'image' ? (
          <img
            src={asset.url}
            alt={asset.prompt}
            className="w-full h-full object-cover"
          />
        ) : asset.type === 'video' ? (
          <video
            src={asset.url}
            className="w-full h-full object-cover"
            muted
            loop
            onMouseOver={e => e.currentTarget.play()}
            onMouseOut={e => e.currentTarget.pause()}
          />
        ) : (
          // Audio visualizer placeholder
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-purple-400 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
            {/* Visualizer effect background - static heights to avoid hydration mismatch */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-between px-4 pb-4 opacity-30 gap-1">
              {[40, 65, 30, 80, 55, 45, 70, 35, 60, 50].map((height, i) => (
                <div
                  key={i}
                  className="w-full bg-purple-500 rounded-t animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-4 bg-gray-800/80 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Maximize2 className="text-white w-6 h-6 drop-shadow-lg" />
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white uppercase flex items-center gap-1 border border-white/10 z-20">
          {asset.type === 'audio' && <Music className="w-3 h-3" />}
          {asset.type === 'video' && <Play className="w-3 h-3" />}
          {asset.type}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3">
        <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed" title={asset.prompt}>
          {asset.prompt}
        </p>
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500 border-t border-gray-700 pt-2">
          <span>{formatDate(asset.createdAt)}</span>
          <div className="flex items-center gap-2">
            {/* Cost Badge */}
            <span className="text-yellow-600/80 font-mono text-[10px]">
              {asset.cost || 0}cr
            </span>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="hover:text-blue-400 p-1 transition-colors"
              title="Share to Social Media"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Download Button */}
            <a
              href={asset.url}
              download={`lucy-${asset.id}.${getFileExtension()}`}
              className="hover:text-purple-400 p-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;




