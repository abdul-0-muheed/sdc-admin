import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

// Helper to extract Channel ID from various YouTube URL formats
async function getChannelIdFromUrl(urlOrId) {
  if (!urlOrId) return null;
  if (urlOrId.startsWith('UC')) return urlOrId; // It's already an ID
  
  try {
    const response = await fetch(urlOrId);
    const html = await response.text();
    
    // Look for the canonical link which contains the channel ID
    const match = html.match(/href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/);
    if (match && match[1]) return match[1];
    
    // Fallback: look for externalId in the JSON metadata
    const idMatch = html.match(/"externalId":"(UC[^"]+)"/);
    if (idMatch && idMatch[1]) return idMatch[1];
  } catch (e) {
    console.error("Failed to extract channel ID:", e);
  }
  
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url');
  
  if (!input) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const channelId = await getChannelIdFromUrl(input);
  
  if (!channelId) {
    return NextResponse.json({ error: 'Could not find Channel ID' }, { status: 404 });
  }
  
  try {
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    
    const items = feed.items.map((item, index) => ({
      title: item.title,
      platform: 'youtube',
      src: item.link,
      ytId: item.id.split(':').pop(),
      publishedAt: item.pubDate
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching YouTube RSS:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube feed' }, { status: 500 });
  }
}
