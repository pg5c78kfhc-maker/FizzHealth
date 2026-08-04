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
  `Result: ${clean(event.result)||(event.success?'SUCCESS':'FAILURE')}`,
  `Apple feed URL: ${clean(event.appleFeedUrl)}`,
  `Previous stored feed URL: ${clean(event.previousStoredFeedUrl)}`,
  `Stored feed URL: ${clean(event.storedFeedUrl)}`,
  `Requested feed URL: ${clean(event.requestedFeedUrl)}`,
  `URL integrity: ${clean(event.urlIntegrity)||'NOT_CHECKED'}`,
  `Created/reactivated: ${clean(event.recordAction)}`,
  `Retrieval mode: ${clean(event.retrievalMode)}`,
  `Feed type: ${clean(event.feedType)}`,
  `XML bytes: ${Number(event.xmlBytes)||0}`,
  `Episodes parsed: ${Number(event.episodesParsed)||0}`,
  `First episode: ${clean(event.firstEpisodeTitle)}`,
  `Last episode: ${clean(event.lastEpisodeTitle)}`,
  `Episodes selected: ${Number(event.episodesSelected)||0}`,
  `Episodes inserted: ${Number(event.episodesInserted)||0}`,
  `Episodes updated: ${Number(event.episodesUpdated)||0}`,
  `Episodes unchanged: ${Number(event.episodesUnchanged)||0}`,
  `Episodes rejected: ${Number(event.episodesRejected)||0}`,
  `Skipped by policy: ${Number(event.episodesSkippedByPolicy)||0}`,
  `Removed as older: ${Number(event.episodesRemovedAsOlder)||0}`,
  `Final stored count: ${Number(event.finalStoredCount)||0}`,
  `Last committed batch: ${Number(event.lastCommittedBatch)||0}`,
  `Last successful operation: ${clean(event.lastSuccessfulOperation)}`,
  `Failed stage: ${clean(event.failedStage)}`,
  `Commit result: ${clean(event.commitResult)}`,
  `Rollback result: ${clean(event.rollbackResult)}`,
  `Final error: ${clean(event.errorMessage)}`,
  `Stack trace: ${clean(event.errorStack)}`
 ];
 for(const tx of event.transactions||[]){lines.push('',`[TRANSACTION]`,...Object.entries(tx).map(([key,value])=>`${key}: ${typeof value==='object'?JSON.stringify(value):clean(value)}`))}
 for(const attempt of event.attempts||[]){lines.push('',`[${clean(attempt.stage).toUpperCase()}]`,...Object.entries(attempt).filter(([key])=>key!=='stage').map(([key,value])=>`${key}: ${typeof value==='object'?JSON.stringify(value):clean(value)}`))}
 return lines.join('\n');
}
export {STORAGE_KEY as PODCAST_DIAGNOSTICS_STORAGE_KEY};
