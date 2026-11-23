"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { appendCreatorJourneySearch, creatorDisplayName, creatorJourneySettings, creatorUsesTwoPageFlow, type CreatorPageStage } from "./creator-page-flow-model";
import { CreatorPrivacyPolicy } from "./creator-privacy-policy";

type TurnstileApi = { render: (node: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }
let turnstileScript: Promise<void> | undefined;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileScript) turnstileScript = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => { if (window.turnstile) resolve(); else { script.remove(); turnstileScript = undefined; reject(new Error("Verification could not load. Please try again.")); } };
    script.onerror = () => { script.remove(); turnstileScript = undefined; reject(new Error("Verification could not load. Please try again.")); };
    document.head.appendChild(script);
  });
  return turnstileScript;
}
function TurnstileCheck({ siteKey, onToken, onError }: { siteKey: string; onToken: (token: string) => void; onError: (message: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onToken, onError });
  callbacks.current = { onToken, onError };
  useEffect(() => {
    let disposed = false; let widget: string | undefined;
    loadTurnstile().then(() => {
      if (disposed || !container.current || !window.turnstile) return;
      widget = window.turnstile.render(container.current, {
        sitekey: siteKey, action: "creator_age", theme: "dark", size: "flexible",
        callback: (token: string) => callbacks.current.onToken(token),
        "expired-callback": () => { callbacks.current.onToken(""); callbacks.current.onError("Verification expired. Please try again."); },
        "error-callback": () => { callbacks.current.onToken(""); callbacks.current.onError("Verification could not complete. Please try again."); },
      });
    }).catch((error: Error) => { if (!disposed) callbacks.current.onError(error.message); });
    return () => { disposed = true; if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [siteKey]);
  return <div ref={container} className="my-4 min-h-[65px] w-full" />;
}

export type CreatorPageFlowProps = {
  link: any; settings: any; creatorName?: string; stage?: CreatorPageStage; isPreview?: boolean;
  joinHref: string; privacyHref: string; turnstileSiteKey?: string;
  verify?: (token: string, target: string) => Promise<void>;
  renderPage: (settings: any, activate: (url: string, proceed: (options?: { track?: boolean }) => void) => boolean, footer: React.ReactNode) => React.ReactNode;
};

export function CreatorPageFlow({ link, settings, creatorName: ownerName, stage = "intro", isPreview = false, joinHref, privacyHref, turnstileSiteKey, verify, renderPage }: CreatorPageFlowProps) {
  const [previewStage, setPreviewStage] = useState<CreatorPageStage>(stage);
  const [pending, setPending] = useState<{ target: string; proceed: (options?: { track?: boolean }) => void } | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [previewComplete, setPreviewComplete] = useState(false);
  const isTwoPage = creatorUsesTwoPageFlow(link?.link_type);
  const currentStage = isPreview ? previewStage : stage;
  const modal = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const creatorName = ownerName || link?.creator_name || creatorDisplayName(settings, link);
  const activeDialog = Boolean((isTwoPage && pending) || privacy);
  useEffect(() => {
    if (!activeDialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    if (!isPreview) document.body.style.overflow = "hidden";
    modal.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) { setPending(null); setPrivacy(false); }
      if (event.key !== "Tab") return;
      const nodes = Array.from(modal.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], iframe, [tabindex="0"]') ?? []);
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); if (!isPreview) document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, [activeDialog, busy, isPreview]);

  const activate = (url: string, proceed: (options?: { track?: boolean }) => void) => {
    if (!isTwoPage) return false;
    if (currentStage === "intro") {
      if (isPreview) { setPreviewStage("join"); setPreviewComplete(false); }
      else proceed({ track: false });
      return true;
    }
    setToken(""); setError(""); setAttempt((value) => value + 1); setPending({ target: url, proceed });
    return true;
  };
  const confirm = async () => {
    if (!isTwoPage || !pending || busy) return;
    if (isPreview) { setPending(null); setPreviewComplete(true); return; }
    if (!token || !verify) return;
    setBusy(true); setError("");
    try { await verify(token, pending.target); pending.proceed(); setPending(null); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Verification failed. Please try again."); setToken(""); setAttempt((value) => value + 1); }
    finally { setBusy(false); }
  };
  return <div className="relative" data-creator-stage={isTwoPage ? currentStage : "single"}>
    {isPreview && isTwoPage && <nav aria-label="Creator flow preview" className="flex justify-center gap-2 bg-black p-3 text-xs text-white"><button type="button" onClick={() => { setPreviewStage("intro"); setPending(null); setPreviewComplete(false); }}>First page</button><span aria-hidden="true">→</span><button type="button" onClick={() => { setPreviewStage("join"); setPending(null); setPreviewComplete(false); }}>Second page</button></nav>}
    <div aria-hidden={activeDialog || undefined} inert={activeDialog ? true : undefined}>
      {renderPage(isTwoPage ? creatorJourneySettings(settings, link, currentStage, joinHref) : (settings ?? {}), activate,
        <footer className="relative z-10 mt-auto shrink-0 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 text-center text-sm" style={{ color: settings?.theme_mode === "light" ? "#71717a" : "rgba(255,255,255,0.6)" }}>
          <a className="underline underline-offset-4" href={privacyHref} onClick={isPreview ? (event) => { event.preventDefault(); setPrivacy(true); } : undefined}>Privacy Policy</a>
          <p className="mt-3">© {new Date().getFullYear()} {creatorName}</p>
        </footer>
      )}
    </div>
    {isTwoPage && previewComplete && <p role="status" className="bg-black p-3 text-center text-sm text-white">Preview complete. The live page continues through the existing tracked link.</p>}
    {activeDialog && <div className={`${isPreview ? "absolute" : "fixed"} inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm`}>
      <div ref={modal} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className="my-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#121214] p-5 text-center text-white shadow-2xl">
        {privacy ? <><h2 id={titleId} className="sr-only">Privacy Policy</h2><button type="button" className="rounded-full border border-white/30 px-5 py-2" onClick={() => setPrivacy(false)}>Close</button><div className="text-left"><CreatorPrivacyPolicy creatorName={creatorName} domain={link?.domain || undefined} usesCloudflare={isTwoPage} /></div></> : <>
          <h2 id={titleId} className="text-2xl font-semibold">Are you over 18?</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">This link is for adults only. Please confirm you are 18 or older to continue.</p>
          {isPreview ? <div className="my-4 rounded-lg border border-white/20 p-4 text-sm text-white/70">Cloudflare verification appears here on the live page. Preview only.</div> : turnstileSiteKey ? <TurnstileCheck key={attempt} siteKey={turnstileSiteKey} onToken={(value) => { setToken(value); if (value) setError(""); }} onError={setError} /> : <p role="alert" className="my-4 text-sm">Verification is temporarily unavailable. Please try again later.</p>}
          {error && <p role="alert" className="my-3 text-sm text-red-300">{error}</p>}
          <button type="button" className="mt-4 w-full rounded-full bg-white px-5 py-3 font-semibold text-black disabled:opacity-40" disabled={busy || (!isPreview && !token)} onClick={confirm}>{busy ? "Verifying…" : "Yes, I'm over 18"}</button>
          {!isPreview && error && <button type="button" className="mt-3 text-sm underline" onClick={() => { setError(""); setToken(""); setAttempt((value) => value + 1); }}>Retry verification</button>}
          <button type="button" disabled={busy} className="mt-3 w-full rounded-full border border-white/20 px-5 py-3 text-white/70" onClick={() => setPending(null)}>No, take me back</button>
          <a href={privacyHref} className="mt-4 inline-block text-xs underline text-white/60" onClick={isPreview ? (event) => { event.preventDefault(); setPending(null); setPrivacy(true); } : undefined}>Privacy Policy</a>
        </>}
      </div>
    </div>}
  </div>;
}
