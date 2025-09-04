import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const AddServiceCode = ({ 
  show, 
  onHide, 
  newClient, 
  setNewClient, 
  handleAddCode, 
  loading 
}) => {
  // Local state for controlled inputs
  const [localClient, setLocalClient] = React.useState(newClient);
  

  // Update local state when props change
  React.useEffect(() => {
    setLocalClient(newClient);
  }, [newClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update parent state only when submitting
    // console.log(localClient)
    setNewClient(localClient);
    handleAddCode(e);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Service Code</Modal.Title>
      </Modal.Header>
      <Modal.Body>


        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Code Name</Form.Label>
            <Form.Control 
              type="text" 
              name="code"
              value={localClient.code}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Save Code'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(AddServiceCode);