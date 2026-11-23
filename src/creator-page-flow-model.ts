/** Whitehat V1 shares the V3 journey; V2 keeps its original single-page behavior. */
export function creatorUsesTwoPageFlow(linkType: unknown): boolean {
  return linkType === "whitehat" || linkType === "whitehat_v3";
}

export type CreatorPageStage = "intro" | "join";

export function creatorDisplayName(settings: any, link: any): string {
  for (const value of [settings?.display_name, link?.creator_name, link?.title, link?.domain]) {
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 160);
  }
  return "Creator";
}

/** Retain repeated campaign parameters, without allowing the query to select a destination. */
export function appendCreatorJourneySearch(target: string, search: string): string {
  const url = new URL(target, "https://creator.invalid");
  const existingKeys = new Set(url.searchParams.keys());
  new URLSearchParams(search).forEach((value, key) => {
    if (!existingKeys.has(key)) url.searchParams.append(key, value);
  });
  return target.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.toString();
}

export function creatorJourneySettings(settings: any, link: any, stage: CreatorPageStage, joinHref: string) {
  const source = settings ?? {};
  const cards = Array.isArray(source.cta_cards) ? source.cta_cards : [];
  const fallback = { id: "default", title: "Chat with me", url: link?.destination_url || "", order: 0, style: { type: "solid", background_color: "#ffffff", text_color: "#08080a" } };
  const introCard = { ...fallback, id: cards[0]?.id || "default", title: "More of me →", url: joinHref };
  return {
    background_color: "#08080a", background_gradient: { start: "#08080a", end: "#08080a" },
    theme_mode: "dark", button_style: "solid", button_color: "#ffffff", profile_display_mode: "full",
    social_links: [], verified_badge: false, verified_badge_style: "solid", show_follower_count: false,
    show_domain_handle: false, ...source,
    display_name: creatorDisplayName(source, link),
    // The visitor explicitly chooses each step; a stored timer cannot skip the age gate.
    auto_redirect_enabled: false,
    layout_sections: Array.from(new Set([...(source.layout_sections || ["header", "bio", "social_block", "voice_note", "cta_block", "gallery"]), "cta_block"])),
    cta_cards: stage === "intro" ? [introCard] : (cards.length ? cards : [fallback]).map((card: any) => ({ ...card, require_18plus: false })),
    ...(stage === "intro" ? { gallery_images: [], voice_note_url: null } : {}),
  };
}
