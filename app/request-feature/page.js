import Link from "next/link";
import RequestFeatureForm from "./request-feature-form";
import styles from "./request-feature.module.css";

export const metadata = {
  title: "Share feedback | ARLO OS",
  description:
    "Send the ARLO OS team a feature idea, bug report, or message.",
  alternates: {
    canonical: "/request-feature"
  }
};

export default function RequestFeaturePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="ARLO OS home">
          ARLO<span>OS</span>
        </Link>
        <Link className={styles.backLink} href="/">
          <span aria-hidden="true">←</span> Back to ARLO OS
        </Link>
      </header>

      <section className={styles.content} aria-labelledby="page-title">
        <p className={styles.eyebrow}>FEEDBACK &amp; SUPPORT</p>
        <h1 id="page-title">Help shape what comes next.</h1>
        <p className={styles.intro}>
          Share a feature idea, report a bug, or send us a message. The ARLO OS
          team will review your submission.
        </p>

        <RequestFeatureForm />
      </section>

      <footer className={styles.footer}>
        Your message is saved for the ARLO OS team to review.
      </footer>
    </main>
  );
}