import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ButtonAction } from '@/lib/permissions';

interface PermissionButtonProps {
  sessionHash: string;
  module: string;
  action: ButtonAction;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  style?: React.CSSProperties;
}

/**
 * Button component with permission checking
 * Only renders if user has the required permission
 */
export default function PermissionButton({
  sessionHash,
  module,
  action,
  className = '',
  onClick,
  children,
  disabled = false,
  type = 'button',
  title,
  style,
}: PermissionButtonProps) {
  const { canPerformAction, loading } = usePermissions(sessionHash);

  // Don't render while loading permissions
  if (loading) {
    return null;
  }

  // Check if user has permission
  const hasPermission = canPerformAction(module, action);

  // Don't render if no permission
  if (!hasPermission) {
    return null;
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
    >
      {children}
    </button>
  );
}

