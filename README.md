# ARLO OS

### A modern, open-source desktop environment for Windows.

ARLO OS is an open-source desktop environment designed to provide a modern, customizable and immersive desktop experience for Windows.

The project combines a familiar desktop workflow with a responsive interface, built-in applications, productivity tools, system utilities and a strong focus on visual design and user experience.

---

## ✨ Features

* 🖥️ Modern desktop environment
* 🎨 Customizable wallpapers and visual appearance
* 🪟 Desktop windows and application management
* 📁 File and folder workflows
* 🌐 Built-in browser experience
* 💻 Developer-focused tools
* 📝 Productivity applications
* 📅 Calendar and reminders
* 🧮 Calculator
* 📷 Camera application
* 🎵 Media and entertainment applications
* ⚙️ System settings
* 🔔 Notifications and system interactions
* 📊 Activity tracking and recent user actions with your own bot arlo custmizable
* 👻 Ghost AI — OS-level AI assistant for natural-language desktop automation with Lily and Brad Agent
* 📱 Responsive layouts
* ✨ Animated and glass-inspired interface
* 🔄 Automatic application updates
* 🔐 Authenticode-signed Windows releases (after code-signing approval)

Features may evolve as the project develops.

### Website analytics

The website's Insights section can refresh Microsoft Store installs, country
breakdowns, product-page views, and conversion from the Microsoft Store
analytics API. To enable it locally or on Vercel:

1. Associate your Partner Center account with its Microsoft Entra directory.
2. Add a Microsoft Entra application to Partner Center and give it the
   **Manager** role. Create a client secret for that application.
3. Configure `MS_PARTNER_TENANT_ID`, `MS_PARTNER_CLIENT_ID`, and
   `MS_PARTNER_CLIENT_SECRET` as server-only environment variables. Set
   `MS_STORE_APP_ID` to your Store ID if it differs from `9NN6LSN1KSZF`.
4. Set `ARLO_OTHER_DOWNLOADS` to the verified number of downloads outside the
   Microsoft Store. Partner Center cannot report downloads from other sources.

Use `.env.example` as the local variable-name template. Never prefix these
credentials with `NEXT_PUBLIC_` or commit their values. In Vercel, add them in
the project's Environment Variables settings and redeploy. Without the
credentials, the page displays the supplied 54-download snapshot and clearly
marks it as a snapshot; it does not pretend the data is live. Configured Store
metrics refresh on page load and every 15 minutes. Microsoft Store data covers
the last 30 days; non-Store downloads remain a separate manually maintained
count. The shared snapshot records 53 Store installs and 127 product-page
views, plus the separate acquisition funnel (60 attempts, 54 successful
installs, and 31 first-time launches). Partner Center overview and funnel
reports can show different install totals.

Microsoft's setup and API references:

