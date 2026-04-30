import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  try {
    // Fetch the article
    const articles = await query(
      `SELECT * FROM news_articles WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug as string]
    ) as any[];

    if (articles.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = articles[0];

    // Fetch related articles from same category (exclude current article)
    const relatedArticles = await query(
      `SELECT id, title, slug, excerpt, category, published_date, created_at
       FROM news_articles 
       WHERE category = ? AND slug != ? AND status = 'published'
       ORDER BY published_date DESC
       LIMIT 3`,
      [article.category, slug as string]
    );

    res.status(200).json({
      article,
      relatedArticles
    });
  } catch (error) {
    console.error('News detail API error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
}

