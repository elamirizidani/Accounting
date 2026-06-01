/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import moment from 'moment';

export const statusTone = {
  draft: 'muted',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  unpaid: 'warning',
  paid: 'success',
  overdue: 'danger',
  sent: 'info',
  cancelled: 'muted',
  structured: 'primary',
  unstructured: 'dark',
};

export function formatMoney(value, currency = 'RWF') {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} ${currency || ''}`.trim();
}

export function formatDate(value) {
  if (!value) return 'Not set';
  return moment(value).format('DD MMM YYYY');
}

export function normalizeStatus(status) {
  return String(status || 'draft').toLowerCase();
}

export function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const tone = statusTone[normalized] || 'muted';
  return (
    <span className={`ops-status ops-status-${tone}`}>
      <span className="ops-status-dot" />
      {normalized.replaceAll('-', ' ')}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="ops-page-header">
      <div>
        {eyebrow && <div className="ops-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ops-header-actions">{actions}</div>}
    </div>
  );
}

export function MetricCard({ label, value, helper, icon, tone = 'primary' }) {
  return (
    <div className="ops-metric">
      <div className="ops-metric-main">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
        <div className={`ops-metric-icon ops-metric-${tone}`}>
          <i className={`bi ${icon || 'bi-graph-up-arrow'}`} />
        </div>
      </div>
      {helper && <small>{helper}</small>}
    </div>
  );
}

export function Toolbar({ searchTerm, onSearch, filters, right }) {
  return (
    <div className="ops-toolbar">
      <div className="ops-search">
        <i className="bi bi-search" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search documents, clients, references..."
        />
      </div>
      {filters && <div className="ops-toolbar-filters">{filters}</div>}
      {right && <div className="ops-toolbar-right">{right}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="ops-empty">
      <div className="ops-empty-icon">
        <i className="bi bi-inboxes" />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function WorkflowSteps({ steps }) {
  return (
    <div className="ops-workflow">
      {steps.map((step, index) => (
        <div className="ops-workflow-step" key={step.label}>
          <span>{index + 1}</span>
          <div>
            <strong>{step.label}</strong>
            <small>{step.description}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentTable({ columns, rows, empty, loading }) {
  if (loading) {
    return (
      <div className="ops-table-wrap ops-loading">
        <div className="spinner-border spinner-border-sm" role="status" />
        <span>Loading workspace data...</span>
      </div>
    );
  }

  if (!rows?.length) {
    return empty || <EmptyState title="No records yet" description="Create the first document to start building your operational history." />;
  }

  return (
    <div className="ops-table-wrap">
      <table className="ops-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row.raw, row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
