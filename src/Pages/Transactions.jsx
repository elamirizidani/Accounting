import React, { useEffect, useState } from 'react';
import { fetchData } from '../../utility/api';
import {
  DocumentTable,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusBadge,
  WorkflowSteps,
} from '../Components/Operations/OperationsUI';

function Transactions() {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('invoice/counters')
      .then(setCounters)
      .catch(() => setCounters([]))
      .finally(() => setLoading(false));
  }, []);

  const structured = counters.find((counter) => counter.documentType === 'invoice' && counter.track === 'structured');
  const unstructured = counters.find((counter) => counter.documentType === 'invoice' && counter.track === 'unstructured');

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Governance"
        title="Operations & Numbering"
        description="Monitor document sequences and the operating workflow that protects auditability."
      />

      <div className="ops-metric-grid">
        <MetricCard
          label="Structured next"
          value={structured?.nextNumber || 'INV-0060'}
          helper="Official structured invoice sequence"
          icon="bi-diagram-3"
          tone="primary"
        />
        <MetricCard
          label="Unstructured next"
          value={unstructured?.nextNumber || 'USTR-INV-0001'}
          helper="Independent ad-hoc invoice sequence"
          icon="bi-shuffle"
          tone="dark"
        />
        <MetricCard
          label="Collision control"
          value="Atomic"
          helper="Numbers are reserved by backend counters"
          icon="bi-shield-check"
          tone="success"
        />
      </div>

      <section className="ops-panel">
        <div className="ops-panel-header">
          <div>
            <h2>Document Counters</h2>
            <p>Each document type and track has its own current value and preview of the next number.</p>
          </div>
        </div>

        <DocumentTable
          loading={loading}
          rows={counters.map((counter) => ({ key: counter._id, raw: counter }))}
          columns={[
            {
              key: 'document',
              label: 'Document',
              render: (counter) => <strong>{counter.label || counter.documentType}</strong>,
            },
            {
              key: 'track',
              label: 'Track',
              render: (counter) => <StatusBadge status={counter.track} />,
            },
            {
              key: 'period',
              label: 'Period',
              render: (counter) => counter.periodKey,
            },
            {
              key: 'current',
              label: 'Current',
              className: 'text-end',
              render: (counter) => counter.seq,
            },
            {
              key: 'start',
              label: 'Start',
              className: 'text-end',
              render: (counter) => counter.startValue,
            },
            {
              key: 'next',
              label: 'Next Number',
              className: 'text-end',
              render: (counter) => <strong>{counter.nextNumber}</strong>,
            },
          ]}
          empty={<EmptyState title="No counters found" description="Counters are created automatically when the backend is available." />}
        />
      </section>

      <section className="ops-panel ops-workflow-panel">
        <WorkflowSteps
          steps={[
            { label: 'Draft with UUID', description: 'Users can edit safely before an official number is reserved.' },
            { label: 'Approve business data', description: 'Client, services, taxes, and totals are validated before issue.' },
            { label: 'Reserve atomically', description: 'The backend increments only the selected document track.' },
            { label: 'Keep audit history', description: 'Issued numbers are immutable; corrections happen through status and audit events.' },
          ]}
        />
      </section>
    </div>
  );
}

export default Transactions;
