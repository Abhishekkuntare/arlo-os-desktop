# ARLO OS Privacy Policy

**Effective date:** October 16, 2026

ARLO OS is an open-source desktop application maintained by Abhishek Kuntare.

This Privacy Policy explains how ARLO OS handles information when you use the application.

---

## 1. Privacy by design

ARLO OS is designed primarily as a local desktop application.

The project does not intentionally collect, sell or rent personal information for advertising, cross-service tracking or data-broker purposes. Optional profile information is used for project-level community insights, not advertising or automated decisions.

ARLO OS does not create a cloud profile unless a user explicitly opts in during setup. It does not use profile data for advertising.

---

## 2. Information stored locally

ARLO OS may store application preferences and configuration information locally on the user's computer.

Examples may include:

* Application preferences
* Appearance settings
* Wallpaper selections
* User interface preferences
* Application state
* Local application data
* Settings required for application functionality

The app's activity history is stored locally on the device. Clipboard History is off by default. If enabled in Settings, ARLO OS can save copied text locally for the Clipboard app; it keeps at most 100 entries, limits entry length, and attempts to skip text that resembles common credentials. This filtering is not guaranteed to detect every secret. Clipboard history can be cleared in the Clipboard app. The screen-lock PIN is also local and is not included in cloud profile sharing.

When you allow all-drive access for Finder, ARLO OS stores that consent locally and can browse accessible mounted drives. It reads directory names, file types, sizes, and timestamps only as you open folders. Files remain in their original locations; this feature does not recursively copy or upload file contents. You can revoke all-drive access from Finder's sidebar. Windows does not provide a separate global file-picker permission for desktop apps, so the in-app consent is explicit and controls this access. Finder can also connect individually selected folders when all-drive access is off.

On Windows, the application may query the current Wi-Fi network name and Bluetooth adapter status locally to show system connectivity. This information is not sent to an external service by this feature.

This information is stored on the user's device unless a particular feature explicitly requires communication with an external service.

The optional “Hey Lily” / “Hey Ghost” wake listener uses a bundled multilingual Whisper speech model to process microphone audio locally while the feature is enabled. Audio is not sent to a speech-recognition provider or saved by the wake listener. The listener is paused while ARLO OS is locked or sleeping and can be turned off in Settings. If the user continues with an AI request, the recognized text is sent to the configured Ghost AI service and selected provider. When spoken replies are enabled, Lily's reply text is sent to Google's Gemini text-to-speech service to generate audio.

---

## 3. Network communication

Some application features may communicate with external services.

Network communication may occur when the user explicitly uses a feature that requires an internet connection.

Examples can include:

* Checking for application updates
* Downloading application updates
* Opening external websites
* Using optional online services
* Using APIs or integrations explicitly enabled by the user

The application should not be interpreted as completely offline software when an enabled feature requires network access.

### Website privacy choices

The ARLO OS website asks visitors to choose whether optional presentation
enhancements may load. The choice is stored in the browser's local storage so
the notice is not shown again; it is not used to identify visitors or track
their activity. Essential storage only remembers that choice.

If a visitor allows experience enhancements, the site loads Google Fonts,
GSAP, and Lenis from their respective providers for typography, animation, and
smooth scrolling. Those providers receive the browser's network request and
may process connection metadata such as an IP address. These enhancements are
optional; the website remains usable when they are declined. The site does not
currently use advertising or visitor analytics cookies.

The public Insights section retrieves aggregate Microsoft Store figures from
Partner Center using a server-side integration. Visitors do not send Partner
Center credentials to Microsoft, and this integration does not identify or
track individual website visitors. The website also counts aggregate page
loads and clicks on ARLO OS and ARLO Deck download links. These totals are
stored by UTC date without cookies, visitor IDs, page URLs, IP addresses, or
individual event records. Download-link counts represent clicks, not confirmed
downloads or installs. The website host may process routine connection logs
under its own privacy and retention practices.

During first-time setup, users may choose **Share profile & enter ARLO OS** to share their name, display name, username, selected roles, email address, and profile photo with the project. This explicit choice sends these details to the project's private Supabase database, where they are visible through the authenticated administrator dashboard. Users who choose **Continue locally** keep their profile on their device.

Users can also choose **Share and sync my profile** from **Settings → User Profile**. This explicit action shares the selected “What do you do?” roles and profile details, including an optional profile photo and optional language or preferred-country settings when provided. A random installation identifier is used to match repeat syncs. Neither action sends the screen-lock PIN.

For opted-in profiles, the service uses the request's IP address to infer an approximate country and region using ipwho.is. The raw IP address and precise GPS location are not written to the analytics database, but the application host and ipwho.is process the IP address to provide this lookup. Server rate limiting also uses the request IP temporarily in memory. The host or its infrastructure may process connection metadata under its own practices. Location may be unavailable or inaccurate, for example when using a VPN or proxy.

