import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { validateUsername } from '../utils/helpers';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    else if (form.fullName.length > 50) next.fullName = 'Max 50 characters.';
    const usernameErr = validateUsername(form.username.trim());
    if (usernameErr) next.username = usernameErr;
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate(location.state?.from || ROUTES.HOME);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setSubmitError('An account with this email already exists.');
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <Gamepad2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-3 text-2xl font-bold text-white">Create Your Account</h1>
        <p className="mt-1 text-sm text-slate-400">Join the SG Store developer community.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-surface-raised p-6 ring-1 ring-slate-800"
      >
        <Input
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          placeholder="Jane Doe"
          error={errors.fullName}
        />
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={(e) => set('username', e.target.value)}
          placeholder="janedev"
          hint="3–20 characters: letters, numbers, underscores."
          error={errors.username}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => set('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />

        {submitError && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create Account
        </Button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-primary-light hover:text-white">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
