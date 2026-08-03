export function formatPlaylistRemaining(items, playback) {
  const rows = Array.isArray(items) ? items : [];
  const activeKey = String(playback?.episode_key || '');
  const pad = value => String(Math.max(0, Math.floor(Number(value) || 0))).padStart(2, '0');
  let seconds = 0;
  let unknown = 0;

  for (const item of rows) {
    if (!item || String(item.status || '').toLowerCase() === 'played') continue;

    const key = String(item.episode_key || item.guid || item.episode_guid || '');
    const isActive = Boolean(activeKey) && playback?.episode_key === key;
    const duration = Math.max(
      0,
      Number(isActive ? playback?.duration_seconds : item.duration_seconds) || 0,
    );

    if (!duration) {
      unknown += 1;
      continue;
    }

    const position = Math.max(
      0,
      Number(isActive ? playback?.position_seconds : item.position_seconds) || 0,
    );
    seconds += Math.max(0, duration - Math.min(position, duration));
  }

  const total = Math.max(0, Math.round(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const label = days
    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    : hours
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;

  return { seconds: total, unknown, label };
}
