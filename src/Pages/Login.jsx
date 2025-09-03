import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import siteLogo from '../assets/imgs/agencyLogo.png'
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')
  const { login,isLoggedIn } = useAuthStore();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const userRole = await login({ email: email, password: password });
        if(userRole.status)
        {
            //  if (userRole?.role?.toLowerCase() === 'admin') {
            //     navigate('/admin');
            // } else {
                navigate('/');
            // }
        }
        else{
            setLoading(false);
            setError('Login failed. Please try again.');
        }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };


  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return (
    <>

      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center login-main-bg">
        <div className="container">
          
            <Row className="justify-content-center">
              <Col md={4} className='d-flex align-items-center justify-content-center'>
                  <img src={siteLogo} className='img-fluid' alt=""/>
              </Col>
              <Col md={6}>
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark mb-3">Sign In</h2>
                  <p className="text-muted mb-0">Please enter below details to access the dashboard</p>
                </div>

                {/* Form */}
                <div>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        id="email"
                        placeholder="Enter Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        id="password"
                        placeholder="******************"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ backgroundColor: 'white' }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label text-muted" htmlFor="rememberMe">
                        Remember Me
                      </label>
                    </div>
                    <a href="#" className="text-decoration-none text-muted">
                      Forgot Password
                    </a>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="button"
                    className="btn w-100 py-2 fw-semibold"
                    data-mdb-button-init data-mdb-ripple-init
                    disabled={loading}
                    style={{
                      backgroundColor: '#000',
                      borderColor: '#000',
                      color: 'white',
                      fontSize: '1.1rem'
                    }}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </div>
            </div>
            </Col>
            </Row>
        </div>
      </div>

      <style jsx>{`
        .form-control:focus {
          border-color: #e67e22;
          box-shadow: 0 0 0 0.2rem rgba(230, 126, 34, 0.25);
        }
        
        .btn:hover {
          background-color: #d35400 !important;
          border-color: #d35400 !important;
        }
        
        .input-group-text {
          border-color: #ced4da;
        }
        
        .form-control {
          border-color: #ced4da;
        }
        
        .card {
          border-radius: 12px;
        }
        
        .btn {
          border-radius: 8px;
        }
        
        .form-control {
          border-radius: 8px;
        }
        
        .input-group-text {
          border-radius: 8px 0 0 8px;
        }
        
        .input-group .form-control:not(:last-child) {
          border-radius: 0;
        }
        
        .input-group .btn {
          border-radius: 0 8px 8px 0;
        }
      `}</style>
    </>
  );
}