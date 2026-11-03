import { readFileSync } from "node:fs";
import path from "node:path";

const sourcePath = path.join(process.cwd(), "index.html");
const source = readFileSync(sourcePath, "utf8");
const mediaManifestPath = path.join(process.cwd(), "public", "media-manifest.json");
const mediaManifest = JSON.parse(readFileSync(mediaManifestPath, "utf8"));
const assetManifest = Object.fromEntries(
  Object.entries(mediaManifest.images).filter(([key]) => key.startsWith("assets/"))
);
const bodyMatch = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);

if (!bodyMatch) {
  throw new Error(`Could not find the site body in ${sourcePath}`);
}

const sourceMarkup = bodyMatch[1].replace(
  /\s*<script\b(?=[^>]*\bsrc=["'][^"']*(?:script|showcase)\.js["'])[^>]*>\s*<\/script>/gi,
  ""
);
const siteMarkup = sourceMarkup.replace(
  /<img\b[^>]*>/gi,
  imageTag => imageTag.replace(
    /\bsrc=(["'])(?:\.\/)?images\/([^"']+\.(?:png|jpe?g))\1/i,
    (_match, _quote, encodedFilename) => {
      const filename = decodeURIComponent(encodedFilename);
      const variants = mediaManifest.images[`images/${filename}`];
      if (!variants?.length) {
        throw new Error(`No optimized image variants found for images/${filename}`);
      }

      const src = variants.find(variant => variant.width >= 960) ?? variants.at(-1);
      const srcSet = variants.map(variant => `${variant.url} ${variant.width}w`).join(", ");
      return `src="${src.url}" srcset="${srcSet}" sizes="(max-width: 700px) 90vw, 1020px"`;
    }
  )
);
const structuredDataMatch = source.match(
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
);

export default function HomePage() {
  return (
    <>
      {structuredDataMatch && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataMatch[1] }}
        />
      )}
      <script
        id="arlo-asset-manifest"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(assetManifest).replace(/</g, "\\u003c")
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: siteMarkup }} />
    </>
  );
}
