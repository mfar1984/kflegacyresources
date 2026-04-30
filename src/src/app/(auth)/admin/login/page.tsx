"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data?.hash) {
        try {
          // Set session token cookie for client APIs (fallback)
          document.cookie = `session_token=${data.hash}; path=/; max-age=86400; samesite=lax`; // secure omitted for localhost
        } catch {}
        router.push(`/auth/${data.hash}`);
      } else {
        setError(data?.message || "Invalid credentials");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%)', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.98)', borderRadius: 12,
        boxShadow: '12px 12px 28px rgba(30,58,138,0.25), 0 14px 32px rgba(0,0,0,0.15)', overflow: 'hidden'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0b285f 100%)', padding: '36px 28px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/logo.png" alt="ANSAR TECHNOLOGIES" style={{ height: 96, filter: 'brightness(0) invert(1)' }} />
          </div>
        </div>

        <div style={{ padding: '22px 26px' }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center" style={{ borderRadius: 10, fontSize: 12 }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person-circle" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  style={{ padding: '12px 14px 12px 40px', fontSize: 12, borderRadius: 10, border: '2px solid #e5e7eb' }}
                />
              </div>
            </div>

            <div className="mb-3">
              <div style={{ position: 'relative' }}>
                <i className="bi bi-shield-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{ padding: '12px 44px 12px 40px', fontSize: 12, borderRadius: 10, border: '2px solid #e5e7eb' }}
                />
                <button
                  type="button"
                  className="btn btn-link"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-grid mb-3" style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ padding: '8px 12px', fontSize: 12, borderRadius: 10, width: '100%' }}>
                {loading ? (<><span className="spinner-border spinner-border-sm me-2" />Authenticating...</>) : (<>Access Portal</>)}
              </button>
            </div>
          </form>

          <div className="text-center" style={{ fontSize: 12 }}>
            <Link href="/" className="text-decoration-none"><i className="bi bi-arrow-left me-1"></i>Back to Home</Link>
          </div>
        </div>
        <div style={{ background: '#f3f4f6', padding: 14, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}><i className="bi bi-shield-check me-1"></i>Secured by Argon2id</span>
        </div>
      </div>
    </div>
  );
}


