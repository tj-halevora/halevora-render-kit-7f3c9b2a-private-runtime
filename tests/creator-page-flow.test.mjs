import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/creator-page-flow-model.ts', import.meta.url), 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, URL, URLSearchParams });
const { creatorJourneySettings, appendCreatorJourneySearch } = exports;
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
  assert.equal(join.auto_redirect_enabled, false);
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
