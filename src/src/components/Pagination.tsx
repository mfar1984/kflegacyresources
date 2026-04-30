'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange
}: PaginationProps) {
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Show first page
    if (currentPage > 2) {
      pageNumbers.push(
        <li key={1} className="page-item">
          <button 
            className="page-link border-0"
            onClick={() => handlePageChange(1)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            1
          </button>
        </li>
      );
      
      // Show ellipsis if gap exists
      if (currentPage > 3) {
        pageNumbers.push(
          <li key="ellipsis-start" className="page-item disabled">
            <span className="page-link border-0" style={{ 
              fontSize: '12px',
              padding: '0',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>...</span>
          </li>
        );
      }
    }
    
    // Show previous page if exists
    if (currentPage > 1) {
      pageNumbers.push(
        <li key={currentPage - 1} className="page-item">
          <button 
            className="page-link border-0"
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentPage - 1}
          </button>
        </li>
      );
    }
    
    // Show current page (highlighted)
    pageNumbers.push(
      <li key={currentPage} className="page-item active">
        <button 
          className="page-link border-0"
          style={{ 
            fontSize: '12px',
            padding: '0',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontWeight: 500,
            border: 'none',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {currentPage}
        </button>
      </li>
    );
    
    // Show next page if exists
    if (currentPage < totalPages) {
      pageNumbers.push(
        <li key={currentPage + 1} className="page-item">
          <button 
            className="page-link border-0"
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentPage + 1}
          </button>
        </li>
      );
    }
    
    // Show last page
    if (currentPage < totalPages - 1) {
      // Show ellipsis if gap exists
      if (currentPage < totalPages - 2) {
        pageNumbers.push(
          <li key="ellipsis-end" className="page-item disabled">
            <span className="page-link border-0" style={{ 
              fontSize: '12px',
              padding: '0',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>...</span>
          </li>
        );
      }
      
      pageNumbers.push(
        <li key={totalPages} className="page-item">
          <button 
            className="page-link border-0"
            onClick={() => handlePageChange(totalPages)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {totalPages}
          </button>
        </li>
      );
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="d-flex justify-content-center">
      <ul className="pagination mb-0" style={{ gap: '4px' }}>
        {/* First Page (<<) */}
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link border-0" 
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(1)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentPage <= 1 ? '#d1d5db' : '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
            title="First Page"
          >
            &lt;&lt;
          </button>
        </li>

        {/* Previous (<) */}
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link border-0" 
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentPage <= 1 ? '#d1d5db' : '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
            title="Previous Page"
          >
            &lt;
          </button>
        </li>
        
        {/* Page Numbers */}
        {renderPageNumbers()}
        
        {/* Next (>) */}
        <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link border-0" 
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentPage >= totalPages ? '#d1d5db' : '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
            title="Next Page"
          >
            &gt;
          </button>
        </li>

        {/* Last Page (>>) */}
        <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link border-0" 
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(totalPages)}
            style={{ 
              fontSize: '12px',
              padding: '0',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: currentPage >= totalPages ? '#d1d5db' : '#6b7280',
              border: 'none',
              fontWeight: 500,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
            title="Last Page"
          >
            &gt;&gt;
          </button>
        </li>
      </ul>
    </nav>
  );
}

