/** @format */

// Last filter query the tournaments browse page was showing. The detail page
// reads this so its "Tournaments" back link returns to the same filtered
// result set instead of an unfiltered list. Browser-back is already covered by
// the browse page keeping its filters in the URL — this is only for the
// in-page link, which is a fresh push rather than a history pop.
let lastBrowseQuery = {};

export function setLastBrowseQuery(query) {
    lastBrowseQuery = query && typeof query === 'object' ? { ...query } : {};
}

export function getLastBrowseQuery() {
    return { ...lastBrowseQuery };
}
