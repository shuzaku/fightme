/**
 * True when the viewport is within thresholdPx of the bottom of the document.
 *
 * Avoids strict equality on scrollTop + innerHeight === offsetHeight, which often
 * never fires on real devices (sub-pixel scroll, dynamic browser chrome, zoom).
 */
export function isNearDocumentBottom(thresholdPx = 120): boolean {
    const root = (document.scrollingElement != null
        ? document.scrollingElement
        : document.documentElement) as HTMLElement;
    const scrollTop =
        typeof window.pageYOffset === 'number' ? window.pageYOffset : root.scrollTop;
    const viewportBottom = scrollTop + window.innerHeight;
    const docHeight = Math.max(
        root.scrollHeight,
        root.offsetHeight,
        document.body ? document.body.scrollHeight : 0
    );
    return viewportBottom >= docHeight - thresholdPx;
}
