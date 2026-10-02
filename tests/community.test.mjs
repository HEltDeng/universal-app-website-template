import test from 'node:test';
import assert from 'node:assert/strict';
import { localCommunityImage, communityBrandText } from '../assets/scripts/community.mjs';

test('QQ contact images accept public brand, screenshots and legacy asset directories', () => {
  for (const path of ['/brand/qq-group.png','/screenshots/community.webp','/assets/images/community/group.png','/assets/icons/qq.svg']) {
    assert.equal(localCommunityImage(path), path);
  }
});

test('QQ contact images reject external URLs, traversal and encoded paths', () => {
  for (const path of ['https://example.com/qr.png','//example.com/qr.png','/brand/../private.png','/brand/%2e%2e/private.png','/brand/a/./qr.png','/brand//qr.png','/brand/qr.png?x=1','javascript:alert(1)',null]) {
    assert.equal(localCommunityImage(path), '');
  }
});

test('QQ contact copy follows the configured product name', () => {
  const text = communityBrandText(' NOVA ');
  assert.equal(text.title, '加入“NOVA”QQ 交流群');
  assert.match(text.introduction, /NOVA/);
  assert.equal(text.imageAlt, 'NOVA QQ 交流群二维码');
  assert.match(communityBrandText('').title, /APP/);
});
