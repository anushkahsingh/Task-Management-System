
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("All fields are required.");
    
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, role });
      nav("/");
    } catch (err) {
      setError("Sign up failed. This email may already be in use.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔷</div>
        <h2 className="auth-title">Sign up for your account</h2>
        
        {error && <div className="error-message" style={{marginBottom: '20px'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>EMAIL</label>
            <input 
              className="auth-input"
              type="email" 
              placeholder="Enter email" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="auth-form-group">
            <label>PASSWORD</label>
            <input 
              className="auth-input"
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <div className="auth-form-group">
            <label>PRIVILEGE LEVEL</label>
            <select className="auth-input" onChange={e => setRole(e.target.value)} value={role}>
              <option value="member">Standard Participant</option>
              <option value="admin">System Administration</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" className="auth-link">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}
