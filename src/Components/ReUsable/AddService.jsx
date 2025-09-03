import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const AddService = ({ 
  show, 
  onHide, 
  newClient, 
  setNewClient, 
  handleAddClient, 
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
    handleAddClient(e);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
    
          <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="service"
                      value={localClient.service}
                        onChange={handleChange}
                    />
                  </Form.Group>
                  
                  {/* <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control 
                      as="textarea" rows={3}
                      name='description'
                      value={localClient.description}
                      onChange={handleChange}
                    />
                  </Form.Group> */}
                </Form>

        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : 'Save Service'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(AddService);