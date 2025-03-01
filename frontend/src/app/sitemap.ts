import type { MetadataRoute } from 'next'

// Simulated fetch function – replace with API or DB queries
async function getDynamicPages() {
  return [
    { url: '/blog/seo-guide', lastModified: '2024-02-29' },
    { url: '/blog/performance-tips', lastModified: '2024-02-25' },
    { url: '/product/123', lastModified: '2024-02-28' },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicPages = await getDynamicPages()

  return [
    {
      url: '/',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: '/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: '/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    ...dynamicPages.map((page) => ({
      url: page.url,
      lastModified: new Date(page.lastModified),
      // changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ]
}
