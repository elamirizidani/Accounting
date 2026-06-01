import React from 'react';
import { Link } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import { useAuthStore } from '../store/authStore';
import {
  DocumentTable,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusBadge,
  WorkflowSteps,
  formatDate,
  formatMoney,
} from '../Components/Operations/OperationsUI';

function Home() {
  const {
    invoices = [],
    totalInvoice,
    totalPaidAmount,
    totalAmountExceptDraft,
    loadingInvoice,
  } = useInvoiceStore();
  const { quotation, lpos } = useAuthStore();
  const proformas = Array.isArray(quotation) ? quotation : [];
  const purchaseOrders = Array.isArray(lpos) ? lpos : [];

  const overdueCount = invoices.filter((invoice) => invoice.status === 'overdue').length;
  const draftCount = invoices.filter((invoice) => invoice.status === 'draft').length;
  const recentInvoices = invoices.slice(0, 5).map((invoice) => ({
    key: invoice._id,
    raw: invoice,
  }));

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Business command center"
        title="Dashboard"
        description="Track the full commercial workflow from client request to paid invoice."
        actions={(
          <>
            <Link to="/Proforma" className="btn btn-outline-secondary">
              <i className="bi bi-file-earmark-plus me-2" />
              New Proforma
            </Link>
            <Link to="/Invoices" className="btn btn-primary">
              <i className="bi bi-receipt me-2" />
              Issue Invoice
            </Link>
          </>
        )}
      />

      <div className="ops-metric-grid">
        <MetricCard
          label="Issued invoices"
          value={totalInvoice || invoices.length || 0}
          helper={`${draftCount} draft documents still need review`}
          icon="bi-receipt"
          tone="primary"
        />
        <MetricCard
          label="Invoice value"
          value={formatMoney(totalAmountExceptDraft)}
          helper="Excludes draft invoices"
          icon="bi-cash-stack"
          tone="success"
        />
        <MetricCard
          label="Paid amount"
          value={formatMoney(totalPaidAmount)}
          helper="Recognized paid revenue"
          icon="bi-check2-circle"
          tone="success"
        />
        <MetricCard
          label="Attention needed"
          value={overdueCount}
          helper="Overdue invoices requiring follow-up"
          icon="bi-exclamation-triangle"
          tone="danger"
        />
      </div>

      <div className="ops-two-column">
        <section className="ops-panel">
          <div className="ops-panel-header">
            <div>
              <h2>Recent Invoices</h2>
              <p>Most recent issued documents and payment status.</p>
            </div>
            <Link to="/Invoices">View all</Link>
          </div>

          <DocumentTable
            loading={loadingInvoice}
            rows={recentInvoices}
            columns={[
              {
                key: 'invoiceNumber',
                label: 'Number',
                render: (invoice) => <strong>{invoice.invoiceNumber}</strong>,
              },
              {
                key: 'client',
                label: 'Client',
                render: (invoice) => invoice?.quotation?.billedTo?.name || 'Unknown client',
              },
              {
                key: 'amount',
                label: 'Amount',
                className: 'text-end',
                render: (invoice) => formatMoney(invoice.totalAmount, invoice?.quotation?.currency),
              },
              {
                key: 'status',
                label: 'Status',
                render: (invoice) => <StatusBadge status={invoice.status} />,
              },
            ]}
            empty={<EmptyState title="No invoices yet" description="Issue the first invoice when a proforma or LPO is approved." />}
          />
        </section>

        <section className="ops-panel">
          <div className="ops-panel-header">
            <div>
              <h2>Automation Workflow</h2>
              <p>Recommended operating model for every service module.</p>
            </div>
          </div>

          <WorkflowSteps
            steps={[
              { label: 'Capture', description: 'Create client, service, and commercial terms once.' },
              { label: 'Review', description: 'Validate totals, tax, client details, and approvals.' },
              { label: 'Issue', description: 'Reserve the official number only at final issue time.' },
              { label: 'Track', description: 'Follow status, payment, and audit history from one place.' },
            ]}
          />
        </section>
      </div>

      <div className="ops-metric-grid ops-secondary-grid">
        <MetricCard
          label="Proformas"
          value={proformas.length}
          helper="Commercial offers prepared"
          icon="bi-file-earmark-text"
          tone="dark"
        />
        <MetricCard
          label="LPOs"
          value={purchaseOrders.length}
          helper="Purchase orders in the workspace"
          icon="bi-file-earmark-check"
          tone="primary"
        />
        <MetricCard
          label="Latest invoice"
          value={invoices[0]?.invoiceNumber || 'None'}
          helper={invoices[0] ? `Issued ${formatDate(invoices[0].invoiceDate)}` : 'Waiting for first issue'}
          icon="bi-clock-history"
          tone="dark"
        />
      </div>
    </div>
  );
}

export default Home;
