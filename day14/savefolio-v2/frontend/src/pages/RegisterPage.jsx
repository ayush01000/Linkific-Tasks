import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your account was created. You can now sign in.",
        },
      });
    } catch (registerError) {
      setError(registerError.message);
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

        <h1>Create your account</h1>
        <p>Start tracking your money in one place.</p>

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
            <span>Full name</span>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              minLength="2"
              maxLength="100"
              autoComplete="name"
              required
            />
          </label>

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
              minLength="8"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="form-field">
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              minLength="8"
              autoComplete="new-password"
              required
            />
          </label>

          <Button
            type="submit"
            isLoading={submitting}
            className="button--full"
          >
            Create account
          </Button>
        </form>

        <p className="auth-switch">
          Already registered?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}