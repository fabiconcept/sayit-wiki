import { Metadata } from 'next';

// Base metadata configuration
export const baseMetadata: Metadata = {
    title: {
        default: 'SayIt Wiki - Drop a note, see what sticks',
        template: '%s | SayIt Wiki',
    },
    description: 'An anonymous digital wall where anyone can stick a note and say whatever\'s on their mind. No login, no BS, just thoughts.',
    keywords: [
        // Core brand terms
        'sayit wiki',
        'sayit',
        'say it wiki',
        
        // Primary features - anonymous/free
        'anonymous notes',
        'anonymous message board',
        'anonymous thoughts',
        'anonymous posting',
        'no login notes',
        'no signup message board',
        'free anonymous posting',
        'post anonymously',
        'anonymous wall',
        
        // Digital wall variations
        'digital wall',
        'online wall',
        'virtual wall',
        'message wall',
        'thought wall',
        'community wall',
        'public wall',
        'digital bulletin board',
        'online bulletin board',
        
        // Sticky notes angle
        'sticky notes online',
        'virtual sticky notes',
        'digital sticky notes',
        'online sticky notes',
        'post it notes online',
        'digital post it',
        
        // Action-based (how people search)
        'leave a note online',
        'post a message anonymously',
        'share thoughts anonymously',
        'write anonymous message',
        'post anonymous thoughts',
        'leave anonymous note',
        
        // Public/social sharing
        'public message board',
        'public notes',
        'share notes publicly',
        'public thoughts',
        'open message board',
        
        // Use cases
        'confessions',
        'anonymous confessions',
        'tell secrets',
        'vent anonymously',
        'random thoughts',
        'shower thoughts',
        
        // Comparison terms (SEO competitive)
        'like whisper app',
        'anonymous like yik yak',
        'free message board',
        'simple message board',
        
        // Comment/interaction
        'comment on notes',
        'read anonymous notes',
        'anonymous comments',
        
        // Creator attribution
        'fabiconcept',
        'favour ajokubi',
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
        title: 'SayIt Wiki - Drop a note, see what sticks',
        description: 'Anonymous digital wall. Stick a note, read others, comment. No login needed.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SayIt Wiki - Anonymous Digital Wall',
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: 'summary_large_image',
        title: 'SayIt Wiki - Anonymous Notes',
        description: 'Stick a note on the wall. No login, just vibes.',
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
        : 'Someone left this on the wall';

    return {
        title: noteContent ? `"${noteContent.substring(0, 60)}..."` : 'Check out this note',
        description: truncatedContent,
        openGraph: {
            type: 'article',
            url: `/note/${noteId}`,
            title: noteContent ? `"${noteContent.substring(0, 60)}..."` : 'Note from the wall',
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
            title: noteContent ? `"${noteContent.substring(0, 60)}..."` : 'Note from the wall',
            description: truncatedContent,
            images: ['/og-image.png'],
        },
    };
}

// Metadata for sharing a note
export function getShareNoteMetadata(noteContent?: string): Metadata {
    return {
        title: 'Share this note',
        description: noteContent 
            ? `Check out what someone said: "${noteContent.substring(0, 100)}..."`
            : 'Someone left this on the wall',
        openGraph: {
            type: 'website',
            title: 'Note from SayIt Wiki',
            description: 'Check out what someone wrote',
            images: ['/og-image.png'],
        },
    };
}

// Metadata for creating a new note
export const createNoteMetadata: Metadata = {
    title: 'Write a note',
    description: 'Got something to say? Stick it on the wall for everyone to see.',
    openGraph: {
        type: 'website',
        title: 'Write a note - SayIt Wiki',
        description: 'Say whatever\'s on your mind',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary',
        title: 'Write a note',
        description: 'Say it on the wall',
    },
};

// Metadata for privacy settings
export const privacyMetadata: Metadata = {
    title: 'Privacy stuff',
    description: 'Choose what you want to see (or not see) on the wall.',
    openGraph: {
        type: 'website',
        title: 'Privacy - SayIt Wiki',
        description: 'Control what you see',
    },
    robots: {
        index: false,
        follow: true,
    },
};

// Metadata for admin panel
export const adminMetadata: Metadata = {
    title: 'Admin',
    description: 'Keep the wall clean.',
    openGraph: {
        type: 'website',
        title: 'Admin - SayIt Wiki',
        description: 'Moderation stuff',
    },
    robots: {
        index: false,
        follow: false,
    },
};

// JSON-LD structured data
export function getStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'SayIt Wiki',
        description: 'An anonymous digital wall where anyone can stick a note and say whatever\'s on their mind.',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        applicationCategory: 'SocialNetworkingApplication',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
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
            name: 'Anonymous',
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