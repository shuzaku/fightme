const SCRIPT_ID = 'fe-json-ld';

/** Inject (or replace) a JSON-LD <script> block in <head>. */
export function injectJsonLd(schema: Record<string, any>): void {
    removeJsonLd();
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

/** Remove the active JSON-LD block (call in beforeDestroy). */
export function removeJsonLd(): void {
    const el = document.getElementById(SCRIPT_ID);
    if (el) el.remove();
}

// ── Schema builders ───────────────────────────────────────────────────────────

const SITE = 'https://fighters-edge.com';
const ORG = { '@type': 'Organization', name: 'Fighters Edge', url: SITE };

export function buildVideoObject({
    name,
    description,
    videoId,
    uploadDate,
    pageUrl,
}: {
    name: string;
    description: string;
    videoId: string;
    uploadDate?: string;
    pageUrl: string;
}): Record<string, any> {
    const schema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name,
        description,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
        url: pageUrl,
        publisher: ORG,
    };
    if (uploadDate) schema.uploadDate = uploadDate;
    return schema;
}

export function buildPerson({
    name,
    pageUrl,
    sameAs,
}: {
    name: string;
    pageUrl: string;
    sameAs?: string[];
}): Record<string, any> {
    const schema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        url: pageUrl,
    };
    if (sameAs && sameAs.length) schema.sameAs = sameAs;
    return schema;
}

export function buildSportsEvent({
    name,
    pageUrl,
    startDate,
    sport,
}: {
    name: string;
    pageUrl: string;
    startDate?: string;
    sport?: string;
}): Record<string, any> {
    const schema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name,
        url: pageUrl,
        sport: sport || 'Fighting game',
        organizer: ORG,
        location: {
            '@type': 'VirtualLocation',
            url: SITE,
        },
    };
    if (startDate) schema.startDate = startDate;
    return schema;
}
