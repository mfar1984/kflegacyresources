import React, { CSSProperties } from 'react';

export type ActionType = 'view' | 'edit' | 'delete' | 'custom';

export interface ActionButton {
  type: ActionType;
  icon: string;
  color: string;
  title: string;
  onClick: () => void;
  show?: boolean;
}

interface AdminTableActionsProps {
  actions: ActionButton[];
}

const baseButtonStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 6px',
  marginRight: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const iconStyle: CSSProperties = {
  fontSize: '16px'
};

export const AdminTableActions: React.FC<AdminTableActionsProps> = ({ actions }) => {
  return (
    <>
      {actions
        .filter(action => action.show !== false)
        .map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            style={{
              ...baseButtonStyle,
              color: action.color,
              ...(index === actions.filter(a => a.show !== false).length - 1 && { marginRight: 0 })
            }}
            title={action.title}
          >
            <span className="material-symbols-outlined" style={iconStyle}>
              {action.icon}
            </span>
          </button>
        ))}
    </>
  );
};

// Preset action button configs
export const actionPresets = {
  view: (onClick: () => void, show: boolean = true): ActionButton => ({
    type: 'view',
    icon: 'visibility',
    color: '#2563eb',
    title: 'View Details',
    onClick,
    show
  }),
  edit: (onClick: () => void, show: boolean = true): ActionButton => ({
    type: 'edit',
    icon: 'edit',
    color: '#2563eb',
    title: 'Edit',
    onClick,
    show
  }),
  delete: (onClick: () => void, show: boolean = true): ActionButton => ({
    type: 'delete',
    icon: 'delete',
    color: '#dc2626',
    title: 'Delete',
    onClick,
    show
  })
};

