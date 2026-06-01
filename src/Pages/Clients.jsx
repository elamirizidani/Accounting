import React, { useMemo, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { insertData, updateData } from '../../utility/api';
import { useClientsStore } from '../store/clientsStore';
import {
  DocumentTable,
  EmptyState,
  MetricCard,
  PageHeader,
  Toolbar,
  formatMoney,
} from '../Components/Operations/OperationsUI';

const emptyClient = {
  name: '',
  address: '',
  phone: '',
  email: '',
};

function Clients() {
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState(emptyClient);
  const [selectedClient, setSelectedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    clients = [],
    loadingClients,
    getInvoices: reloadClients,
  } = useClientsStore();

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.filter((client) => [client.name, client.email, client.phone, client.customerCode]
      .join(' ')
      .toLowerCase()
      .includes(term));
  }, [clients, searchTerm]);

  const totalRevenue = clients.reduce((sum, client) => sum + Number(client?.summary?.totalIncome || 0), 0);
  const totalInvoices = clients.reduce((sum, client) => sum + Number(client?.summary?.totalInvoices || 0), 0);
  const outstanding = clients.reduce((sum, client) => sum + Number(client?.summary?.pendingIncome || 0), 0);

  const openCreateModal = () => {
    setSelectedClient(null);
    setNewClient(emptyClient);
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setNewClient({
      name: client?.name || '',
      address: client?.address || '',
      phone: client?.phone || '',
      email: client?.email || '',
    });
    setShowModal(true);
  };

  const closeClientModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setNewClient(emptyClient);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      if (selectedClient?._id) {
        await updateData(`customers/${selectedClient._id}`, newClient);
      } else {
        await insertData('customers', newClient);
      }
      await reloadClients();
      closeClientModal();
    } catch (error) {
      alert(error?.response?.data?.message || `Failed to ${selectedClient ? 'update' : 'create'} client`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Commercial records"
        title="Clients"
        description="Keep client data, billing history, and outstanding amounts in one trusted workspace."
        actions={(
          <button className="btn btn-primary" type="button" onClick={openCreateModal}>
            <i className="bi bi-person-plus me-2" />
            New Client
          </button>
        )}
      />

      <div className="ops-metric-grid">
        <MetricCard label="Clients" value={clients.length} helper="Active records" icon="bi-people" tone="primary" />
        <MetricCard label="Total revenue" value={formatMoney(totalRevenue)} helper="Across all client invoices" icon="bi-cash-stack" tone="success" />
        <MetricCard label="Invoices" value={totalInvoices} helper="Linked to clients" icon="bi-receipt" tone="dark" />
        <MetricCard label="Outstanding" value={formatMoney(outstanding)} helper="Pending or unpaid value" icon="bi-exclamation-circle" tone="danger" />
      </div>

      <section className="ops-panel">
        <Toolbar searchTerm={searchTerm} onSearch={setSearchTerm} />

        <DocumentTable
          loading={loadingClients}
          rows={filteredClients.map((client) => ({ key: client._id, raw: client }))}
          columns={[
            {
              key: 'code',
              label: 'Client ID',
              render: (client) => <strong>{client.customerCode}</strong>,
            },
            {
              key: 'name',
              label: 'Client',
              render: (client) => (
                <div>
                  <strong>{client.name}</strong>
                  <small className="d-block text-muted">{client.address}</small>
                </div>
              ),
            },
            {
              key: 'phone',
              label: 'Phone',
              render: (client) => client.phone,
            },
            {
              key: 'email',
              label: 'Email',
              render: (client) => client.email,
            },
            {
              key: 'revenue',
              label: 'Revenue',
              className: 'text-end',
              render: (client) => formatMoney(client?.summary?.totalIncome),
            },
            {
              key: 'outstanding',
              label: 'Outstanding',
              className: 'text-end',
              render: (client) => formatMoney(client?.summary?.pendingIncome),
            },
            {
              key: 'documents',
              label: 'Invoices',
              className: 'text-end',
              render: (client) => client?.summary?.totalInvoices || 0,
            },
            {
              key: 'actions',
              label: '',
              className: 'text-end ops-action-cell',
              render: (client) => (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={() => openEditModal(client)}
                >
                  Edit
                </button>
              ),
            },
          ]}
          empty={<EmptyState title="No clients found" description="Add a client before creating proformas, LPOs, or invoices." />}
        />
      </section>

      <Modal show={showModal} onHide={closeClientModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedClient ? 'Edit Client' : 'Add Client'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedClient?.customerCode && (
              <Form.Group className="mb-3">
                <Form.Label>Client ID</Form.Label>
                <Form.Control value={selectedClient.customerCode} disabled readOnly />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={newClient.name}
                onChange={(event) => setNewClient({ ...newClient, name: event.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                required
                value={newClient.address}
                onChange={(event) => setNewClient({ ...newClient, address: event.target.value })}
              />
            </Form.Group>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  required
                  value={newClient.phone}
                  onChange={(event) => setNewClient({ ...newClient, phone: event.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  value={newClient.email}
                  onChange={(event) => setNewClient({ ...newClient, email: event.target.value })}
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeClientModal}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner size="sm" /> : selectedClient ? 'Update Client' : 'Save Client'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Clients;
