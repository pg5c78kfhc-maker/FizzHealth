const STORAGE_KEY='fizz:podcast-retrieval-diagnostics:v1';
const MAX_EVENTS=100;
const clean=value=>value==null?'':String(value);
const safeJson=value=>{try{return JSON.parse(value)}catch{return null}};
const store=storage=>storage||globalThis.localStorage;
export function readPodcastDiagnostics(storage=globalThis.localStorage){
 try{const rows=safeJson(store(storage)?.getItem(STORAGE_KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}
}
export function savePodcastDiagnostic(event,storage=globalThis.localStorage){
 const row={id:event?.id||`poddiag-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,timestamp:event?.timestamp||new Date().toISOString(),...event};
 try{const rows=[row,...readPodcastDiagnostics(storage).filter(item=>item.id!==row.id)].slice(0,MAX_EVENTS);store(storage)?.setItem(STORAGE_KEY,JSON.stringify(rows))}catch{}
 return row;
}
export function clearPodcastDiagnostics(storage=globalThis.localStorage){try{store(storage)?.removeItem(STORAGE_KEY)}catch{}}
export function latestPodcastDiagnostic(podcastId='',storage=globalThis.localStorage){const rows=readPodcastDiagnostics(storage);return rows.find(row=>!podcastId||row.podcastId===podcastId)||null}
export function formatPodcastDiagnostics(event){
 if(!event)return 'No podcast diagnostics are available.';
 const lines=[
  `Fizz Health podcast diagnostics`,
  `Timestamp: ${clean(event.timestamp)}`,
  `Podcast: ${clean(event.podcastTitle)}`,
  `Podcast ID: ${clean(event.podcastId)}`,
  `Directory ID: ${clean(event.directoryId)}`,
  `Operation: ${clean(event.operation)}`,
  `Result: ${event.success?'SUCCESS':'FAILURE'}`,
  `Apple feed URL: ${clean(event.appleFeedUrl)}`,
  `Previous stored feed URL: ${clean(event.previousStoredFeedUrl)}`,
  `Stored feed URL: ${clean(event.storedFeedUrl)}`,
  `Requested feed URL: ${clean(event.requestedFeedUrl)}`,
  `URL integrity: ${event.urlIntegrity===true?'MATCH':event.urlIntegrity===false?'MISMATCH':'UNKNOWN'}`,
  `Created/reactivated: ${clean(event.recordAction)}`,
  `Retrieval mode: ${clean(event.retrievalMode)}`,
  `Feed type: ${clean(event.feedType)}`,
  `XML bytes: ${Number(event.xmlBytes)||0}`,
  `Episodes parsed: ${Number(event.episodesParsed)||0}`,
  `First episode: ${clean(event.firstEpisodeTitle)}`,
  `Last episode: ${clean(event.lastEpisodeTitle)}`,
  `Episodes inserted: ${Number(event.episodesInserted)||0}`,
  `Episodes updated: ${Number(event.episodesUpdated)||0}`,
  `Episodes ignored: ${Number(event.episodesIgnored)||0}`,
  `Final error: ${clean(event.errorMessage)}`
 ];
 for(const attempt of event.attempts||[]){lines.push('',`[${clean(attempt.stage).toUpperCase()}]`,...Object.entries(attempt).filter(([key])=>key!=='stage').map(([key,value])=>`${key}: ${typeof value==='object'?JSON.stringify(value):clean(value)}`))}
 return lines.join('\n');
}
export {STORAGE_KEY as PODCAST_DIAGNOSTICS_STORAGE_KEY};