The administrator dashboard also reads public GitHub repository star totals and release-asset download counts from the GitHub API. These are project-level public statistics, not per-user activity.

Phone screen sharing contacts the configured pairing service to create a short-lived session and exchange WebRTC connection setup messages. Pairing tokens and active signaling connections are held in memory and expire after five minutes; restarting the service ends active sessions. The relay does not receive or store screen video. WebRTC sends video peer-to-peer with transport encryption, except when a TURN relay is used. Connection setup can expose network-address candidates to the paired device and signaling service; STUN providers may also see public network addresses. The hosted service and STUN providers may process ordinary connection metadata under their own privacy policies.

Other optional online features send the information needed for the requested operation: weather location searches send the search term to Open-Meteo, and weather requests send the selected location's coordinates (including device coordinates if the user grants location access); translation sends the text entered for translation and language pair to MyMemory; music search sends the search term and configured Jamendo client ID to Jamendo; and currency conversion sends the source and target currency codes to Frankfurter. Currency amounts and surrounding text are processed in the app and are not part of the exchange-rate request. Direct requests to these services may expose the user's network address to the service.

---

## 4. Automatic updates

ARLO OS may periodically check the official release infrastructure for application updates.

The update system may communicate with the project's official GitHub release infrastructure to determine whether a newer version is available and to download an update.

Update functionality exists to maintain application functionality, security and compatibility.

---

## 5. External services

Depending on the feature used and its configuration, ARLO OS communicates with services operated by Google (Gemini AI and Gemini text-to-speech), OpenAI, Anthropic, Supabase, Render, ipwho.is, GitHub, Open-Meteo, MyMemory, Jamendo, Frankfurter, and configured STUN/TURN or phone-pairing services. Opening a website or using a third-party integration may also connect to that website or provider.

Each service receives the request data needed for its feature and may process network and device connection metadata, including an IP address. These services have their own privacy policies, terms and retention practices; ARLO OS does not control those practices.

Users should review the applicable service policies before sending information to a third party.

---

## 6. AI and external APIs

Ghost AI is an optional online assistant. When a user sends a request, ARLO OS sends the conversation messages to the configured Ghost AI service, which forwards the request to the selected provider: Google Gemini, OpenAI, or Anthropic. The request can also include the user's display name, available app names, assistant configuration, and any attachments added to the conversation. If the user authorizes a Ghost action, related tool calls and results may also be included. Screen analysis or screenshot sharing requires explicit confirmation. When spoken replies are enabled, reply text is sent to Google's Gemini text-to-speech service to generate audio.

AI requests are processed by ARLO OS's configured AI service and the selected provider. Their handling and retention are governed by those services' terms and privacy policies; ARLO OS cannot control or guarantee how a provider retains or uses submitted content.

Do not submit confidential, sensitive, or personal information unless you are comfortable sharing it with the configured service.

---

## 7. Personal information

Cloud profile sharing is optional and requires an explicit choice either during setup or from **Settings → User Profile**. The profile details described above are available to the authenticated project administrator for project-level community insights. They are not sold or used for advertising. Users can contact the project maintainer to request deletion of an opted-in profile.

---

## 8. Children's privacy

ARLO OS is general-purpose desktop software.

The project does not intentionally collect personal information from children.

Parents and guardians should supervise use of online services and third-party integrations where appropriate.

---

## 9. Data security

The project attempts to follow reasonable software-development and security practices.

However, no software or computer system can guarantee absolute security.

Users should maintain current operating-system security updates and obtain ARLO OS only from official project release channels.

---

## 10. Data deletion

Because much of the application's data is stored locally, users can remove local application data through the operating system or application settings where supported.

Removing the application does not necessarily remove every piece of data created by third-party services or external applications.

Filesystem consent and selected-folder grants are stored in the application's user-data directory and can be revoked from Finder. Removing those grants does not delete or modify the original files.

Uninstalling ARLO OS or clearing local app data does not delete a cloud profile previously shared with the project, or information held by AI, location, or other third-party services. Contact the project maintainer to request deletion of an opted-in cloud profile; contact the relevant provider about information it may hold.

Users should consult the relevant third-party service if they need to delete data held by that service.

---

## 11. Changes to this policy

This Privacy Policy may be updated when the application's functionality or data-handling practices change.

The latest version will be published in the project's official repository.

The effective date at the beginning of this document indicates the current version of the policy.

---

## 12. Contact

For privacy-related questions concerning ARLO OS, contact the project maintainer through the official GitHub repository:

https://github.com/Abhishekkuntare/arlo-os-developer-workstation
