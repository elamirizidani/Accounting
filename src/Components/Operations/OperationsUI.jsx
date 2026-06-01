/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useMemo, useState } from 'react';
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

export function DocumentTable({
  columns,
  rows = [],
  empty,
  loading,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activePageSize, setActivePageSize] = useState(pageSize);
  const totalRows = rows.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalRows / activePageSize)) : 1;
  const rowSignature = rows.map((row) => row.key).join('|');

  useEffect(() => {
    setCurrentPage(1);
  }, [rowSignature, activePageSize]);

  useEffect(() => {
    setActivePageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleRows = useMemo(() => {
    if (!pagination) return rows;

    const start = (currentPage - 1) * activePageSize;
    return rows.slice(start, start + activePageSize);
  }, [activePageSize, currentPage, pagination, rows]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    const start = Math.max(1, Math.min(currentPage - half, totalPages - maxButtons + 1));
    const end = Math.min(totalPages, start + maxButtons - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="ops-table-wrap ops-loading">
        <div className="spinner-border spinner-border-sm" role="status" />
        <span>Loading workspace data...</span>
      </div>
    );
  }

  if (!rows.length) {
    return empty || <EmptyState title="No records yet" description="Create the first document to start building your operational history." />;
  }

  const rangeStart = pagination ? ((currentPage - 1) * activePageSize) + 1 : 1;
  const rangeEnd = pagination ? Math.min(currentPage * activePageSize, totalRows) : totalRows;
  const showPagination = pagination && totalRows > activePageSize;

  return (
    <>
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.key}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className} data-label={column.label || 'Actions'}>
                    {column.render ? column.render(row.raw, row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="ops-pagination" aria-label="Table pagination">
          <div className="ops-pagination-summary">
            Showing <strong>{rangeStart}-{rangeEnd}</strong> of <strong>{totalRows}</strong>
          </div>

          <div className="ops-pagination-controls">
            <label>
              Rows
              <select
                value={activePageSize}
                onChange={(event) => setActivePageSize(Number(event.target.value))}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <div className="ops-page-buttons">
              <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                First
              </button>
              <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                Prev
              </button>
              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  className={page === currentPage ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
                Next
              </button>
              <button type="button" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
