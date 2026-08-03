export function episodeTimestamp(episode) {
  const value = new Date(episode?.published_at || 0).getTime();
  return Number.isFinite(value) ? value : 0;
}

export function selectQualifyingPlaylistEpisodes(
  episodes,
  { oldestFirst = false, showLatestOnly = false, playedKeys = new Set(), episodeKey }
) {
  const raw = Array.isArray(episodes) ? episodes : [];
  const newestFirst = [...raw].sort((a, b) => episodeTimestamp(b) - episodeTimestamp(a));
  const ordered = showLatestOnly
    ? newestFirst.slice(0, 1)
    : oldestFirst
      ? [...newestFirst].reverse()
      : newestFirst;

  return ordered.filter((episode) => {
    if (!episode?.enclosure_url) return false;
    const key = episodeKey(episode);
    return key && !playedKeys.has(key);
  });
}

export function buildReconciledPlaylistOrder(existingRows, podcastId, eligibleEntries) {
  const rows = Array.isArray(existingRows) ? existingRows : [];
  const eligible = Array.isArray(eligibleEntries) ? eligibleEntries : [];
  const firstPodcastIndex = rows.findIndex((row) => row.podcast_id === podcastId);
  const insertionIndex = firstPodcastIndex < 0
    ? rows.filter((row) => row.podcast_id !== podcastId).length
    : rows.slice(0, firstPodcastIndex).filter((row) => row.podcast_id !== podcastId).length;
  const otherRows = rows.filter((row) => row.podcast_id !== podcastId);
  return [
    ...otherRows.slice(0, insertionIndex),
    ...eligible,
    ...otherRows.slice(insertionIndex),
  ];
}
