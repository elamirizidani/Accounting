import React, { useMemo, useState } from 'react';
import AddLPO from '../Components/LPO/LPOForm';
import ViewLPO from '../Components/LPO/ViewLPO';
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

function Lpo() {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLpo, setSelectedLpo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { lpos, loadLpos } = useAuthStore();
  const purchaseOrders = useMemo(() => (
    Array.isArray(lpos) ? lpos : []
  ), [lpos]);

  const filteredLpos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return purchaseOrders.filter((lpo) => {
      const status = normalizeStatus(lpo.status);
      const client = lpo?.billedTo?.name || '';
      const number = lpo?.lpoId || '';
      const amount = String(lpo?.totalAmount || '');

      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch = !term || [status, client, number, amount]
        .join(' ')
        .toLowerCase()
        .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  const approvedCount = purchaseOrders.filter((item) => item.status === 'approved').length;
  const pendingCount = purchaseOrders.filter((item) => item.status === 'pending').length;
  const totalValue = purchaseOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  const handleEdit = (lpo = {}) => {
    setSelectedLpo(lpo);
    setShowModal(true);
  };

  const handleView = (lpo) => {
    setSelectedLpo(lpo);
    setShowViewModal(true);
  };

  const deleteLpo = async (id) => {
    if (!window.confirm('Delete this LPO? This cannot be undone.')) return;

    try {
      await deleteData('lpo', id);
      await loadLpos();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete LPO');
    }
  };

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Procurement"
        title="Local Purchase Orders"
        description="Manage client purchase orders and keep them aligned with downstream invoices."
        actions={(
          <>
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-download me-2" />
              Export
            </button>
            <button onClick={() => handleEdit({})} className="btn btn-primary" type="button">
              <i className="bi bi-plus-circle me-2" />
              New LPO
            </button>
          </>
        )}
      />

      <div className="ops-metric-grid">
        <MetricCard label="Total LPOs" value={purchaseOrders.length} helper="All purchase orders" icon="bi-file-earmark-check" tone="primary" />
        <MetricCard label="Approved" value={approvedCount} helper="Ready for fulfillment" icon="bi-check2-circle" tone="success" />
        <MetricCard label="Pending" value={pendingCount} helper="Needs review or confirmation" icon="bi-hourglass-split" tone="dark" />
        <MetricCard label="LPO value" value={formatMoney(totalValue)} helper="Gross order amount" icon="bi-cash-stack" tone="success" />
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
          rows={filteredLpos.map((lpo) => ({ key: lpo._id, raw: lpo }))}
          columns={[
            {
              key: 'number',
              label: 'LPO No',
              render: (lpo) => <strong>{lpo.lpoId}</strong>,
            },
            {
              key: 'client',
              label: 'Client',
              render: (lpo) => lpo?.billedTo?.name || 'Unknown client',
            },
            {
              key: 'date',
              label: 'Created',
              render: (lpo) => formatDate(lpo.lpoDate || lpo.createdAt),
            },
            {
              key: 'amount',
              label: 'Amount',
              className: 'text-end',
              render: (lpo) => formatMoney(lpo.totalAmount, lpo.currency),
            },
            {
              key: 'status',
              label: 'Status',
              render: (lpo) => <StatusBadge status={lpo.status} />,
            },
            {
              key: 'actions',
              label: '',
              className: 'text-end ops-action-cell',
              render: (lpo) => (
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleView(lpo)}>View</button>
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleEdit(lpo)}>Edit</button>
                  <button className="btn btn-outline-danger" type="button" onClick={() => deleteLpo(lpo._id)}>Delete</button>
                </div>
              ),
            },
          ]}
          empty={<EmptyState title="No LPOs found" description="Create an LPO when a client has issued a purchase order for approved work." />}
        />
      </section>

      <section className="ops-panel ops-workflow-panel">
        <WorkflowSteps
          steps={[
            { label: 'Capture order', description: 'Record the client reference, services, amounts, and expected dates.' },
            { label: 'Approve', description: 'Confirm the LPO is commercially valid before delivery starts.' },
            { label: 'Invoice', description: 'Use the approved order as reliable context for billing.' },
          ]}
        />
      </section>

      <AddLPO
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setSelectedLpo({});
        }}
        quotation={selectedLpo}
      />
      <ViewLPO
        show={showViewModal}
        handleClose={() => setShowViewModal(false)}
        quotation={selectedLpo}
      />
    </div>
  );
}

export default Lpo;
