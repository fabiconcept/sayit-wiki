import { Metadata } from 'next';

// Base metadata configuration
export const baseMetadata: Metadata = {
    title: {
        default: 'SayIt Wiki - Share Your Thoughts on the Digital Wall',
        template: '%s | SayIt Wiki',
    },
    description: 'A collaborative digital wall where you can share notes, thoughts, and ideas with the world. Create colorful sticky notes, comment on others, and be part of a growing community.',
    keywords: [
        'digital wall',
        'sayit wiki',
        'sayit wiki digital wall',
        'sayit wiki collaborative notes',
        'sayit wiki share thoughts',
        'sayit wiki community wall',
        'sayit wiki anonymous posting',
        'sayit wiki note sharing',
        'sayit wiki digital bulletin board',
        'sayit wiki sticky notes',
        'sayit wiki collaborative notes',
        'sayit wiki share thoughts',
        'sayit wiki community wall',
        'sayit wiki anonymous posting',
        'sayit wiki note sharing',
        'sayit wiki digital bulletin board',
        'sayit wiki sticky notes',
        'sayit wiki collaborative notes',
        'sayit wiki share thoughts',
        'sayit wiki community wall',
        'sayit wiki anonymous posting',
        'sayit wiki note sharing',
        'sayit wiki wall',
        'sayit wiki fabiconcept',
        'sayit wiki favour ajokubi',
        'sayit wiki favour ajokubi fabiconcept',
    ],
    authors: [{ name: 'Favour Ajokubi' }],
    creator: 'Fabiconcept',
    publisher: 'Fabiconcept',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    
    // Open Graph
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: 'SayIt Wiki',
        title: 'SayIt Wiki - Share Your Thoughts on the Digital Wall',
        description: 'A collaborative digital wall where you can share notes, thoughts, and ideas with the world.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SayIt Wiki - Digital Wall',
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: 'summary_large_image',
        title: 'SayIt Wiki - Share Your Thoughts',
        description: 'A collaborative digital wall for sharing notes and ideas.',
        images: ['/og-image.webp', '/og-image.png', '/og-image.jpg'],
        creator: '@goat_h2o',
    },

    // Icons
    icons: {
        icon: [
            { url: '/favicon/favicon.ico', sizes: 'any' },
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        shortcut: '/favicon/favicon.ico',
    },

    // Manifest
    manifest: '/manifest.json',

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // Verification
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
        // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
        // bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    },

    // Additional metadata
    category: 'Social',
    applicationName: 'SayIt Wiki',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'SayIt Wiki',
    },
    formatDetection: {
        telephone: false,
        email: false,
        address: false,
    },
};

// Metadata for viewing a specific note
export function getNoteMetadata(noteId: string, noteContent?: string): Metadata {
    const truncatedContent = noteContent 
        ? noteContent.substring(0, 160) + (noteContent.length > 160 ? '...' : '')
        : 'View this note on SayIt Wiki';

    return {
        title: noteContent ? `"${noteContent.substring(0, 60)}..."` : 'View Note',
        description: truncatedContent,
        openGraph: {
            type: 'article',
            url: `/note/${noteId}`,
            title: noteContent ? `"${noteContent.substring(0, 60)}..."` : 'View Note on SayIt Wiki',
            description: truncatedContent,
            images: [
                {
                    url: `/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: 'SayIt Wiki Note',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: noteContent ? `"${noteContent.substring(0, 60)}..."` : 'View Note',
            description: truncatedContent,
            images: ['/og-image.png'],
        },
    };
}

// Metadata for sharing a note
export function getShareNoteMetadata(noteContent?: string): Metadata {
    return {
        title: 'Share Note',
        description: noteContent 
            ? `Share this note: "${noteContent.substring(0, 100)}..."`
            : 'Share this note with others',
        openGraph: {
            type: 'website',
            title: 'Share Note - SayIt Wiki',
            description: 'Share this note with your friends and community',
            images: ['/og-image.png'],
        },
    };
}

// Metadata for creating a new note
export const createNoteMetadata: Metadata = {
    title: 'Create Note',
    description: 'Create and share a new note on the digital wall. Express your thoughts, ideas, or messages.',
    openGraph: {
        type: 'website',
        title: 'Create a Note - SayIt Wiki',
        description: 'Share your thoughts on the digital wall',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary',
        title: 'Create a Note',
        description: 'Share your thoughts on SayIt Wiki',
    },
};

// Metadata for privacy settings
export const privacyMetadata: Metadata = {
    title: 'Privacy Settings',
    description: 'Manage your privacy preferences and content moderation settings on SayIt Wiki.',
    openGraph: {
        type: 'website',
        title: 'Privacy Settings - SayIt Wiki',
        description: 'Control your privacy and content preferences',
    },
    robots: {
        index: false, // Don't index settings pages
        follow: true,
    },
};

// Metadata for admin panel
export const adminMetadata: Metadata = {
    title: 'Admin Panel',
    description: 'Manage reported content and moderate the community wall.',
    openGraph: {
        type: 'website',
        title: 'Admin Panel - SayIt Wiki',
        description: 'Content moderation and community management',
    },
    robots: {
        index: false, // Don't index admin pages
        follow: false,
    },
};

// JSON-LD structured data
export function getStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'SayIt Wiki',
        description: 'A collaborative digital wall where you can share notes, thoughts, and ideas with the world.',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        applicationCategory: 'SocialNetworkingApplication',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1000',
        },
    };
}

// Note structured data
export function getNoteStructuredData(noteId: string, noteContent: string, timestamp: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: noteContent.substring(0, 110),
        datePublished: timestamp,
        author: {
            '@type': 'Person',
            name: 'Anonymous User',
        },
        publisher: {
            '@type': 'Organization',
            name: 'SayIt Wiki',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/icon-512.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${process.env.NEXT_PUBLIC_APP_URL}/note/${noteId}`,
        },
    };
}
