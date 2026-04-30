"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams?.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Verify email
    fetch(`/api/client/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setEmail(data.email);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      })
      .catch(error => {
        setStatus('error');
        setMessage('Failed to verify email. Please try again or contact support.');
        console.error('Verification error:', error);
      });
  }, [searchParams]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: '500px', width: '100%', margin: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', padding: '40px 30px', textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '0.3em' }}>
                <span className="visually-hidden">Verifying...</span>
              </div>
              <h2 style={{ marginTop: '20px', fontSize: '24px', fontWeight: 600 }}>Verifying Your Email</h2>
              <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Please wait...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>✅</div>
              <h2 style={{ margin: '10px 0', fontSize: '24px', fontWeight: 600 }}>Email Verified!</h2>
              <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Your account is now active</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>❌</div>
              <h2 style={{ margin: '10px 0', fontSize: '24px', fontWeight: 600 }}>Verification Failed</h2>
              <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Something went wrong</p>
            </>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {status === 'success' && (
            <>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#166534', fontSize: '14px', lineHeight: '1.6' }}>
                  <strong>Congratulations!</strong> Your email address has been successfully verified. You can now login to access your support portal.
                </p>
              </div>

              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', marginBottom: '12px' }}>
                  <i className="bi bi-key-fill me-2"></i>Your Login Credentials
                </h3>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>
                  <p style={{ margin: '8px 0' }}><strong>Login URL:</strong> <Link href="/auth/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Go to Login</Link></p>
                  <p style={{ margin: '8px 0' }}><strong>Username:</strong> {email}</p>
                  <p style={{ margin: '8px 0' }}><strong>Password:</strong> (The password you set during registration)</p>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link 
                  href="/auth/login"
                  style={{ 
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', 
                    color: 'white', 
                    padding: '14px 32px', 
                    borderRadius: '8px', 
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login to Support Portal
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#991b1b', fontSize: '14px', lineHeight: '1.6' }}>
                  <strong>Error:</strong> {message}
                </p>
              </div>

              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                <p>Possible reasons:</p>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>The verification link has expired (valid for 24 hours)</li>
                  <li>The link has already been used</li>
                  <li>The link is invalid or corrupted</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link 
                  href="/"
                  style={{ 
                    display: 'inline-block',
                    background: '#6b7280', 
                    color: 'white', 
                    padding: '12px 28px', 
                    borderRadius: '8px', 
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    marginRight: '10px'
                  }}
                >
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </Link>
                <a 
                  href="mailto:support@ansartechnologies.my"
                  style={{ 
                    display: 'inline-block',
                    background: '#3b82f6', 
                    color: 'white', 
                    padding: '12px 28px', 
                    borderRadius: '8px', 
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <i className="bi bi-envelope me-2"></i>
                  Contact Support
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: '#f9fafb', padding: '20px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            © {new Date().getFullYear()} Ansar Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