* [Access analytics data using Store services](https://learn.microsoft.com/en-us/windows/uwp/monetize/access-analytics-data-using-windows-store-services)
* [Get app installs](https://learn.microsoft.com/en-us/windows/uwp/monetize/get-app-installs)
* [Get app acquisition funnel data](https://learn.microsoft.com/en-us/windows/uwp/monetize/get-acquisition-funnel-data)

### Website cookie preferences

The cookie notice remembers a visitor's choice in browser local storage. The
site does not use advertising or visitor analytics cookies. Google Fonts, GSAP,
and Lenis are loaded only when the visitor allows optional experience
enhancements; declining them leaves the site usable with system fonts and
native scrolling. Visitors can reopen and change their choice with the
**Cookie preferences** link in the footer.

### Desktop themes

The Themes section in Settings offers animated previews for 29 visual themes. ARLO OS's original appearance is the default; selecting a theme applies its colors and surfaces across the desktop, system panels, and built-in applications, and the choice is saved between launches. Use **Original Desktop** to restore the default appearance.

### Code Studio runtimes

Code Studio runs C++ and Java programs using local toolchains. On Windows, if a required toolchain is missing, Code Studio offers an **Install and Run** action: C++ setup installs MSYS2/GCC, and Java setup installs Eclipse Temurin JDK 21 through Windows winget. These installs require an internet connection and are started only after the user selects the install action. JavaScript and Python use their existing local runtimes.

### Finder context menus

Finder context menus work in both the virtual workspace and user-connected local folders. Local file operations are limited to folders the user has granted to ARLO OS. Deleting a file or folder moves it into the app's Trash; restoring returns local files to their original folder (with a renamed copy if a name collision exists), while permanent deletion and Empty Trash remove the stored data. System and app icons are protected from deletion. Code files open in VS Code when it is detected; otherwise Finder opens the file in Code Studio. Actions such as sharing or editing in third-party apps are only shown when an actual integration is available.

The desktop System widget polls live CPU load and memory usage from the host computer through Electron's main process. A metric that cannot be read is shown as unavailable.

### Host connectivity

On Windows, Control Center can scan and display nearby Wi-Fi networks with signal and security details. It can connect to a network with an existing Windows Wi-Fi profile; networks that need a new password must first be configured in Windows Wi-Fi settings. Bluetooth status comes from the host and is cleared while Bluetooth is off. The in-app scan can connect to Bluetooth LE devices; use **Pair classic** to open Windows Bluetooth settings for audio and other classic Bluetooth devices.

### Quick Look media streaming

Images and videos in Quick Look are streamed via a custom `abhishek-local://` protocol handler, eliminating the 2 MB size limit that applied to base64 conversion. The protocol handler serves files directly with correct MIME types, allowing unlimited image and video preview sizes.

When Electron's main-process or preload code changes, rebuild and reinstall/relaunch the desktop app; rebuilding only the renderer does not update its IPC handlers.

### Ghost AI and Gemini

Ghost AI uses Google's official `@google/genai` SDK from Electron's main process
with the `gemini-3.8-flash` model. The key is read from `GEMINI_API_KEY` in the
main-process environment or saved encrypted for the current Windows account in
Ghost AI settings; it is not used to call Gemini from the React renderer. Chat
requests continue through the `ghost-ai:chat` IPC handler and return structured,
bounded errors.

Gemini can request explicitly registered Ghost tools for opening/closing installed
apps, creating named desktop files/folders, showing the desktop, reading local
time and battery status, and toggling Focus Mode. Tool execution is checked
against the registry and the OS APIs; high- and critical-risk actions remain
disabled until a confirmation workflow exists. General AI chat requires a valid
Gemini API key and an internet connection.

The optional Windows wake listener uses a bundled multilingual Whisper base model
for local English, Hindi, and Marathi speech recognition. Microphone audio stays
on-device; recognized text may be sent to Gemini only when the user requests an AI
response and configures that service. Voice response language and installed Windows
speech voices affect pronunciation quality.

### 👻 Ghost AI and Gemini

Ghost AI is ARLO OS's OS-level AI assistant, powered by Google's official
`@google/genai` SDK and the `gemini-3.8-flash` model through Electron's main
process.

Ghost can understand natural-language commands and interact with registered
OS tools for opening and closing applications, creating files and folders,
showing the desktop, reading system information, and toggling Focus Mode.

Ghost AI also supports optional local wake-word voice interaction using a
bundled multilingual Whisper model for English, Hindi, and Marathi. Microphone
audio remains on-device unless the user explicitly requests an AI response.

### 📊 Activity Tracking

ARLO OS includes an Activity system that tracks recent user actions and
desktop interactions, helping users understand their workflow and quickly
return to previous tasks.

Activity history can be used by ARLO OS to provide contextual information for
features such as Ghost AI, workspace workflows, and productivity experiences.

---

## 📸 Screenshots

Screenshots and demonstrations are available in the repository and project releases.

---

## 🚀 Download

The direct Windows installer is not Authenticode-signed. Windows may show an **Unknown publisher** or SmartScreen warning.

**[Download ARLO OS](https://www.arloos.in/)**

ARLO OS is also available from the **[Microsoft Store](https://apps.microsoft.com/store/detail/9NN6LSN1KSZF?cid=DevShareMCLPCS)**. The Store-distributed app receives Microsoft signing and updates through the Store.

Only download direct installers from the official project release pages.

---

## 🔐 Code signing policy

The Microsoft Store listing is published. Microsoft signing applies to the app installed through the Store; it does not sign the standalone Windows EXE. The direct installer remains unsigned, so use the Store listing when you want a Microsoft-signed installation.

---

## 🔒 Privacy

ARLO OS is designed with user privacy in mind.

The application does not intentionally collect or sell personal information for advertising or profiling purposes.

Some features may communicate with external services when the user explicitly uses a feature that requires network access. Such communication is limited to the functionality requested by the user.

For details, see the project's:

**[Privacy Policy](PRIVACY.md)**

Third-party services and libraries used by the project may have their own privacy policies and terms.

---

## 🧩 Open Source

ARLO OS is released under the:

**MIT License**

See:

[LICENSE](LICENSE)

The project source code is publicly available so that users and contributors can inspect, modify and improve the software in accordance with the license.

---

## 🛠️ Technology

ARLO OS is built using modern web and desktop technologies, including:

* React
* TypeScript
* Vite
* Electron
* Electron Builder
* Tailwind CSS
* Lucide Icons
* GitHub Actions

The exact dependency versions used for a release are defined by the project's source repository and lockfile.

---

## 🏗️ Development

### Website (Next.js)

The website runs on Next.js. Its existing `index.html`, stylesheets, and browser
scripts remain the source of truth so the current design and interactions are
preserved during the migration. The preparation step copies the original images,
browser scripts, and SEO files into `public/` before starting Next.js or creating
a production build. It also creates responsive WebP image variants from the
original PNG/JPEG assets; the originals are preserved, while the site selects a
smaller variant for each screen size and loads gallery images as needed. Generated
copies and optimized variants are intentionally ignored by Git. Optimized files
use content-versioned URLs and long-lived browser caching. Desktop wheel scrolling
uses Lenis synchronized with GSAP ScrollTrigger; touch scrolling stays native, and
the smooth-scroll effect is disabled when reduced motion is requested. The
product-tour video is hosted by Synthesia and loads only after the visitor selects
Play, so its startup and buffering still depend on that service and the visitor's
connection.

```bash
npm install
npm run dev
```

For a production build and local production server:

```bash
npm run build
npm run start
```

The Windows installer is served from the local `downloads/` folder when that
file is present. Installer files are not part of this website's tracked source;
deployments need their own release-download configuration if they should serve
the installer.

### Requirements

To develop ARLO OS locally, you should have:

* Node.js
* npm
* Git

Clone the repository:

```bash
git clone https://github.com/Abhishekkuntare/abhishek-mac-os.git
cd abhishek-mac-os
```

Install dependencies:

```bash
npm install
```

Run the development environment:

```bash
npm run dev
```

Run ARLO OS in Electron without rebuilding the offline voice listener:

```bash
npm run electron:dev
```

The wake listener starts shortly after the desktop is rendered so it does not delay the initial screen. To rebuild the listener before launching Electron, use `npm run electron:dev:voice`.

Build the renderer:

```bash
npm run build:renderer
```

Build the Windows installer and Microsoft Store package:

```bash
npm run package:win
```

This creates the ARLO OS Windows installer and Store package in `release/`. The Store package keeps this app's existing Partner Center identity so updates remain attached to the reserved listing. If Microsoft assigns a different identity, override `APPX_IDENTITY_NAME`, `APPX_PUBLISHER`, and `APPX_PUBLISHER_DISPLAY_NAME` with the exact Partner Center values.

To build only the standalone Windows installer:

```bash
npm run package:exe
```

---

## 📦 Release process

Each tagged release continues to publish the standalone EXE and updater metadata to GitHub Releases. That EXE remains unsigned. The same workflow also builds an MSIX package and uploads it as a workflow artifact; a maintainer must download that artifact and submit it to Partner Center for validation and Store certification.

```text
Source Code
    ↓
GitHub Actions
    ↓
Renderer Build
    ↓
 ┌─────────────────────────────┬─────────────────────────────────┐
 │ NSIS EXE                    │ Microsoft Store MSIX            │
 │ GitHub Release, unsigned    │ Actions artifact for Partner    │
 │                             │ Center submission               │
 └─────────────────────────────┴─────────────────────────────────┘
                                      ↓
                        Partner Center certification
                                      ↓
                              Microsoft Store
```

Release artifacts are published through the official GitHub Releases page.

---

## 🔄 Automatic Updates

The standalone Windows installer uses the project's GitHub Releases for automatic updates. Microsoft Store installations receive updates through the Microsoft Store; the app's built-in updater is disabled for Store-packaged installs.

Users should not need to manually uninstall the application to receive supported application updates.

Updates are downloaded and installed according to the application's update configuration and user interaction.

---

## 🐛 Issues and Contributions

Bug reports, feature requests and improvements are welcome.

Please use GitHub Issues:

https://github.com/Abhishekkuntare/abhishek-mac-os/issues

When reporting a problem, include:

* ARLO OS version
* Windows version
* Steps to reproduce the issue
* Expected behavior
* Actual behavior
* Relevant screenshots or logs

Please do not publicly disclose security-sensitive information.

---

## 🤝 Contributing

Contributions are welcome.

Before submitting a pull request:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the application.
5. Verify that the build succeeds.
6. Submit a pull request describing your changes.

Changes from contributors should be reviewed before being merged into the official project.

---

## 🛡️ Security

If you discover a security vulnerability, please avoid publicly disclosing sensitive details before the issue can be investigated.

Use the repository's available security/contact mechanism where possible.

Security reports should include enough information to reproduce and investigate the issue.

---

## 📜 License

Copyright © 2026 Abhishek Kuntare.

ARLO OS is licensed under the MIT License.

See [LICENSE](LICENSE) for the complete license text.

---

## 👤 Maintainer

**Abhishek Kuntare**

GitHub:

https://github.com/Abhishekkuntare

Project repository:

https://github.com/Abhishekkuntare/abhishek-mac-os

---

## ⭐ Support the Project

If you find ARLO OS useful, consider:

* ⭐ Starring the repository
* 🐛 Reporting bugs
* 💡 Suggesting improvements
* 🔧 Contributing code
* 📢 Sharing the project with other developers

Thank you for supporting open-source software.

---

## Feedback submissions

Feature requests, bug reports, contact messages, website page views, and
download-link clicks use Supabase in production. The website activity dashboard
shows aggregate all-time counts; page views and download clicks are counted
without storing cookies, visitor IDs, IP addresses, page URLs, or individual
event records. Download counts measure link clicks, not confirmed installs.
For local development without Supabase credentials, feedback messages are
appended to `feedback-data/submissions.jsonl`. That local data directory is
excluded from Git.

### Connect feedback storage on Vercel

1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. In the Supabase SQL Editor, run the schema in
   [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy the project URL and the server-side service role key from your
   Supabase project's API settings. Keep the service role key private; never
   add it to client-side code or commit it to Git.
4. For local development, put both values in the ignored `.env.local` file.
   In Vercel project settings, add `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` as environment variables for the deployments
   you use.
5. Redeploy the site so the new environment variables take effect. Counts
   start when the analytics schema is deployed; earlier traffic is not
   available retroactively.

The feedback table has row-level security enabled and grants access only to
the server-side `service_role`. Submissions include the sender's name and email
address. Keep database credentials private and handle submissions accordingly.
