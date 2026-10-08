import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useLazyGetMeQuery } from '../store/api.js';
import { setCredentials, setUser } from '../store/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/ui.jsx';

export default function Login() {
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [getMe] = useLazyGetMeQuery();
  const toast = useToast();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      const tokens = await login({ email, password }).unwrap();
      dispatch(setCredentials(tokens));
      const me = await getMe().unwrap();
      dispatch(setUser(me));
      toast('Signed in');
      navigate(state?.from ?? (me.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="auth">
      <div className="auth__card card">
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your account.</p>

        <div className="alert alert--info">
          <Info size={18} />
          <p>Sign in with the account you registered on this store.</p>
        </div>

        <form onSubmit={onSubmit} className="auth__form" noValidate={false}>
          <Field label="Email" id="login-email">
            <input id="login-email" className="input" type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password" id="login-password" error={error}>
            <div className="input-group">
              <input id="login-password" className="input" type={show ? 'text' : 'password'} required
                autoComplete="current-password" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }} />
              <button type="button" className="icon-btn icon-btn--ghost" onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          <button className="btn btn--primary btn--block btn--lg" type="submit">Sign in</button>
        </form>

        <p className="auth__switch muted">
          Don't have an account? <Link to="/register" className="link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
