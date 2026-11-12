import { readFileSync } from "node:fs";
import path from "node:path";
import Script from "next/script";
import WebsiteAnalytics from "./website-analytics";
import "../styles.css";
import "../showcase.css";

const mediaManifest = JSON.parse(
  readFileSync(path.join(process.cwd(), "public", "media-manifest.json"), "utf8")
);

export const metadata = {
  metadataBase: new URL("https://www.arloos.in/"),
  applicationName: "ARLO OS",
  title: "ARLO OS for Windows and macOS | Custom Desktop Environment",
  description:
    "ARLO OS is a customizable desktop app for Windows and macOS, with productivity tools, virtual workspaces, developer utilities, and optional Ghost AI.",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large"
    }
  },
  openGraph: {
    type: "website",
    siteName: "ARLO OS",
    title: "ARLO OS for Windows and macOS | Custom Desktop Environment",
    description:
      "ARLO OS is a customizable desktop app for Windows and macOS, with productivity tools, virtual workspaces, developer utilities, and optional Ghost AI.",
    url: "/",
    images: [
      {
        url: "/images/Screenshot%20%28439%29.png",
        alt: "ARLO OS desktop environment and workspace"
      }
    ],
    locale: "en_IN"
  },
  twitter: {
    card: "summary_large_image",
    title: "ARLO OS for Windows and macOS | Custom Desktop Environment",
    description:
      "ARLO OS is a customizable desktop app for Windows and macOS, with productivity tools, virtual workspaces, developer utilities, and optional Ghost AI.",
    images: ["/images/Screenshot%20%28439%29.png"]
  },
  icons: {
    icon: {
      url: "/images/arlo-favicon1.png",
      type: "image/png",
      sizes: "256x256"
    },
    apple: {
      url: "/images/arlo-favicon1.png",
      sizes: "256x256"
    }
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#08090d" />
        <meta name="arlo-media-version" content={mediaManifest.version} />
      </head>
      <body>
        {children}
        <WebsiteAnalytics />
        <Script src="/site/script.js" strategy="afterInteractive" />
        <Script src="/site/showcase.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
