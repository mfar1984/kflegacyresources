"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  featured_image: string | null;
  read_time: string | null;
  published_date: string;
  created_at: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const itemsPerPage = 12;

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p className="mt-3">Loading news articles...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="hero section dark-background"
        style={{
          backgroundImage: 'url(/assets/img/news.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
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
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="zoom-out">
              <h1 className="with-separator">Latest News & Updates</h1>
              <p className="text-justify">Stay informed with the latest industry insights, company news, and project updates from ANSAR TECHNOLOGIES. Discover our innovations, achievements, and contributions to the engineering industry.</p>
              <div className="d-flex">
                <a href="#articles" className="btn-get-started">Browse Articles</a>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="200">
              <Image src="/assets/img/news-hero.png" className="img-fluid animated" alt="News at ANSAR TECHNOLOGIES" width={800} height={600} />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section id="articles" className="section light-background">
        <div className="container">
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                style={{ fontSize: '11px', textTransform: 'capitalize' }}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {currentArticles.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-newspaper" style={{ fontSize: '48px', color: '#6c757d' }}></i>
              <h4 className="mt-3">No Articles Found</h4>
              <p className="text-muted">Check back soon for new updates!</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {currentArticles.map((article, index) => (
                  <div key={article.id} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="card h-100 shadow-sm" style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}>
                      {/* Featured Image */}
                      {article.featured_image ? (
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          height: '220px', 
                          backgroundColor: '#f3f4f6',
                          borderBottom: '1px solid #e5e7eb',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}>
                          <Image
                            src={`/uploads/news/${article.featured_image}`}
                            alt={article.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        </div>
                      ) : (
                        <div style={{ height: '220px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image" style={{ fontSize: '48px', color: '#d1d5db' }}></i>
                        </div>
                      )}

                      {/* Card Body */}
                      <div className="card-body p-4">
                        {/* Category Badge */}
                        <span className="badge bg-primary mb-2" style={{ fontSize: '10px' }}>
                          {article.category}
                        </span>

                        {/* Title */}
                        <h5 className="card-title mb-2" style={{ fontSize: '14px', fontWeight: 600, lineHeight: '1.4' }}>
                          {article.title}
                        </h5>

                        {/* Excerpt */}
                        <p className="card-text text-muted mb-3" style={{ fontSize: '11px', lineHeight: '1.6' }}>
                          {article.excerpt.substring(0, 120)}...
                        </p>

                        {/* Meta */}
                        <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '10px', color: '#6b7280' }}>
                          <div>
                            <i className="bi bi-person me-1"></i>
                            {article.author}
                          </div>
                          <div>
                            <i className="bi bi-calendar me-1"></i>
                            {formatDate(article.published_date || article.created_at)}
                          </div>
                        </div>

                        {/* Read More Button */}
                        <Link href={`/news/${article.slug}`} className="btn btn-outline-primary btn-sm w-100" style={{ fontSize: '11px' }}>
                          <i className="bi bi-arrow-right me-2"></i>Read More
                          {article.read_time && <span className="ms-2">• {article.read_time}</span>}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{ fontSize: '11px' }}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(page)}
                            style={{ fontSize: '11px' }}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{ fontSize: '11px' }}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}

              {/* Showing info */}
              <div className="text-center mt-3" style={{ fontSize: '11px', color: '#6b7280' }}>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

