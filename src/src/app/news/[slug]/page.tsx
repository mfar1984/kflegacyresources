"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string | null;
  featured_image: string | null;
  gallery_images: string | null;
  read_time: string | null;
  published_date: string;
  created_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/news/${slug}`);
      if (!response.ok) throw new Error('Article not found');
      const data = await response.json();
      setArticle(data.article);
      setRelatedArticles(data.relatedArticles || []);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="main">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading article...</p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="main">
        <div className="container py-5 text-center">
          <h2>Article Not Found</h2>
          <p className="text-muted">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/news" className="btn btn-primary btn-sm mt-3">
            <i className="bi bi-arrow-left me-2"></i>Back to News
          </Link>
        </div>
      </main>
    );
  }

  const galleryImages = article.gallery_images ? article.gallery_images.split(',') : [];

  return (
    <main className="main">
      {/* Hero Section with Title */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: article.featured_image 
            ? `url(/uploads/news/${article.featured_image})` 
            : 'url(/assets/img/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          minHeight: '30vh'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row justify-content-center">
            <div className="col-lg-10" data-aos="zoom-out">
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0" style={{ fontSize: '11px' }}>
                  <li className="breadcrumb-item"><Link href="/" style={{ color: 'rgba(255,255,255,0.8)' }}>Home</Link></li>
                  <li className="breadcrumb-item"><Link href="/news" style={{ color: 'rgba(255,255,255,0.8)' }}>News</Link></li>
                  <li className="breadcrumb-item active" aria-current="page" style={{ color: 'white' }}>{article.category}</li>
                </ol>
              </nav>
              
              {/* Category Badge */}
              <span className="badge bg-primary mb-2" style={{ fontSize: '10px' }}>
                {article.category}
              </span>

              {/* Title */}
              <h1 className="mb-3" style={{ fontSize: '32px', fontWeight: 700, lineHeight: '1.3', color: 'white' }}>
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="d-flex align-items-center mb-3" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>
                <div className="me-4">
                  <i className="bi bi-person me-1"></i>
                  {article.author}
                </div>
                <div className="me-4">
                  <i className="bi bi-calendar me-1"></i>
                  {formatDate(article.published_date || article.created_at)}
                </div>
                {article.read_time && (
                  <div>
                    <i className="bi bi-clock me-1"></i>
                    {article.read_time}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            {/* Main Content - Full Width */}
            <div className="col-lg-10">
              {/* Excerpt */}
              <div className="mb-4 p-3" style={{ backgroundColor: '#f9fafb', borderLeft: '4px solid #0056b3', borderRadius: '4px' }}>
                <p className="mb-0" style={{ fontSize: '13px', fontStyle: 'italic', color: '#374151' }}>
                  {article.excerpt}
                </p>
              </div>

              {/* Content */}
              <div 
                className="article-content mb-5"
                style={{ fontSize: '13px', lineHeight: '1.8', color: '#374151' }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Gallery Images */}
              {galleryImages.length > 0 && (
                <div className="mb-5">
                  <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: 600 }}>Gallery</h5>
                  <div className="row g-3">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="col-md-3 col-sm-6">
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          height: '200px', 
                          borderRadius: '8px', 
                          overflow: 'hidden',
                          padding: '8px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                            <Image
                              src={`/uploads/news/${img.trim()}`}
                              alt={`Gallery image ${index + 1}`}
                              fill
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {article.tags && (
                <div className="mb-4">
                  <h6 className="mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>Tags:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {article.tags.split(',').map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="d-flex align-items-center gap-2 mb-4 pb-4 border-bottom">
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Share:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="mb-5">
                  <h5 className="mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>Related Articles</h5>
                  <div className="row g-4">
                    {relatedArticles.map(related => (
                      <div key={related.id} className="col-md-4">
                        <Link 
                          href={`/news/${related.slug}`}
                          className="card h-100 text-decoration-none"
                          style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                        >
                          <div className="card-body">
                            <span className="badge bg-primary mb-2" style={{ fontSize: '9px' }}>{related.category}</span>
                            <h6 className="mb-2" style={{ fontSize: '12px', fontWeight: 600, lineHeight: '1.4', color: '#111827' }}>
                              {related.title}
                            </h6>
                            <small style={{ fontSize: '10px', color: '#6b7280' }}>
                              <i className="bi bi-calendar me-1"></i>
                              {formatDate(related.published_date || related.created_at)}
                            </small>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="text-center">
                <Link href="/news" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-arrow-left me-2"></i>Back to News
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

