import React, { useEffect, useMemo, useState } from 'react';
import AddInvoice from '../Components/Invoice/AddInvoice';
import ViewInvoice from '../Components/Invoice/ViewInvoice';
import { useInvoiceStore } from '../store/invoiceStore';
import { fetchData } from '../../utility/api';
import {
  DocumentTable,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusBadge,
  Toolbar,
  formatDate,
  formatMoney,
  normalizeStatus,
} from '../Components/Operations/OperationsUI';

const statusTabs = ['all', 'draft', 'unpaid', 'paid', 'overdue', 'cancelled'];
const trackTabs = ['all', 'structured', 'unstructured'];

function Invoices() {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeTrack, setActiveTrack] = useState('all');
  const [counters, setCounters] = useState([]);

  const {
    loadingInvoice,
    invoices = [],
    totalPaidAmount,
    totalAmountExceptDraft,
    allInvoiceData,
  } = useInvoiceStore();

  useEffect(() => {
    fetchData('invoice/counters')
      .then(setCounters)
      .catch(() => setCounters([]));
  }, []);

  const invoiceCounters = counters.filter((counter) => counter.documentType === 'invoice');
  const structuredNext = invoiceCounters.find((counter) => counter.track === 'structured')?.nextNumber || 'INV-0060';
  const unstructuredNext = invoiceCounters.find((counter) => counter.track === 'unstructured')?.nextNumber || 'USTR-INV-0001';

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return invoices.filter((invoice) => {
      const status = normalizeStatus(invoice.status);
      const track = invoice.invoiceTrack || 'structured';
      const client = invoice?.quotation?.billedTo?.name || '';
      const amount = String(invoice.totalAmount || '');
      const number = invoice.invoiceNumber || '';

      const matchesStatus = activeStatus === 'all' || status === activeStatus;
      const matchesTrack = activeTrack === 'all' || track === activeTrack;
      const matchesSearch = !term || [client, amount, number, track, status]
        .join(' ')
        .toLowerCase()
        .includes(term);

      return matchesStatus && matchesTrack && matchesSearch;
    });
  }, [activeStatus, activeTrack, invoices, searchTerm]);

  const rows = filteredInvoices.map((invoice) => ({
    key: invoice._id,
    raw: invoice,
  }));

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleCloseCreate = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    fetchData('invoice/counters')
      .then(setCounters)
      .catch(() => setCounters([]));
  };

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Receivables"
        title="Invoices"
        description="Issue structured and unstructured invoices on separate, collision-safe number tracks."
        actions={(
          <>
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-download me-2" />
              Export
            </button>
            <button onClick={handleNewInvoice} className="btn btn-primary" type="button">
              <i className="bi bi-plus-circle me-2" />
              New Invoice
            </button>
          </>
        )}
      />

      <div className="ops-metric-grid">
        <MetricCard
          label="Structured next number"
          value={structuredNext}
          helper="Starts at 60 and advances independently"
          icon="bi-diagram-3"
          tone="primary"
        />
        <MetricCard
          label="Unstructured next number"
          value={unstructuredNext}
          helper="Separate sequence for ad-hoc invoices"
          icon="bi-shuffle"
          tone="dark"
        />
        <MetricCard
          label="Invoice value"
          value={formatMoney(totalAmountExceptDraft)}
          helper="All non-draft invoices"
          icon="bi-cash-stack"
          tone="success"
        />
        <MetricCard
          label="Paid"
          value={formatMoney(totalPaidAmount)}
          helper={`${allInvoiceData?.statusCounts?.paid || 0} paid invoices`}
          icon="bi-check2-circle"
          tone="success"
        />
      </div>

      <section className="ops-panel">
        <Toolbar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          filters={(
            <>
              <div className="ops-segment">
                {statusTabs.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={activeStatus === status ? 'active' : ''}
                    onClick={() => setActiveStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="ops-segment">
                {trackTabs.map((track) => (
                  <button
                    type="button"
                    key={track}
                    className={activeTrack === track ? 'active' : ''}
                    onClick={() => setActiveTrack(track)}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </>
          )}
        />

        <DocumentTable
          loading={loadingInvoice}
          rows={rows}
          columns={[
            {
              key: 'number',
              label: 'Invoice No',
              render: (invoice) => <strong>{invoice.invoiceNumber}</strong>,
            },
            {
              key: 'track',
              label: 'Track',
              render: (invoice) => <StatusBadge status={invoice.invoiceTrack || 'structured'} />,
            },
            {
              key: 'client',
              label: 'Client',
              render: (invoice) => invoice?.quotation?.billedTo?.name || 'Unknown client',
            },
            {
              key: 'created',
              label: 'Issued',
              render: (invoice) => formatDate(invoice.invoiceDate),
            },
            {
              key: 'due',
              label: 'Due',
              render: (invoice) => formatDate(invoice.dueDate),
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
            {
              key: 'actions',
              label: '',
              className: 'text-end ops-action-cell',
              render: (invoice) => (
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowViewModal(true);
                    }}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleEditInvoice(invoice)}
                  >
                    Edit
                  </button>
                </div>
              ),
            },
          ]}
          empty={(
            <EmptyState
              title="No invoices match this view"
              description="Try clearing filters or create the first issued invoice from an approved proforma."
              action={<button className="btn btn-primary" type="button" onClick={handleNewInvoice}>Create invoice</button>}
            />
          )}
        />
      </section>

      <AddInvoice
        show={showModal}
        handleClose={handleCloseCreate}
        invoice={selectedInvoice || { invoiceTrack: activeTrack === 'unstructured' ? 'unstructured' : 'structured' }}
      />
      <ViewInvoice
        show={showViewModal}
        handleClose={() => setShowViewModal(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}

export default Invoices;
