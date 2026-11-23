import React from "react";

/** Deliberately describes implemented behavior; no invented legal entity or retention promise. */
export function CreatorPrivacyPolicy({ creatorName, domain, usesCloudflare = true }: { creatorName: string; domain?: string; usesCloudflare?: boolean }) {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-5 py-10 text-sm leading-7">
      <h1 className="text-3xl font-semibold">Privacy Policy — {creatorName}</h1>
      {domain && <p>Website: {domain}</p>}
      <p>This policy explains how information is used when you visit {creatorName}&apos;s creator page and follow its links.</p>
      <h2 className="text-xl font-semibold">Information collected</h2>
      <p>The website processes your IP address, browser and device information, referring page, approximate location derived from your IP address, page visits, link clicks, and campaign or external click identifiers included in the URL. These help operate the page, understand traffic and measure link performance.</p>
      <h2 className="text-xl font-semibold">Cookies and browser storage</h2>
      <p>First-party cookies and browser storage are used for visitor and session identifiers and consistent page variants{usesCloudflare ? ", plus a short-lived age-confirmation and security-verification record" : ""}. Browser settings let you clear or restrict this storage; doing so may affect functionality. Where age confirmation is shown, it asks you to declare that you are at least 18; it does not collect a date of birth or verify your identity.</p>
      {usesCloudflare && <><h2 className="text-xl font-semibold">Security verification</h2>
      <p>Cloudflare Turnstile is used on the age-confirmation step to help detect automated requests. Cloudflare processes browser and network information for this check. See <a className="underline" href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare&apos;s Privacy Policy</a>.</p></>}
      <h2 className="text-xl font-semibold">Hosting, analytics and destination services</h2>
      <p>Technical service providers process information needed for hosting, media delivery, security and analytics. Where a link uses a tracking service, that service may receive campaign identifiers and connect a visit with later subscriptions or purchases on the destination service. Connected tracking integrations may report attributed events to configured advertising or analytics services. Processing can take place in other countries.</p>
      <p>External social profiles and destination websites have their own privacy policies and terms. This policy covers this creator page, rather than those external services. Following an external link shares information needed to open and, where configured, attribute that visit.</p>
      <h2 className="text-xl font-semibold">Purposes and retention</h2>
      <p>Information is used to provide and secure the website, maintain the requested link journey, investigate errors and measure traffic and conversions. It is retained for these operational, reporting and legal purposes, subject to the relevant provider&apos;s settings and applicable law. This website does not ask you to enter payment details on the creator page.</p>
      <h2 className="text-xl font-semibold">Your choices and privacy requests</h2>
      <p>Where applicable law gives you rights to access, correct, delete or restrict use of your personal information, you can contact {creatorName} through a social profile linked from this page. Identify the website and your request; do not send passwords or payment details. Your browser settings and the destination service&apos;s privacy controls provide additional choices.</p>
      <h2 className="text-xl font-semibold">Changes to this policy</h2>
      <p>This policy may be updated when the website&apos;s operation changes. The version published on this website applies to its current operation.</p>
    </article>
  );
}
