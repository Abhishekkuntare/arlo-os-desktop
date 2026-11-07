"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./request-feature.module.css";

const requestTypes = [
  { value: "feature", label: "Feature request" },
  { value: "bug", label: "Bug report" },
  { value: "contact", label: "Contact us" }
];

export default function RequestFeatureForm() {
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const successTimeout = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(successTimeout.current);
    },
    []
  );

  async function handleSubmit(event) {
    event.preventDefault();
    window.clearTimeout(successTimeout.current);
    setStatus({ kind: "sending", message: "" });

    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          type: values.get("type"),
          message: values.get("message"),
          companyWebsite: values.get("companyWebsite")
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Your message could not be saved.");
      }

      form.reset();
      setStatus({
        kind: "success",
        message: "Thanks — your message has been sent to the ARLO OS team."
      });
      successTimeout.current = window.setTimeout(() => {
        setStatus({ kind: "idle", message: "" });
      }, 5000);
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your message could not be sent. Please try again."
      });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            autoComplete="name"
            maxLength={100}
            name="name"
            placeholder="Your name"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Email</span>
          <input
            autoComplete="email"
            maxLength={254}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>What is this about?</span>
        <select defaultValue="" name="type" required>
          <option disabled value="">
            Choose a topic
          </option>
          {requestTypes.map((requestType) => (
            <option key={requestType.value} value={requestType.value}>
              {requestType.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Your message</span>
        <textarea
          maxLength={5000}
          name="message"
          placeholder="Tell us what you have in mind or what went wrong."
          required
          rows={7}
        />
      </label>

      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Leave this field empty
          <input
            autoComplete="off"
            name="companyWebsite"
            tabIndex={-1}
          />
        </label>
      </div>

      <button
        className={styles.submit}
        disabled={status.kind === "sending"}
        type="submit"
      >
        {status.kind === "sending" ? "Sending…" : "Send message"}
        {status.kind !== "sending" && <span aria-hidden="true">→</span>}
      </button>

      <p
        aria-live="polite"
        className={`${styles.status} ${status.kind === "error" ? styles.error : ""} ${status.kind === "success" ? styles.success : ""}`}
        role="status"
      >
        {status.message}
      </p>
    </form>
  );
}