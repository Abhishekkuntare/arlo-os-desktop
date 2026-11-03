import { readFileSync } from "node:fs";
import path from "node:path";
import Script from "next/script";
import "../styles.css";
import "../showcase.css";

const mediaManifest = JSON.parse(
  readFileSync(path.join(process.cwd(), "public", "media-manifest.json"), "utf8")
);

export const metadata = {
  metadataBase: new URL("https://arloos.vercel.app/"),
  title: "ARLO OS — Modern Windows Desktop For You",
  description:
    "Discover ARLO OS, a modern, customizable Windows desktop with built-in apps, developer tools and optional Ghost AI. macOS and Linux releases are coming soon.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: "ARLO OS",
    title: "ARLO OS — Modern Windows Desktop For You",
    description:
      "A modern, customizable Windows desktop with built-in apps, developer tools and optional Ghost AI. macOS and Linux releases are coming soon.",
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
    title: "ARLO OS — Modern Windows Desktop For You",
    description:
      "Discover the customizable ARLO OS desktop, built-in apps, developer tools and optional Ghost AI. macOS and Linux releases are coming soon.",
    images: ["/images/Screenshot%20%28439%29.png"]
  },
  icons: {
    icon: "/images/arlo-favicon.png",
    apple: "/images/arlo-favicon.png"
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
        <Script src="/site/script.js" strategy="afterInteractive" />
        <Script src="/site/showcase.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
