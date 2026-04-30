import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  sessionHash: string;
  permission: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Guard component that conditionally renders children based on permissions
 * @param permission - Single permission or array of permissions to check
 * @param requireAll - If true, requires all permissions; otherwise requires any
 * @param fallback - Optional component to render when permission is denied
 */
export default function PermissionGuard({
  sessionHash,
  permission,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions(sessionHash);

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check permissions
  let hasAccess = false;
  if (typeof permission === 'string') {
    hasAccess = hasPermission(permission);
  } else if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  }

  // Render children if has access, otherwise render fallback
  if (hasAccess) {
    return <>{children}</>;
  }

  // Default fallback for denied access
  if (fallback === null) {
    return (
      <div className="alert alert-warning d-flex align-items-center" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: 20 }}></i>
        <div>
          <strong>Access Denied</strong>
          <p className="mb-0 mt-1" style={{ fontSize: 13 }}>
            You don&apos;t have permission to access this resource.
          </p>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
}

