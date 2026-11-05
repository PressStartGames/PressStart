import { GrowthBook } from '@growthbook/growthbook';
import { describe, expect, it } from 'vitest';
import { FLAGS, applyFlags, parseJoinBeta, useLegacyFlagsVersion } from '../../src/lib/flags';

const feed = (value: unknown) =>
  new GrowthBook({ features: { 'join-beta-cta': { defaultValue: value } } });

describe('parseJoinBeta', () => {
  it('reads on and label', () => {
    expect(parseJoinBeta({ on: false })).toEqual({ on: false });
    expect(parseJoinBeta({ on: true, label: ' Get early access ' })).toEqual({
      on: true,
      label: 'Get early access',
    });
  });
  it('keeps the default for anything malformed', () => {
    expect(parseJoinBeta('nope')).toEqual({ on: true });
    expect(parseJoinBeta(null)).toEqual({ on: true });
    expect(parseJoinBeta({ on: 'yes', label: 3 })).toEqual({ on: true });
  });
});

describe('the flag store', () => {
  it('a payload flip changes FLAGS.joinBeta without a rebuild, and bumps the legacy version', () => {
    expect(typeof useLegacyFlagsVersion).toBe('function');
    expect(FLAGS.joinBeta).toBe(true); // env default; this read marks the legacy reader
    applyFlags(feed({ on: false }));
    expect(FLAGS.joinBeta).toBe(false);
    applyFlags(feed({ on: true, label: 'Join now' }));
    expect(FLAGS.joinBeta).toBe(true);
  });
  it('a missing feature leaves the defaults', () => {
    applyFlags(new GrowthBook({ features: {} }));
    expect(FLAGS.joinBeta).toBe(true);
  });
});
