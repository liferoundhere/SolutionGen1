// All customer content lives in data/content.json. Every dollar figure is a modeled estimate.
import C from './data/content.json';

export const SITES = C.sites;
export const SITE = Object.fromEntries(C.sites.map((s) => [s.id, s]));
export const LENSES = C.lenses;
export const TOUR = C.tour;
export const FINALE = C.finale;
export const RANKS = C.ranks;
export const BADGES = C.badges;
export const MISSIONS = C.missions;
export const MISSION = Object.fromEntries(C.missions.map((m) => [m.id, m]));
export const FACILITIES = C.facilities;
export const ZONES = C.zones;
export const VIEWS = C.views;
export const TICKER = C.ticker;
export const LANES = C.lanes;
export const FABRIC_SOURCES = C.fabricSources.map((s) => ({ ...s, match: new RegExp(s.match, 'i') }));
export const FABRIC_ACTIONS = C.fabricActions;
export const STUDIO_VOICES = C.studioVoices;
export const STR = C.strings;
export const CUSTOMER = 'MetLife';
export const BRAND = { title: 'MetLife x Cisco Cloud Control', sub: 'AgenticOps 4D', storagePrefix: 'metlife-agenticops' };
export const DISCLAIMER = 'Illustrative scenarios built from public information about MetLife (including its New Frontier strategy and public filings) and common challenges across the insurance industry. No MetLife internal data is used. Dollar figures are modeled estimates based on industry benchmarks, meant for discussion only.';

// Scoring: share of the modeled exposure protected per decision quality, and XP per quality.
export const VALUE_SHARE = { best: 1, partial: 0.4, poor: 0 };
export const XP = { best: 150, partial: 60, poor: 20 };

export function money(v) {
  return v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${Math.round(v)}`;
}
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function regionOf(lon) { return lon < -30 ? 'Americas' : lon < 60 ? 'Europe, Middle East and Africa' : 'Asia Pacific'; }
