import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.3,
    },
  ];
}
