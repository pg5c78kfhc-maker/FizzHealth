export const SHUFFLE_PLAYLIST_ID='shuffle';
export const SHUFFLE_EXCLUDED_SOURCE_IDS=new Set(['shuffle','library','unassigned']);

export function eligibleShuffleSources(playlists=[]){
  return playlists.filter(row=>row&&row.playlist_id&&!SHUFFLE_EXCLUDED_SOURCE_IDS.has(row.playlist_id));
}

export function buildShuffleQueue({sourcePlaylistIds=[],itemsByPlaylist={}}={}){
  const byEpisode=new Map();
  const queue=[];
  const diagnostics=[];
  for(const playlistId of sourcePlaylistIds){
    const candidate=(itemsByPlaylist[playlistId]||[])[0];
    if(!candidate){diagnostics.push({type:'empty-source',playlistId});continue}
    const episodeKey=String(candidate.episode_key||candidate.episode_id||'');
    if(!episodeKey){diagnostics.push({type:'invalid-candidate',playlistId});continue}
    const existing=byEpisode.get(episodeKey);
    if(existing){
      existing.contributing_playlist_ids.push(playlistId);
      diagnostics.push({type:'duplicate-suppressed',episodeKey,playlistId,primaryPlaylistId:existing.primary_playlist_id});
      continue;
    }
    const item={...candidate,shuffle:true,primary_playlist_id:playlistId,contributing_playlist_ids:[playlistId]};
    byEpisode.set(episodeKey,item);queue.push(item);
    diagnostics.push({type:'contribution',playlistId,episodeKey});
  }
  return {queue,diagnostics};
}

export function rotateShuffleSources(sourcePlaylistIds=[],completedPlaylistIds=[]){
  const completed=new Set(completedPlaylistIds);
  return [...sourcePlaylistIds.filter(id=>!completed.has(id)),...sourcePlaylistIds.filter(id=>completed.has(id))];
}

export function shuffleGestureDecision({dx=0,dy=0,cardWidth=0,maxDx=0,reversed=false,scrolling=false}={}){
  const threshold=Math.max(140,Number(cardWidth||0)*0.4);
  if(scrolling)return {activate:false,reason:'scrolling',threshold};
  if(reversed||dx<maxDx-24)return {activate:false,reason:'reverse-movement',threshold};
  if(Math.abs(dy)>Math.abs(dx)*0.65)return {activate:false,reason:'diagonal-or-vertical',threshold};
  if(dx<threshold)return {activate:false,reason:'below-threshold',threshold};
  return {activate:true,reason:'released-beyond-threshold',threshold};
}
