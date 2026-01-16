import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiceManager.css';

const ServiceManager = ({ onServiceSelect, selectedService }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newService, setNewService] = useState({
        service: '',
        description: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/lpo/services/all');
            setServices(response.data.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/lpo/services/create', newService);
            setServices([...services, response.data.data]);
            setNewService({ service: '', description: '' });
            setShowForm(false);
            alert('Service created successfully!');
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Error creating service');
        }
    };

    if (loading) {
        return <div>Loading services...</div>;
    }

    return (
        <div className="service-manager">
            <div className="service-header">
                <h3>Services</h3>
                <button 
                    type="button" 
                    className="btn-add-service"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add New Service'}
                </button>
            </div>

            {showForm && (
                <div className="service-form">
                    <h4>Add New Service</h4>
                    <form onSubmit={handleServiceCreate}>
                        <div className="form-group">
                            <label>Service Name</label>
                            <input
                                type="text"
                                value={newService.service}
                                onChange={(e) => setNewService({...newService, service: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={newService.description}
                                onChange={(e) => setNewService({...newService, description: e.target.value})}
                                rows="3"
                            />
                        </div>
                        <button type="submit" className="btn-submit-service">
                            Create Service
                        </button>
                    </form>
                </div>
            )}

            <div className="service-list">
                {services.map((service) => (
                    <div 
                        key={service._id}
                        className={`service-item ${selectedService === service._id ? 'selected' : ''}`}
                        onClick={() => onServiceSelect(service)}
                    >
                        <div className="service-name">{service.service}</div>
                        {service.description && (
                            <div className="service-description">{service.description}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceManager;