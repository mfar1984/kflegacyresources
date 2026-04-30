import { useState, useEffect } from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, canPerformAction, ButtonAction } from '@/lib/permissions';

interface UsePermissionsReturn {
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canPerformAction: (module: string, action: ButtonAction) => boolean;
}

/**
 * Hook to check user permissions
 * @param sessionHash - The session hash to fetch permissions for
 */
export function usePermissions(sessionHash: string): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/user-permissions?hash=${sessionHash}`);
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        }
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionHash) {
      fetchPermissions();
    }
  }, [sessionHash]);

  return {
    permissions,
    loading,
    hasPermission: (permission: string) => hasPermission(permissions, permission),
    hasAnyPermission: (perms: string[]) => hasAnyPermission(permissions, perms),
    hasAllPermissions: (perms: string[]) => hasAllPermissions(permissions, perms),
    canPerformAction: (module: string, action: ButtonAction) => canPerformAction(permissions, module, action),
  };
}

