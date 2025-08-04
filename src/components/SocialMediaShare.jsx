import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Link, Mail } from 'lucide-react';

const SocialMediaShare = ({ bookmark, className = "" }) => {
  const [showCopied, setShowCopied] = useState(false);

  const getShareText = () => {
    return `Check out this bookmark: ${bookmark.title}${bookmark.description ? ' - ' + bookmark.description : ''}`;
  };

  const getShareUrl = () => {
    return window.location.origin + '/bookmarks/' + bookmark._id;
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      hoverColor: 'hover:text-blue-500',
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      hoverColor: 'hover:text-blue-700',
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(getShareText())}`
    },
    {
      name: 'LinkedIn',
      icon: MessageCircle,
      color: 'text-blue-700',
      hoverColor: 'hover:text-blue-800',
      getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-500',
      hoverColor: 'hover:text-green-600',
      getUrl: () => `https://wa.me/?text=${encodeURIComponent(getShareText() + ' ' + getShareUrl())}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-gray-600',
      hoverColor: 'hover:text-gray-700',
      getUrl: () => `mailto:?subject=${encodeURIComponent('Check out this bookmark: ' + bookmark.title)}&body=${encodeURIComponent(getShareText() + '\n\n' + getShareUrl())}`
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText() + '\n' + getShareUrl());
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleShare = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-1">
        <Share2 size={14} className="text-gray-500" />
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.name}
              onClick={() => handleShare(link.getUrl())}
              className={`${link.color} ${link.hoverColor} transition-colors`}
              title={`Share on ${link.name}`}
              aria-label={`Share on ${link.name}`}
            >
              <Icon size={16} />
            </button>
          );
        })}
        <button
          onClick={copyToClipboard}
          className="text-gray-600 hover:text-gray-700 transition-colors relative"
          title="Copy link"
          aria-label="Copy link"
        >
          <Link size={16} />
          {showCopied && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialMediaShare;