import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand__mark">S</span>
          <span>Savefolio</span>
        </div>

        <h1>Welcome back</h1>
        <p>Sign in to manage your finances.</p>

        {location.state?.message && (
          <div className="alert alert--success">
            {location.state.message}
          </div>
        )}

        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete="current-password"
              required
            />
          </label>

          <Button
            type="submit"
            isLoading={submitting}
            className="button--full"
          >
            Sign in
          </Button>
        </form>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}