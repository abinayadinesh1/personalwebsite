/**
 * Fetch the title of a webpage from its URL
 * Falls back to the domain name if title can't be extracted
 */
export async function fetchTitle(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArticleBot/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Try to extract <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

    // Try og:title as fallback
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      return ogTitleMatch[1].trim();
    }

    // Alternative og:title format
    const ogTitleMatch2 = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch2 && ogTitleMatch2[1]) {
      return ogTitleMatch2[1].trim();
    }

    // Fall back to domain name
    return new URL(url).hostname;
  } catch (error) {
    console.error('Error fetching title:', error);
    // Fall back to domain name
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}
