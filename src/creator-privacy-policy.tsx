import React from "react";

export const MAX_CREATOR_PRIVACY_POLICY_LENGTH = 20000;

/** Always resolve the current default at read time; do not copy it to every link. */
export function defaultCreatorPrivacyTemplate(usesCloudflare = true): string {
  return [
    "This policy explains how information is used when you visit {{creator_name}}'s creator page and follow its links.",
    "## Information collected",
    "The website processes your IP address, browser and device information, referring page, approximate location derived from your IP address, page visits, link clicks, and campaign or external click identifiers included in the URL. These help operate the page, understand traffic and measure link performance.",
    "## Cookies and browser storage",
    "First-party cookies and browser storage are used for visitor and session identifiers and consistent page variants" + (usesCloudflare ? ", plus a short-lived age-confirmation and security-verification record" : "") + ". Browser settings let you clear or restrict this storage; doing so may affect functionality. Where age confirmation is shown, it asks you to declare that you are at least 18; it does not collect a date of birth or verify your identity.",
    ...(usesCloudflare ? ["## Security verification"] : []),
    ...(usesCloudflare ? ["Cloudflare Turnstile is used on the age-confirmation step to help detect automated requests. Cloudflare processes browser and network information for this check. See [Cloudflare's Privacy Policy](https://www.cloudflare.com/privacypolicy/)."] : []),
    "## Hosting, analytics and destination services",
    "Technical service providers process information needed for hosting, media delivery, security and analytics. Where a link uses a tracking service, that service may receive campaign identifiers and connect a visit with later subscriptions or purchases on the destination service. Connected tracking integrations may report attributed events to configured advertising or analytics services. Processing can take place in other countries.",
    "External social profiles and destination websites have their own privacy policies and terms. This policy covers this creator page, rather than those external services. Following an external link shares information needed to open and, where configured, attribute that visit.",
    "## Purposes and retention",
    "Information is used to provide and secure the website, maintain the requested link journey, investigate errors and measure traffic and conversions. It is retained for these operational, reporting and legal purposes, subject to the relevant provider's settings and applicable law. This website does not ask you to enter payment details on the creator page.",
    "## Your choices and privacy requests",
    "Where applicable law gives you rights to access, correct, delete or restrict use of your personal information, you can contact {{creator_name}} through a social profile linked from this page. Identify the website and your request; do not send passwords or payment details. Your browser settings and the destination service's privacy controls provide additional choices.",
    "## Changes to this policy",
    "This policy may be updated when the website's operation changes. The version published on this website applies to its current operation.",
  ].join("\n\n");
}

export function creatorPrivacyPolicyText(template: string | null | undefined, creatorName: string, domain = "", usesCloudflare = true) {
  const source = typeof template === "string" && template.trim() && template.length <= MAX_CREATOR_PRIVACY_POLICY_LENGTH
    ? template.trim() : defaultCreatorPrivacyTemplate(usesCloudflare);
  return source.replace(/\{\{\s*(creator_name|domain)\s*\}\}/g,
    (_, key: string) => key === "creator_name" ? creatorName : domain);
}

function policyInline(text: string) {
  const nodes: React.ReactNode[] = [];
  const pattern = /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    nodes.push(text.slice(last, match.index));
    nodes.push(<a key={match.index} className="underline" href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>);
    last = match.index! + match[0].length;
  }
  nodes.push(text.slice(last));
  return nodes;
}

/** Plain text and safe links only; saved policy text never becomes raw HTML. */
export function CreatorPrivacyPolicy({ creatorName, domain, usesCloudflare = true, template }: {
  creatorName: string; domain?: string; usesCloudflare?: boolean; template?: string | null;
}) {
  const text = creatorPrivacyPolicyText(template, creatorName, domain, usesCloudflare);
  return <article className="mx-auto max-w-3xl space-y-5 px-5 py-10 text-sm leading-7">
    <h1 className="text-3xl font-semibold">Privacy Policy — {creatorName}</h1>
    {domain && <p>Website: {domain}</p>}
    {text.split(/\n\s*\n/).map((block, index) => /^#{1,3} /.test(block)
      ? <h2 key={index} className="text-xl font-semibold">{block.replace(/^#{1,3} /, "")}</h2>
      : <p key={index} style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{policyInline(block)}</p>)}
  </article>;
}
