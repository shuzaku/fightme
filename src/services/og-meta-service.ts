import { resolveApiBaseURL } from '@/services/Api';

// `process.env.VUE_APP_API_URL` is baked in at build time and the repo's
// .env points at localhost, which would leak `http://localhost/api/og/...`
// URLs into production share previews. resolveApiBaseURL() rewrites those
// to the live origin when running on fighters-edge.com.
const API_URL  = resolveApiBaseURL();
const SITE_URL = 'https://fighters-edge.com';

export const FALLBACK_OG_IMAGE        = `${SITE_URL}/img/og-banner.png`;
const        FALLBACK_OG_IMAGE_WIDTH  = '1200';
const        FALLBACK_OG_IMAGE_HEIGHT = '630';

export const DEFAULT_DESC = 'Find any matchup, any player, any tournament — free, forever. Thousands of indexed pro matches across SF6, Tekken 8, 2XKO, GGST, and more.';

// ─── Low-level helpers ────────────────────────────────────────────────────────

function setMeta(property: string, content: string) {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
            || document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
    if (!el) {
        el = document.createElement('meta');
        property.startsWith('twitter:')
            ? el.setAttribute('name', property)
            : el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(url?: string) {
    // Derive from current path when no explicit URL is given (strips query params & hash)
    const href = url || (SITE_URL + window.location.pathname.replace(/\/$/, '')) || SITE_URL;
    let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface OgOptions {
    title: string;
    description?: string;
    /** Full URL to the share image. Pass undefined to use the site-wide fallback. */
    imageUrl?: string;
    /** Canonical page URL. Defaults to current pathname. */
    pageUrl?: string;
    /**
     * og:type value.
     * - 'video.other' for match/video pages
     * - 'profile'     for player pages
     * - 'website'     (default) for everything else
     */
    ogType?: 'website' | 'video.other' | 'profile';
}

/**
 * Full OG meta setter — use for pages that have a meaningful share image
 * (match, player, character, tournament).
 */
export function setOgMeta({ title, description, imageUrl, pageUrl, ogType }: OgOptions) {
    const desc  = description || DEFAULT_DESC;
    const img   = imageUrl || FALLBACK_OG_IMAGE;
    const url   = pageUrl  || (SITE_URL + window.location.pathname);
    const type  = ogType   || 'website';

    document.title = `${title} | Fighters Edge`;

    setMeta('og:type',         type);
    setMeta('og:title',        title);
    setMeta('og:description',  desc);
    setMeta('og:image',        img);
    setMeta('og:image:width',  FALLBACK_OG_IMAGE_WIDTH);
    setMeta('og:image:height', FALLBACK_OG_IMAGE_HEIGHT);
    setMeta('og:image:alt',    title);
    setMeta('og:url',          url);
    setMeta('description',     desc);

    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image',       img);
    setMeta('twitter:image:alt',   title);

    setCanonical(pageUrl);
}

/**
 * Lightweight setter for pages without a custom share image.
 * Uses the site-wide fallback banner automatically.
 * Covers: og:image, og:url, og:type, twitter:card — everything.
 */
export function setPageTitle(title: string, description?: string, imageUrl?: string) {
    const url = SITE_URL + window.location.pathname;
    setOgMeta({ title, description, imageUrl, pageUrl: url, ogType: 'website' });
}

/** Sets only the canonical link tag — for use in the router global hook. */
export function setCanonicalForRoute(path: string) {
    setCanonical(SITE_URL + (path === '/' ? '' : path));
}

// ─── OG image URL builders ────────────────────────────────────────────────────

export function matchOgUrl(id: string)      { return `${API_URL}/og/match/${id}`; }
export function playerOgUrl(id: string)     { return `${API_URL}/og/player/${id}`; }
export function characterOgUrl(id: string)  { return `${API_URL}/og/character/${id}`; }
export function tournamentOgUrl(id: string) { return `${API_URL}/og/tournament/${id}`; }
