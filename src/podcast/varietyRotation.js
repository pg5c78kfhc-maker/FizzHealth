export function reconcileRotationOrder({storedPodcastIds=[],eligiblePodcastIds=[],masterPodcastIds=[]}={}){
  const eligible=[...new Set((eligiblePodcastIds||[]).filter(Boolean))];
  const eligibleSet=new Set(eligible);
  const master=[...new Set((masterPodcastIds||[]).filter(id=>eligibleSet.has(id)))];
  const fallback=[...master,...eligible.filter(id=>!master.includes(id))];
  const stored=[...new Set((storedPodcastIds||[]).filter(id=>eligibleSet.has(id)))];
  return [...stored,...fallback.filter(id=>!stored.includes(id))];
}

export function rotatePodcastToEnd(podcastIds=[],completedPodcastId=''){
  if(!completedPodcastId)return [...podcastIds];
  const ids=[...new Set((podcastIds||[]).filter(Boolean))];
  if(!ids.includes(completedPodcastId))return ids;
  return [...ids.filter(id=>id!==completedPodcastId),completedPodcastId];
}
