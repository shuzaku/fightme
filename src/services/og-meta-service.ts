const API_URL  = process.env.VUE_APP_API_URL || 'https://www.fighters-edge.com';
const SITE_URL = 'https://www.fighters-edge.com';
export const FALLBACK_OG_IMAGE = `${SITE_URL}/img/og-banner.png`;

interface OgOptions {
    title: string;
    description?: string;
    imageUrl: string;
    pageUrl?: string;
}

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

export function setOgMeta({ title, description, imageUrl, pageUrl }: OgOptions) {
    const desc = description || 'Find any matchup, any player, any tournament — free, forever.';
    const url  = pageUrl || SITE_URL;

    document.title = `${title} | Fighters Edge`;

    setMeta('og:title',       title);
    setMeta('og:description', desc);
    setMeta('og:image',       imageUrl);
    setMeta('og:url',         url);

    setMeta('twitter:title',       title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image',       imageUrl);
}

export function matchOgUrl(id: string)      { return `${API_URL}/og/match/${id}`; }
export function playerOgUrl(id: string)     { return `${API_URL}/og/player/${id}`; }
export function characterOgUrl(id: string)  { return `${API_URL}/og/character/${id}`; }
export function tournamentOgUrl(id: string) { return `${API_URL}/og/tournament/${id}`; }
