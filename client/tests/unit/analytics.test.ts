import { describe, expect, it } from 'vitest';
import { beaconAttributes, isJoinBetaClick } from '../../src/lib/analytics';

const at = (path: string) => new URL(`https://site.test${path}`);

describe('isJoinBetaClick', () => {
  it('counts a link from the main site to the beta', () => {
    expect(isJoinBetaClick('/beta/', at('/'))).toBe(true);
    expect(isJoinBetaClick('https://site.test/beta', at('/engine'))).toBe(true);
  });
  it('counts the beta START key (#signup) anywhere', () => {
    expect(isJoinBetaClick('#signup', at('/beta/'))).toBe(true);
    expect(isJoinBetaClick('/beta/#signup', at('/beta/privacy'))).toBe(true);
  });
  it('ignores other links, other origins and links inside the beta', () => {
    expect(isJoinBetaClick('/engine', at('/'))).toBe(false);
    expect(isJoinBetaClick('https://elsewhere.test/beta/', at('/'))).toBe(false);
    expect(isJoinBetaClick('/beta/', at('/beta/privacy'))).toBe(false);
    expect(isJoinBetaClick('/beta/privacy', at('/'))).toBe(false);
  });
});

describe('beaconAttributes', () => {
  it('points at the cookieless beacon with the token and SPA tracking', () => {
    const a = beaconAttributes('tok');
    expect(a.src).toBe('https://static.cloudflareinsights.com/beacon.min.js');
    expect(JSON.parse(a['data-cf-beacon'])).toEqual({ token: 'tok', spa: true });
  });
});
