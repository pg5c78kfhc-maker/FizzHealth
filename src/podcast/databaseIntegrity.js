export const PODCAST_REFERENCE_TABLES=['podcast_episodes','podcast_playlist_items','podcast_up_next','podcast_playback','podcast_preferences','podcast_playlist_subscriptions'];
export function podcastCleanupSql(){return [
 `DELETE FROM podcast_episodes WHERE podcast_id NOT IN (SELECT podcast_id FROM podcasts)`,
 `DELETE FROM podcast_playlist_items WHERE podcast_id NOT IN (SELECT podcast_id FROM podcasts) OR episode_key NOT IN (SELECT episode_id FROM podcast_episodes)`,
 `DELETE FROM podcast_up_next WHERE podcast_id NOT IN (SELECT podcast_id FROM podcasts) OR episode_key NOT IN (SELECT episode_id FROM podcast_episodes)`,
 `DELETE FROM podcast_playback WHERE podcast_id NOT IN (SELECT podcast_id FROM podcasts)`,
 `DELETE FROM podcast_preferences WHERE podcast_id NOT IN (SELECT podcast_id FROM podcasts)`,
 `DELETE FROM podcast_playlist_subscriptions WHERE podcast_id NOT IN (SELECT podcast_id FROM podcasts)`
]}
export async function runPodcastIntegrityCleanup({query,run,settingKey='podcast_cleanup_1_4_16_28'}){
 const already=query(`SELECT setting_value FROM podcast_player_settings WHERE setting_key=? LIMIT 1`,[settingKey])[0];if(already)return {skipped:true,removed:0};
 let removed=0;for(const sql of podcastCleanupSql()){const before=query('SELECT total_changes() value')[0]?.value||0;await run(sql);const after=query('SELECT total_changes() value')[0]?.value||before;removed+=Math.max(0,after-before)}
 await run(`INSERT OR REPLACE INTO podcast_player_settings(setting_key,setting_value,updated_at) VALUES(?,?,?)`,[settingKey,JSON.stringify({removed,completedAt:new Date().toISOString()}),new Date().toISOString()]);return {skipped:false,removed}
}
