// Local persistence. Only metadata and playback positions are stored.
export const STORAGE_EVENT = 'teev-storage';
const KEYS = { continue: 'teev_continue_watching', list: 'teev_watchlist', reactions: 'teev_reactions', provider: 'teev_provider', sourceRatings: 'teev_source_ratings' };

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: key }));
  return true;
}
const safeStorageRead = (storage, key) => {
  try { return window[storage].getItem(key); } catch { return null; }
};
const same = (a, type, id) => a.type === type && String(a.id) === String(id);

export const continueStore = {
  all: () => [...read(KEYS.continue, [])].sort((a, b) => b.updatedAt - a.updatedAt),
  get: (type, id) => read(KEYS.continue, []).find((i) => same(i, type, id)) || null,
  save(item) {
    const rest = read(KEYS.continue, []).filter((i) => !same(i, item.type, item.id));
    write(KEYS.continue, [{ ...item, id: String(item.id), updatedAt: Date.now() }, ...rest].slice(0, 40));
  },
  remove(type, id) {
    write(KEYS.continue, read(KEYS.continue, []).filter((i) => !same(i, type, id)));
  },
};

export const listStore = {
  all: () => read(KEYS.list, []),
  has: (type, id) => read(KEYS.list, []).some((i) => same(i, type, id)),
  toggle(item) {
    const list = read(KEYS.list, []);
    const exists = list.some((i) => same(i, item.mediaType, item.id));
    const snapshot = {
      id: String(item.id),
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath ?? null,
      backdropPath: item.backdropPath ?? null,
      releaseDate: item.releaseDate || '',
      voteAverage: item.voteAverage || 0,
      genreIds: item.genreIds || [],
    };
    const saved = write(KEYS.list, exists
      ? list.filter((i) => !same(i, item.mediaType, item.id))
      : [{ id: String(item.id), type: item.mediaType, addedAt: Date.now(), item: snapshot }, ...list]);
    return saved ? !exists : exists;
  },
};

export const reactionStore = {
  get: (type, id) => read(KEYS.reactions, {})[`${type}:${id}`] || null,
  set(type, id, value) {
    const all = read(KEYS.reactions, {});
    if (value) all[`${type}:${id}`] = value; else delete all[`${type}:${id}`];
    write(KEYS.reactions, all);
  },
};

export const providerStore = {
  // Keep the selected source in this browser tab only. A localStorage value is
  // read as a one-time migration/default for existing users, but new changes
  // must not propagate to other open tabs.
  get: () => safeStorageRead('sessionStorage', KEYS.provider) || safeStorageRead('localStorage', KEYS.provider) || 'auto',
  getForTitle: (type, id, providerIds) => {
    const selected = safeStorageRead('sessionStorage', KEYS.provider) || safeStorageRead('localStorage', KEYS.provider) || 'auto';
    return selected === 'auto' ? sourceAdvisor.getBest(type, id, providerIds) : selected;
  },
  set: (id) => {
    try { window.sessionStorage.setItem(KEYS.provider, id); } catch { return false; }
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: KEYS.provider }));
    return true;
  },
};

// Provider reports are local hints, not a guaranteed cross-origin health check.
// Playback success can be detected only for providers that send player events;
// users can also report availability and ad experience manually.
export const sourceAdvisor = {
  getBest(type, id, providerIds) {
    const ratings = read(KEYS.sourceRatings, {})[`${type}:${id}`] || {};
    const ranked = providerIds
      .map((providerId, order) => {
        const rating = ratings[providerId] || { works: 0, unavailable: 0, adReports: 0 };
        const attempts = rating.works + rating.unavailable;
        const reliability = (rating.works + 1) / (attempts + 2);
        const adPenalty = rating.adReports / Math.max(1, rating.works + rating.adReports);
        return { providerId, order, score: reliability - adPenalty * 0.3 };
      })
      .sort((a, b) => b.score - a.score || a.order - b.order);
    return ranked[0]?.providerId || providerIds[0] || null;
  },
  report(type, id, providerId, kind) {
    const all = read(KEYS.sourceRatings, {});
    const key = `${type}:${id}`;
    const itemRatings = all[key] || {};
    const rating = itemRatings[providerId] || { works: 0, unavailable: 0, adReports: 0 };
    if (kind === 'works') rating.works += 1;
    if (kind === 'unavailable') rating.unavailable += 1;
    if (kind === 'ads') rating.adReports += 1;
    itemRatings[providerId] = rating;
    all[key] = itemRatings;
    write(KEYS.sourceRatings, all);
  },
};
