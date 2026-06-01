import React, { useMemo, useState } from 'react';
import QuotationModal from '../Components/Proforma/QuotationModal';
import ViewQuatation from '../Components/Proforma/ViewQuatation';
import ToInvoice from '../Components/Proforma/ToInvoice';
import { deleteData } from '../../utility/api';
import { useAuthStore } from '../store/authStore';
import {
  DocumentTable,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusBadge,
  Toolbar,
  WorkflowSteps,
  formatDate,
  formatMoney,
  normalizeStatus,
} from '../Components/Operations/OperationsUI';

function Proforma() {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showChangeToInvoice, setShowChangeToInvoice] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { quotation, loadQuotation } = useAuthStore();
  const proformas = useMemo(() => (
    Array.isArray(quotation) ? quotation : []
  ), [quotation]);

  const filteredQuotations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return proformas.filter((proforma) => {
      const status = normalizeStatus(proforma.status);
      const client = proforma?.billedTo?.name || '';
      const number = proforma?.quotationId || '';
      const amount = String(proforma?.totalAmount || '');

      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch = !term || [status, client, number, amount]
        .join(' ')
        .toLowerCase()
        .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [proformas, searchTerm, statusFilter]);

  const approvedCount = proformas.filter((item) => item.status === 'approved').length;
  const convertedCount = proformas.filter((item) => item.convertedToInvoice).length;
  const totalPipeline = proformas.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  const handleEdit = (proforma = {}) => {
    setSelectedQuotation(proforma);
    setShowModal(true);
  };

  const handleView = (proforma) => {
    setSelectedQuotation(proforma);
    setShowViewModal(true);
  };

  const handleConvert = (proforma) => {
    setSelectedQuotation(proforma);
    setShowChangeToInvoice(true);
  };

  const deleteQuotation = async (id) => {
    if (!window.confirm('Delete this proforma? This cannot be undone.')) return;

    try {
      await deleteData('quotation', id);
      await loadQuotation();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete proforma');
    }
  };

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Sales documents"
        title="Proforma Invoices"
        description="Prepare commercial offers, approve them, then convert cleanly into official invoices."
        actions={(
          <>
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-download me-2" />
              Export
            </button>
            <button onClick={() => handleEdit({})} className="btn btn-primary" type="button">
              <i className="bi bi-plus-circle me-2" />
              New Proforma
            </button>
          </>
        )}
      />

      <div className="ops-metric-grid">
        <MetricCard label="Total proformas" value={proformas.length} helper="All prepared offers" icon="bi-file-earmark-text" tone="primary" />
        <MetricCard label="Approved" value={approvedCount} helper="Ready to become invoices" icon="bi-check2-circle" tone="success" />
        <MetricCard label="Converted" value={convertedCount} helper="Already linked to invoices" icon="bi-arrow-left-right" tone="dark" />
        <MetricCard label="Pipeline value" value={formatMoney(totalPipeline)} helper="Gross quoted amount" icon="bi-cash-stack" tone="success" />
      </div>

      <section className="ops-panel">
        <Toolbar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          filters={(
            <div className="ops-segment">
              {['all', 'draft', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  type="button"
                  key={status}
                  className={statusFilter === status ? 'active' : ''}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        />

        <DocumentTable
          rows={filteredQuotations.map((proforma) => ({ key: proforma._id, raw: proforma }))}
          columns={[
            {
              key: 'number',
              label: 'Proforma No',
              render: (proforma) => <strong>{proforma.quotationId}</strong>,
            },
            {
              key: 'client',
              label: 'Client',
              render: (proforma) => proforma?.billedTo?.name || 'Unknown client',
            },
            {
              key: 'date',
              label: 'Created',
              render: (proforma) => formatDate(proforma.quotationDate || proforma.createdAt),
            },
            {
              key: 'amount',
              label: 'Amount',
              className: 'text-end',
              render: (proforma) => formatMoney(proforma.totalAmount, proforma.currency),
            },
            {
              key: 'status',
              label: 'Status',
              render: (proforma) => <StatusBadge status={proforma.status} />,
            },
            {
              key: 'actions',
              label: '',
              className: 'text-end ops-action-cell',
              render: (proforma) => (
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleView(proforma)}>View</button>
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleEdit(proforma)}>Edit</button>
                  <button className="btn btn-outline-primary" type="button" onClick={() => handleConvert(proforma)}>Invoice</button>
                  <button className="btn btn-outline-danger" type="button" onClick={() => deleteQuotation(proforma._id)}>Delete</button>
                </div>
              ),
            },
          ]}
          empty={<EmptyState title="No proformas found" description="Create a proforma to start an auditable quote-to-cash workflow." />}
        />
      </section>

      <section className="ops-panel ops-workflow-panel">
        <WorkflowSteps
          steps={[
            { label: 'Draft offer', description: 'Select the client, services, taxes, and commercial terms.' },
            { label: 'Approve', description: 'Confirm totals before the offer can be converted.' },
            { label: 'Convert', description: 'Generate an invoice without re-entering client or line item data.' },
          ]}
        />
      </section>

      <QuotationModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setSelectedQuotation({});
        }}
        quotation={selectedQuotation}
      />
      <ToInvoice
        show={showChangeToInvoice}
        handleClose={() => {
          setShowChangeToInvoice(false);
          loadQuotation();
        }}
        quotation={selectedQuotation}
      />
      <ViewQuatation
        show={showViewModal}
        handleClose={() => setShowViewModal(false)}
        quotation={selectedQuotation}
      />
    </div>
  );
}

export default Proforma;
