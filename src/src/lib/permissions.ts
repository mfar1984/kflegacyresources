/**
 * Permission checking utilities for role-based access control
 */

export interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface UserPermissions {
  permissions: string[];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(perm => userPermissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}

/**
 * Button permission types
 */
export type ButtonAction = 'create' | 'edit' | 'delete' | 'approve' | 'show' | 'export' | 'import' | 'process' | 'payment' | 'view' | 'update' | 'pay' | 'close' | 'reply' | 'assign' | 'manage' | 'read';

/**
 * Generate permission name for a specific module and action
 */
export function getPermissionName(module: string, action: ButtonAction): string {
  return `${module}_${action}`;
}

/**
 * Check if user can perform an action on a module
 */
export function canPerformAction(
  userPermissions: string[],
  module: string,
  action: ButtonAction
): boolean {
  const permissionName = getPermissionName(module, action);
  return hasPermission(userPermissions, permissionName);
}

/**
 * Get allowed actions for a module
 */
export function getAllowedActions(
  userPermissions: string[],
  module: string,
  actions: ButtonAction[]
): ButtonAction[] {
  return actions.filter(action => canPerformAction(userPermissions, module, action));
}

/**
 * Permission categories for grouping
 */
export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'Dashboard',
  CONTENT: 'Content Management',
  SETTINGS: 'Settings',
  USERS: 'User Management',
  REPORTS: 'Reports',
  SYSTEM: 'System',
} as const;

/**
 * Default permissions list for seeding
 */
export const DEFAULT_PERMISSIONS = [
  // Dashboard
  { name: 'dashboard_view', description: 'View dashboard', category: 'Dashboard' },
  
  // Achievement Awards
  { name: 'achievement_view', description: 'View achievement awards', category: 'Content Management' },
  { name: 'achievement_create', description: 'Create achievement awards', category: 'Content Management' },
  { name: 'achievement_edit', description: 'Edit achievement awards', category: 'Content Management' },
  { name: 'achievement_delete', description: 'Delete achievement awards', category: 'Content Management' },
  
  // Career
  { name: 'career_view', description: 'View career postings', category: 'Content Management' },
  { name: 'career_create', description: 'Create career postings', category: 'Content Management' },
  { name: 'career_edit', description: 'Edit career postings', category: 'Content Management' },
  { name: 'career_delete', description: 'Delete career postings', category: 'Content Management' },
  { name: 'career_approve', description: 'Approve career applications', category: 'Content Management' },
  
  // Certificates
  { name: 'certificates_view', description: 'View certificates', category: 'Content Management' },
  { name: 'certificates_create', description: 'Upload certificates', category: 'Content Management' },
  { name: 'certificates_edit', description: 'Edit certificates', category: 'Content Management' },
  { name: 'certificates_delete', description: 'Delete certificates', category: 'Content Management' },
  
  // Procurement
  { name: 'procurement_view', description: 'View procurement requests', category: 'Content Management' },
  { name: 'procurement_create', description: 'Create procurement requests', category: 'Content Management' },
  { name: 'procurement_edit', description: 'Edit procurement requests', category: 'Content Management' },
  { name: 'procurement_delete', description: 'Delete procurement requests', category: 'Content Management' },
  { name: 'procurement_approve', description: 'Approve procurement requests', category: 'Content Management' },
  
  // Project Records
  { name: 'projects_view', description: 'View project records', category: 'Content Management' },
  { name: 'projects_create', description: 'Create project records', category: 'Content Management' },
  { name: 'projects_edit', description: 'Edit project records', category: 'Content Management' },
  { name: 'projects_delete', description: 'Delete project records', category: 'Content Management' },
  
  // News / Blogs
  { name: 'news_view', description: 'View news and blogs', category: 'Content Management' },
  { name: 'news_create', description: 'Create news and blogs', category: 'Content Management' },
  { name: 'news_edit', description: 'Edit news and blogs', category: 'Content Management' },
  { name: 'news_delete', description: 'Delete news and blogs', category: 'Content Management' },
  { name: 'news_approve', description: 'Approve news and blogs', category: 'Content Management' },
  
  // Helpdesk
  { name: 'helpdesk_view', description: 'View helpdesk tickets', category: 'Content Management' },
  { name: 'helpdesk_create', description: 'Create helpdesk tickets', category: 'Content Management' },
  { name: 'helpdesk_edit', description: 'Edit helpdesk tickets', category: 'Content Management' },
  { name: 'helpdesk_delete', description: 'Delete helpdesk tickets', category: 'Content Management' },
  // Helpdesk Clients
  { name: 'helpdesk_clients_view', description: 'View helpdesk clients', category: 'Content Management' },
  
  // Settings - Global Config
  { name: 'global_config_view', description: 'View global configuration', category: 'Settings' },
  { name: 'global_config_edit', description: 'Edit global configuration', category: 'Settings' },
  
  // Settings - Integration
  { name: 'integration_view', description: 'View integrations', category: 'Settings' },
  { name: 'integration_edit', description: 'Edit integrations', category: 'Settings' },
  
  // Settings - Role Groups
  { name: 'role_groups_view', description: 'View role groups', category: 'Settings' },
  { name: 'role_groups_create', description: 'Create role groups', category: 'Settings' },
  { name: 'role_groups_edit', description: 'Edit role groups', category: 'Settings' },
  { name: 'role_groups_delete', description: 'Delete role groups', category: 'Settings' },
  
  // Settings - Users
  { name: 'users_view', description: 'View users', category: 'User Management' },
  { name: 'users_create', description: 'Create users', category: 'User Management' },
  { name: 'users_edit', description: 'Edit users', category: 'User Management' },
  { name: 'users_delete', description: 'Delete users', category: 'User Management' },
  
  // Settings - Activity Logs
  { name: 'activity_logs_view', description: 'View activity logs', category: 'System' },
  { name: 'activity_logs_export', description: 'Export activity logs', category: 'System' },
];

