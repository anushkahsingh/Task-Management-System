
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Enter your email and password.");
    
    setLoading(true);
    setError("");
    
    try {
      const r = await api.post("/auth/login", { email, password });
      localStorage.setItem("access", r.data.access);
      localStorage.setItem("refresh", r.data.refresh);
      nav("/dashboard");
    } catch (err) {
      setError("We couldn't find an account with that email and password.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔷</div>
        <h2 className="auth-title">Log in to your account</h2>
        
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
              autoFocus
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/register" className="auth-link">Sign up for an account</Link>
        </div>
      </div>
    </div>
  );
}
