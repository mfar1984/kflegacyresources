"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to auth dashboard with hash
        router.push(`/auth/${data.hash}`);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="auth-container" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '10px',
        boxShadow: '12px 12px 28px rgba(44, 75, 142, 0.25), 0 14px 32px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="auth-header text-center" style={{
          background: 'linear-gradient(135deg, #2c4b8e 0%, #1e3a6d 100%)',
          padding: '40px 30px',
          color: 'white'
        }}>
          <div className="mb-3 d-flex justify-content-center align-items-center">
            <img 
              src="/assets/img/logo.png" 
              alt="KF Legacy Resources" 
              style={{ height: '80px', filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto' }}
            />
          </div>
          <p className="mb-0 opacity-75" style={{ fontSize: '12px' }}>
            Secure access to admin dashboard
          </p>
        </div>

        {/* Form */}
        <div className="auth-body" style={{ padding: '20px 30px 0' }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" style={{
              borderRadius: '12px',
              border: 'none',
              background: '#fee',
              color: '#c33',
              fontSize: '12px'
            }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="position-relative">
                <i
                  className="bi bi-person-circle"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    fontSize: '14px',
                    pointerEvents: 'none'
                  }}
                ></i>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  disabled={loading}
                  style={{
                    padding: '12px 16px 12px 40px',
                    fontSize: '12px',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c4b8e'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="position-relative">
                <i
                  className="bi bi-shield-lock"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    fontSize: '14px',
                    pointerEvents: 'none'
                  }}
                ></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  style={{
                    padding: '12px 45px 12px 40px',
                    fontSize: '12px',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c4b8e'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-link position-absolute"
                  style={{
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '4px 8px',
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                  disabled={loading}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-grid mb-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  padding: '14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2c4b8e 0%, #1e3a6d 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(44, 75, 142, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(44, 75, 142, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(44, 75, 142, 0.4)';
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Access Portal
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="d-flex align-items-center justify-content-center" style={{ height: '56px' }}>
            <Link 
              href="/" 
              className="text-decoration-none"
              style={{ 
                color: '#666', 
                fontSize: '12px',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#2c4b8e'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer text-center" style={{
          padding: '20px 30px',
          background: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
            <i className="bi bi-shield-check me-1"></i>
            Secured by Advanced Cryptographic Protocols
          </p>
        </div>
      </div>
    </div>
  );
}
