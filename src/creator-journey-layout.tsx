"use client";

import React from "react";
import { Icon } from "@iconify/react";
import type { CreatorPageStage } from "./creator-page-flow-model";

/** The same photo-card presentation is used by the public page and editor preview.
 * Navigation stays with the host renderer, including its existing tracked links.
 */
export function CreatorJourneyLayout({ settings, pageFooter, renderAction, renderSocial }: {
  settings: any;
  pageFooter?: React.ReactNode;
  renderAction: (card: any, className: string) => React.ReactNode;
  renderSocial: (social: any, className: string, icon: React.ReactNode) => React.ReactNode;
}) {
  const stage: CreatorPageStage = settings.__creator_journey_stage;
  const photo = settings.header_video_poster_url || settings.avatar_url;
  const socials = Array.isArray(settings.social_links) ? settings.social_links : [];
  const instagram = socials.find((social: any) => /instagram/i.test(`${social.platform || ""} ${social.url || ""}`));
  let handle = "";
  try {
    const url = new URL(instagram?.url || "");
    if (/^(www\.)?instagram\.com$/i.test(url.hostname)) {
      const name = url.pathname.split("/").filter(Boolean)[0];
      if (name && /^[\w.]+$/.test(name) && !["p", "reel", "reels", "stories", "explore"].includes(name)) handle = `@${name}`;
    }
  } catch {}
  return <div className="hvj-page" data-creator-layout="reference">
    <style>{`
      .hvj-page{min-height:100svh;display:flex;flex-direction:column;align-items:center;padding:16px 16px calc(32px + env(safe-area-inset-bottom));box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;background:#0b0b0b;color:#f2f2f2}
      .hvj-photo{position:relative;width:100%;max-width:360px;aspect-ratio:4/5;border-radius:18px;overflow:hidden;background:#161616}
      .hvj-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
      .hvj-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.78) 100%)}
      .hvj-identity{position:absolute;left:0;right:0;bottom:0;padding:0 18px 20px;text-align:center}
      .hvj-name{font-size:24px;font-weight:700;margin:0;display:inline-flex;align-items:center;gap:6px;letter-spacing:-.01em;line-height:normal;color:#f2f2f2}
      .hvj-handle{font-size:13px;color:rgba(255,255,255,.72);margin:4px 0 0;line-height:normal}
      .hvj-tag{font-size:13px;color:rgba(255,255,255,.8);margin:8px 0 0;line-height:normal}
      .hvj-button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;padding:12px 22px;border-radius:999px;background:#fff;color:#0b0b0b;font-weight:600;font-size:15px;line-height:normal;text-decoration:none;border:0;cursor:pointer;width:100%;max-width:360px}
      .hvj-button:focus-visible,.hvj-social:focus-visible{outline:2px solid #fff;outline-offset:4px}
      .hvj-socials{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-top:18px}
      .hvj-social{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:999px;background:#1a1a1a;border:1px solid #2a2a2a;color:#fff;text-decoration:none}
      .hvj-sub{width:100%;max-width:360px;text-align:center;font-size:13px;line-height:normal;color:rgba(255,255,255,.72);margin:14px 0 0}
      .hvj-footer{margin-top:26px;display:flex;flex-direction:column;align-items:center;gap:10px;font-size:12px;line-height:normal;color:rgba(255,255,255,.6);text-align:center}
      .hvj-footer a{color:rgba(255,255,255,.75);text-decoration:none}.hvj-footer p{margin:0}
    `}</style>
    <div className="hvj-photo">
      {photo && <img src={photo} alt={settings.display_name || "Creator"} loading="eager" decoding="async" style={{ objectPosition: settings.header_video_focus || "center" }} />}
      <div className="hvj-shade" />
      <div className="hvj-identity">
        <h1 className="hvj-name">{settings.display_name}{stage === "join" && settings.verified_badge && <svg aria-label="Verified" role="img" width="18" height="18" viewBox="0 0 24 24"><path fill="#1d9bf0" d="m12 1 2.9 2.1 3.6.2 1.3 3.4 2.8 2.3-.9 3.5.9 3.5-2.8 2.3-1.3 3.4-3.6.2L12 23l-2.9-2.1-3.6-.2-1.3-3.4L1.4 15l.9-3.5-.9-3.5 2.8-2.3 1.3-3.4 3.6-.2Z"/><path fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m7 12 3 3 7-7"/></svg>}</h1>
        {handle && <p className="hvj-handle">{handle}</p>}
        {stage === "intro" && settings.bio && <p className="hvj-tag">{settings.bio}</p>}
      </div>
    </div>
    {stage === "join" && <p className="hvj-sub">More of my content. Tap below to chat with me.</p>}
    {[...(settings.cta_cards || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((card: any) => <React.Fragment key={card.id}>{renderAction(card, "hvj-button")}</React.Fragment>)}
    {stage === "intro" && socials.length > 0 && <nav className="hvj-socials" aria-label="Socials">{socials.map((social: any, index: number) => {
      const platform = String(social.platform || "").toLowerCase();
      const icon = /instagram/.test(platform) ? "mdi:instagram" : /snapchat/.test(platform) ? "ri:snapchat-fill" : /tiktok/.test(platform) ? "ic:baseline-tiktok" : social.icon || "mdi:link";
      return <React.Fragment key={social.id || index}>{renderSocial(social, "hvj-social", <Icon icon={icon} width={22} height={22} />)}</React.Fragment>;
    })}</nav>}
    {pageFooter}
  </div>;
}
