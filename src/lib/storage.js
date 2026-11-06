// Local persistence for the first release. Only metadata and playback positions are stored.
export const STORAGE_EVENT = 'teev-storage';
const KEYS = { continue: 'teev_continue_watching', list: 'teev_watchlist', reactions: 'teev_reactions', provider: 'teev_provider' };

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: key }));
}
const same = (a, type, id) => a.type === type && String(a.id) === String(id);

export const continueStore = {
  all: () => read(KEYS.continue, []).sort((a, b) => b.updatedAt - a.updatedAt),
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
    write(KEYS.list, exists
      ? list.filter((i) => !same(i, item.mediaType, item.id))
      : [{ id: String(item.id), type: item.mediaType, addedAt: Date.now(), item: snapshot }, ...list]);
    return !exists;
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
  get: () => localStorage.getItem(KEYS.provider) || 'peachify',
  set: (id) => {
    localStorage.setItem(KEYS.provider, id);
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: KEYS.provider }));
  },
};
