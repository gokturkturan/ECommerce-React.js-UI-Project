import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation, useLazyGetMeQuery } from '../store/api.js';
import { setCredentials, setUser } from '../store/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/ui.jsx';

export default function Register() {
  const dispatch = useDispatch();
  const [register] = useRegisterMutation();
  const [getMe] = useLazyGetMeQuery();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const tokens = await register({ email: form.email, password: form.password }).unwrap();
      dispatch(setCredentials(tokens));
      const me = await getMe().unwrap();
      dispatch(setUser(me));
      toast('Your account has been created');
      navigate('/');
    } catch (err) {
      setErrors({ email: err?.data?.message ?? 'Could not create your account.' });
    }
  };

  return (
    <div className="auth">
      <div className="auth__card card">
        <h1>Create an account</h1>
        <p className="muted">Sign up for free to track your orders.</p>

        <form onSubmit={onSubmit} className="auth__form">
          <Field label="Email" id="reg-email" error={errors.email}>
            <input id="reg-email" className="input" type="email" required autoComplete="email"
              value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Password" id="reg-password" hint="At least 6 characters" error={errors.password}>
            <input id="reg-password" className="input" type="password" required autoComplete="new-password"
              value={form.password} onChange={set('password')} />
          </Field>
          <Field label="Confirm password" id="reg-confirm" error={errors.confirm}>
            <input id="reg-confirm" className="input" type="password" required autoComplete="new-password"
              value={form.confirm} onChange={set('confirm')} />
          </Field>
          <label className="checkbox">
            <input type="checkbox" required />
            <span>I have read and agree to the Terms of Use and Privacy Policy.</span>
          </label>
          <button className="btn btn--primary btn--block btn--lg" type="submit">Sign up</button>
        </form>

        <p className="auth__switch muted">
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
