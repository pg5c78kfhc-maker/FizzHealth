export function groupPlaylistRows(rows, masterPodcastIds = []) {
  const groups = new Map();
  for (const row of rows || []) {
    if (!groups.has(row.podcast_id)) groups.set(row.podcast_id, []);
    groups.get(row.podcast_id).push(row);
  }
  const existingOrder = [...groups.keys()];
  const rank = new Map((masterPodcastIds || []).map((id, index) => [id, index]));
  const podcastIds = [...existingOrder].sort((a, b) => {
    const ar = rank.has(a) ? rank.get(a) : Number.MAX_SAFE_INTEGER;
    const br = rank.has(b) ? rank.get(b) : Number.MAX_SAFE_INTEGER;
    return ar - br || existingOrder.indexOf(a) - existingOrder.indexOf(b);
  });
  return { groups, podcastIds };
}

export function applyPlaylistFilters(rows, { enforceMasterOrder = false, enforceVariety = false, masterPodcastIds = [] } = {}) {
  const source = Array.isArray(rows) ? rows : [];
  if (!enforceMasterOrder && !enforceVariety) return [...source];
  const { groups, podcastIds } = groupPlaylistRows(source, enforceMasterOrder ? masterPodcastIds : []);
  if (!enforceVariety) return podcastIds.flatMap(id => groups.get(id) || []);
  const output = [];
  const max = Math.max(0, ...podcastIds.map(id => (groups.get(id) || []).length));
  for (let round = 0; round < max; round += 1) {
    for (const id of podcastIds) {
      const row = (groups.get(id) || [])[round];
      if (row) output.push(row);
    }
  }
  return output;
}
