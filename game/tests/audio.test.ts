import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transitionSound } from '../src/client/audio.js';
import { keepPowerOn } from '../src/content/missions.js';
import { newMission, project } from '../src/rules/joint-exit.js';

const view = () => project(newMission('audio-review', keepPowerOn), 'A');

test('audio ignores initial, duplicate, failed and new-mission snapshots', () => {
  const before = view(), after = structuredClone(before);
  assert.equal(transitionSound(undefined, after), null);
  assert.equal(transitionSound(before, after), null);
  after.explanations = ['Movement blocked.'];
  assert.equal(transitionSound(before, after), null);
  after.positions.A++;
  after.id = 'restart';
  assert.equal(transitionSound(before, after), null);
});

test('audio distinguishes movement, crate transport and parking, prioritizing completion', () => {
  const before = view(), after = structuredClone(before);
  after.positions.A++;
  assert.equal(transitionSound(before, after), 'step');
  after.foundry!.crate!.cell++;
  assert.equal(transitionSound(before, after), 'crate');
  after.foundry!.crate!.cell = after.foundry!.crate!.target;
  assert.equal(transitionSound(before, after), 'park');
  after.result = 'success';
  assert.equal(transitionSound(before, after), 'win');
  assert.equal(transitionSound(after, structuredClone(after)), null);
});

test('audio distinguishes gate opening and closing while robots move', () => {
  const before = view(), after = structuredClone(before);
  before.foundry!.gates[0]!.open = false;
  after.foundry!.gates[0]!.open = true;
  after.positions.A++;
  assert.equal(transitionSound(before, after), 'gateOpen');
  assert.equal(transitionSound(after, before), 'gateClose');
});
