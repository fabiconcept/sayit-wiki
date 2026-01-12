import { useCallback } from 'react';

interface ShareOptions {
    text?: string;
    url?: string;
    hashtags?: string[];
}

type Platform = 'facebook' | 'twitter' | 'linkedin';

/**
 * Hook for generating social media share URLs
 * Supports Facebook, Twitter/X, and LinkedIn
 */
export function useSocialShare() {
    const generateShareUrl = useCallback((platform: Platform, options: ShareOptions): string => {
        const { text = '', url = '', hashtags = [] } = options;
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(url);
        const hashtagString = hashtags.map(tag => tag.replace('#', '')).join(',');

        switch (platform) {
            case 'twitter':
                return `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}${hashtags.length ? `&hashtags=${hashtagString}` : ''
                    }`;

            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

            default:
                return '';
        }
    }, []);

    const openShareWindow = useCallback((platform: Platform, options: ShareOptions) => {
        const shareUrl = generateShareUrl(platform, options);

        if (!shareUrl) return;

        // Open in popup window
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        window.open(
            shareUrl,
            'share-popup',
            `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0`
        );
    }, [generateShareUrl]);

    return {
        generateShareUrl,
        openShareWindow,
    };
}