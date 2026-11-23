import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/creator-page-flow-model.ts', import.meta.url), 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, URL, URLSearchParams });
const { creatorJourneySettings, appendCreatorJourneySearch, creatorUsesTwoPageFlow } = exports;
test('first page has one neutral internal CTA; second page retains every original tracked capability', () => {
  const settings = { display_name: 'Katie', auto_redirect_enabled: true, cta_cards: [{ id: 'original-paid', title: 'Configured offer', url: '/go/vip/original-paid?ecid=saved', style: { type: 'image', background_image: '/a/vip/asset' }, require_18plus: true }, { id: 'original-free', url: '/go/vip/original-free', style: { type: 'solid' } }] };
  const original = JSON.stringify(settings);
  const intro = creatorJourneySettings(settings, {}, 'intro', '/join/vip');
  assert.equal(intro.cta_cards.length, 1); assert.equal(intro.cta_cards[0].url, '/join/vip');
  assert.equal(intro.auto_redirect_enabled, false);
  const join = creatorJourneySettings(settings, {}, 'join', '/join/vip');
  assert.equal(join.cta_cards[0].id, 'original-paid'); assert.equal(join.cta_cards[0].url, settings.cta_cards[0].url);
  assert.equal(join.cta_cards[1].id, 'original-free'); assert.equal(join.cta_cards[1].url, settings.cta_cards[1].url);
  assert.equal(join.cta_cards[0].require_18plus, false); // shared outer modal owns confirmation
  assert.equal(join.cta_cards[0].title, 'chat with me');
  assert.equal(join.cta_cards[0].style.type, 'solid');
  assert.equal(join.cta_cards[0].style.background_image, undefined);
  assert.equal(intro.__creator_journey_stage, 'intro');
  assert.equal(join.__creator_journey_stage, 'join');
  assert.equal(join.auto_redirect_enabled, false);
  assert.equal(JSON.stringify(settings), original);
});
test('photo journey preserves creator media and every tracked destination without editing saved settings', () => {
  const settings = { theme_mode: 'light', profile_display_mode: 'video_background', avatar_url: '/a/photo', header_video_url: '/a/video', header_video_poster_url: '/a/poster', gallery_images: ['/a/gallery'], voice_note_url: '/a/voice', social_links: [{url: 'https://social.example'}], cta_cards: [{id:'paid',title:'Original',description:'Original description',url:'/go/private/paid?ecid=saved&utm_content=one&utm_content=two',order:2,open_in_new_tab:true,style:{type:'video',background_video:'/a/cta-video',logo_icon:'of-local',brand_asset:'/brand.svg'},ctr_mechanisms:{blur_overlay:{enabled:true}}}] };
  const original = JSON.stringify(settings);
  const intro = creatorJourneySettings(settings, {}, 'intro', '/join/private');
  const join = creatorJourneySettings(settings, {}, 'join', '/join/private');
  assert.equal(intro.avatar_url, settings.avatar_url);
  assert.equal(intro.header_video_url, settings.header_video_url);
  assert.equal(intro.cta_cards[0].title, 'more of me');
  assert.equal(join.avatar_url, settings.avatar_url);
  assert.equal(join.header_video_poster_url, settings.header_video_poster_url);
  assert.equal(join.gallery_images.length, 0); assert.equal(join.voice_note_url, null);
  const card=join.cta_cards[0];
  for(const key of ['id','url','order','open_in_new_tab']) assert.equal(card[key], settings.cta_cards[0][key]);
  assert.equal(card.description, null); assert.equal(card.ctr_mechanisms, null);
  assert.equal(card.title, 'chat with me'); assert.equal(card.style.background_video, undefined); assert.equal(card.style.logo_icon, undefined);
  assert.equal(JSON.stringify(settings), original);
});
test('campaign values survive both stages, including repeats and saved parameter precedence', () => {
  const next = appendCreatorJourneySearch('/join/vip', '?ecid=click&utm_content=one&utm_content=two&x=1');
  const final = new URL(appendCreatorJourneySearch('/go/vip/original-paid?ecid=saved', new URL(next, 'https://creator.example').search), 'https://creator.example');
  assert.equal(final.pathname, '/go/vip/original-paid');
  assert.equal(final.searchParams.get('ecid'), 'saved');
  assert.deepEqual(final.searchParams.getAll('utm_content'), ['one', 'two']);
  assert.equal(final.searchParams.get('x'), '1');
});

test('all Whitehat variants share two-page presentation', () => {
  assert.equal(creatorUsesTwoPageFlow('whitehat_v3'), true);
  assert.equal(creatorUsesTwoPageFlow('whitehat'), true);
  assert.equal(creatorUsesTwoPageFlow('whitehat_v2'), true);
  for (const type of ['greyhat','greyhat_v2','greyhat_v3','blackhat','',null,undefined]) assert.equal(creatorUsesTwoPageFlow(type), false);
});
