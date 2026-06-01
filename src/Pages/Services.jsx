import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { fetchData, insertData } from '../../utility/api';
import {
  DocumentTable,
  EmptyState,
  MetricCard,
  PageHeader,
  Toolbar,
} from '../Components/Operations/OperationsUI';

const emptyService = { service: '', description: '' };
const emptyCode = { code: '', subBrand: '' };

function Services() {
  const [services, setServices] = useState([]);
  const [serviceCodes, setServiceCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newService, setNewService] = useState(emptyService);
  const [newCode, setNewCode] = useState(emptyCode);

  const loadServices = async () => {
    try {
      setLoading(true);
      const [serviceData, codeData] = await Promise.all([
        fetchData('services'),
        fetchData('services/serviceCodes'),
      ]);
      setServices(serviceData || []);
      setServiceCodes(codeData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return services.filter((service) => [service.service, service.description]
      .join(' ')
      .toLowerCase()
      .includes(term));
  }, [searchTerm, services]);

  const saveService = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await insertData('services', newService);
      setNewService(emptyService);
      setShowServiceModal(false);
      await loadServices();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  const saveCode = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await insertData('services/serviceCodes', newCode);
      setNewCode(emptyCode);
      setShowCodeModal(false);
      await loadServices();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to create service code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ops-page">
      <PageHeader
        eyebrow="Service catalog"
        title="Services"
        description="Standardize service names and codes so document creation stays fast and consistent."
        actions={(
          <>
            <button className="btn btn-outline-secondary" type="button" onClick={() => setShowCodeModal(true)}>
              <i className="bi bi-tag me-2" />
              New Code
            </button>
            <button className="btn btn-primary" type="button" onClick={() => setShowServiceModal(true)}>
              <i className="bi bi-plus-circle me-2" />
              New Service
            </button>
          </>
        )}
      />

      <div className="ops-metric-grid">
        <MetricCard label="Services" value={services.length} helper="Reusable line items" icon="bi-briefcase" tone="primary" />
        <MetricCard label="Service codes" value={serviceCodes.length} helper="Codes available for documents" icon="bi-tags" tone="dark" />
        <MetricCard label="Automation gain" value="Less typing" helper="Select from catalog instead of recreating lines" icon="bi-lightning-charge" tone="success" />
      </div>

      <section className="ops-panel">
        <Toolbar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          right={(
            <span className="ops-toolbar-note">
              Codes are assigned while adding invoice, proforma, or LPO line items.
            </span>
          )}
        />

        <DocumentTable
          loading={loading}
          rows={filteredServices.map((service) => ({ key: service._id, raw: service }))}
          columns={[
            {
              key: 'service',
              label: 'Service',
              render: (service) => <strong>{service.service}</strong>,
            },
            {
              key: 'description',
              label: 'Description',
              render: (service) => service.description || 'No description',
            },
          ]}
          empty={<EmptyState title="No services found" description="Add reusable services to accelerate document creation." />}
        />
      </section>

      <section className="ops-panel">
        <div className="ops-panel-header">
          <div>
            <h2>Service Codes</h2>
            <p>Use codes for sub-brands, departments, or revenue categories.</p>
          </div>
        </div>
        <DocumentTable
          rows={serviceCodes.map((code) => ({ key: code._id, raw: code }))}
          columns={[
            {
              key: 'code',
              label: 'Code',
              render: (code) => <strong>{code.code}</strong>,
            },
            {
              key: 'subBrand',
              label: 'Sub-brand',
              render: (code) => code.subBrand || 'General',
            },
          ]}
          empty={<EmptyState title="No service codes yet" description="Add a code before building categorized line items." />}
        />
      </section>

      <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} centered>
        <Form onSubmit={saveService}>
          <Modal.Header closeButton>
            <Modal.Title>Add Service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Service name</Form.Label>
              <Form.Control
                required
                value={newService.service}
                onChange={(event) => setNewService({ ...newService, service: event.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newService.description}
                onChange={(event) => setNewService({ ...newService, description: event.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowServiceModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save Service'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showCodeModal} onHide={() => setShowCodeModal(false)} centered>
        <Form onSubmit={saveCode}>
          <Modal.Header closeButton>
            <Modal.Title>Add Service Code</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                required
                value={newCode.code}
                onChange={(event) => setNewCode({ ...newCode, code: event.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Sub-brand</Form.Label>
              <Form.Control
                value={newCode.subBrand}
                onChange={(event) => setNewCode({ ...newCode, subBrand: event.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowCodeModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>{saving ? <Spinner size="sm" /> : 'Save Code'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Services;
