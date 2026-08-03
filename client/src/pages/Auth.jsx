import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, ShieldAlert } from 'lucide-react';

const Auth = () => {
  const { login, register, showNotification } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');

  // OTP Verification flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirect);
      }
    } else {
      // Prior to registration, request OTP
      setTempUserData({ name, email, password, phone, address, role });
      setOtpSent(true);
      showNotification('Simulated OTP code sent to your phone! Use code: 1234', 'info');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempUserData.email, otp: otpCode })
      });
      const data = await response.json();
      if (response.ok) {
        // Complete the registration on backend
        const res = await register(
          tempUserData.name,
          tempUserData.email,
          tempUserData.password,
          tempUserData.phone,
          tempUserData.address,
          tempUserData.role
        );
        if (res.success) {
          navigate(redirect);
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Error verifying OTP', 'error');
    }
  };

  if (otpSent) {
    return (
      <div className="glass-card" style={{ padding: 36, maxWidth: 450, margin: '60px auto', textAlign: 'center' }}>
        <KeyRound size={48} color="var(--accent-color)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 10 }}>OTP Verification</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          Enter the 4-digit code sent to your mobile number. <br /><strong>(Use code: 1234)</strong>
        </p>
        
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <input 
              type="text" 
              className="form-control" 
              style={{ textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 700 }}
              placeholder="••••"
              maxLength={4}
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }}>
            Verify & Create Account
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => setOtpSent(false)}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 36, maxWidth: 500, margin: '40px auto' }}>
      <h2 style={{ marginBottom: 24, textAlign: 'center', fontWeight: 800 }}>
        {isLogin ? 'Welcome to HungryOrder' : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            required 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            className="form-control" 
            required 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="5551234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Delivery Address</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="123 Maple St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Account Role</label>
              <select 
                className="form-control" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Customer (Order Food)</option>
                <option value="restaurant">Restaurant Owner (Sell Food)</option>
              </select>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 10 }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer' }}
        >
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </div>

      {isLogin && (
        <div className="glass-card" style={{ padding: 12, marginTop: 24, fontSize: 13, border: '1px solid var(--border-color)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <ShieldAlert size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Demo Accounts:</strong><br />
            Customer: <code>user@hungryorder.com</code> / <code>user123</code><br />
            Restaurant: <code>restaurant@hungryorder.com</code> / <code>rest123</code><br />
            Admin: <code>admin@hungryorder.com</code> / <code>admin123</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
