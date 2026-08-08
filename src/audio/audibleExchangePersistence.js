const safeKey=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'unknown';
const uniqueId=(prefix,...parts)=>`${prefix}-${parts.map(safeKey).filter(Boolean).join('-')}`;
const isBlank=value=>value==null||String(value).trim()==='';
const chooseMissing=(incoming,current)=>isBlank(current)&&!isBlank(incoming)?incoming:current;

export const AUDIBLE_EXISTING_UPDATE_SQL=`UPDATE audible_audiobooks SET title=?,display_title=?,raw_title=?,audible_product_url=?,runtime_minutes=?,runtime_display=?,description=?,description_is_truncated=?,cover_image_url=?,cover_image_source=?,series_id=?,series_position=?,in_audible_library=?,owned_in_audible=?,ownership_status=?,audible_progress_text=?,remaining_minutes=?,listening_status=?,can_listen_now=?,last_seen_at=?,last_metadata_refresh_at=? WHERE audiobook_id=?`;

export function buildExistingAudibleUpdateParams(existing,record,{seriesId=null,now}={}){
 const incomingOwned=record.ownership_status!=='not_owned';
 const inLibrary=Math.max(Number(existing.in_audible_library)||0,incomingOwned?1:0);
 const owned=Math.max(Number(existing.owned_in_audible)||0,incomingOwned?1:0);
 return [
  chooseMissing(record.title,existing.title),
  chooseMissing(record.display_title,existing.display_title),
  chooseMissing(record.raw_title,existing.raw_title),
  chooseMissing(record.audible_product_url,existing.audible_product_url),
  chooseMissing(record.runtime_minutes,existing.runtime_minutes),
  chooseMissing(record.runtime_display,existing.runtime_display),
  chooseMissing(record.description,existing.description),
  existing.description?existing.description_is_truncated:record.description_is_truncated,
  chooseMissing(record.cover_image_url,existing.cover_image_url),
  isBlank(existing.cover_image_url)&&record.cover_image_url?'chatgpt-json-exchange':existing.cover_image_source,
  chooseMissing(seriesId,existing.series_id),
  chooseMissing(record.series?.position,existing.series_position),
  inLibrary,
  owned,
  existing.ownership_status==='owned'?'owned':record.ownership_status,
  chooseMissing(record.audible_progress_text,existing.audible_progress_text),
  chooseMissing(record.remaining_minutes,existing.remaining_minutes),
  existing.listening_status==='finished'?'finished':record.listening_status,
  Math.max(Number(existing.can_listen_now)||0,Number(record.can_listen_now)||0),
  now,
  now,
  existing.audiobook_id
 ];
}

function findOrCreateSeries(tx,record,now){
 const s=record.series;if(!s?.name)return null;
 let row=s.audible_series_id?tx.query('SELECT * FROM audible_series WHERE audible_series_id=? LIMIT 1',[s.audible_series_id])[0]:null;
 if(!row)row=tx.query('SELECT * FROM audible_series WHERE LOWER(name)=LOWER(?) LIMIT 1',[s.name])[0];
 const id=row?.series_id||uniqueId('audible-series',s.audible_series_id||s.name);
 if(row){tx.run(`UPDATE audible_series SET audible_series_id=COALESCE(audible_series_id,?),audible_url=COALESCE(audible_url,?),total_known=COALESCE(total_known,?),updated_at=? WHERE series_id=?`,[s.audible_series_id,s.audible_url,s.total_known,now,id])}
 else tx.run(`INSERT INTO audible_series(series_id,audible_series_id,name,audible_url,total_known,source,created_at,updated_at,last_catalog_refresh_at) VALUES (?,?,?,?,?,?,?,?,?)`,[id,s.audible_series_id,s.name,s.audible_url,s.total_known,'ChatGPT JSON exchange',now,now,now]);
 return id;
}

function findOrCreatePerson(tx,table,idColumn,linkColumn,person,prefix,now){
 let row=idColumn&&person.audible_id?tx.query(`SELECT * FROM ${table} WHERE ${idColumn}=? LIMIT 1`,[person.audible_id])[0]:null;
 if(!row)row=tx.query(`SELECT * FROM ${table} WHERE LOWER(name)=LOWER(?) LIMIT 1`,[person.name])[0];
 const pk=table==='audible_authors'?'author_id':'narrator_id',id=row?.[pk]||uniqueId(prefix,person.audible_id||person.name);
 if(row){if(idColumn)tx.run(`UPDATE ${table} SET ${idColumn}=COALESCE(${idColumn},?),${linkColumn}=COALESCE(${linkColumn},?),updated_at=? WHERE ${pk}=?`,[person.audible_id,person.audible_url,now,id]);else tx.run(`UPDATE ${table} SET ${linkColumn}=COALESCE(${linkColumn},?),updated_at=? WHERE ${pk}=?`,[person.audible_url,now,id])}
 else {if(idColumn)tx.run(`INSERT INTO ${table}(${pk},${idColumn},name,${linkColumn},created_at,updated_at) VALUES (?,?,?,?,?,?)`,[id,person.audible_id,person.name,person.audible_url,now,now]);else tx.run(`INSERT INTO ${table}(${pk},name,${linkColumn},created_at,updated_at) VALUES (?,?,?,?,?)`,[id,person.name,person.audible_url,now,now])}
 return id;
}

export function upsertAudibleExchangeBook(tx,record,now){
 const existing=tx.query('SELECT * FROM audible_audiobooks WHERE audible_asin=? LIMIT 1',[record.audible_asin])[0]||null;
 const seriesId=findOrCreateSeries(tx,record,now);
 const bookId=existing?.audiobook_id||uniqueId('audible-book',record.audible_asin);
 if(existing){
  tx.run(AUDIBLE_EXISTING_UPDATE_SQL,buildExistingAudibleUpdateParams(existing,record,{seriesId,now}));
 }else{
  tx.run(`INSERT INTO audible_audiobooks(audiobook_id,audible_asin,title,display_title,raw_title,audible_product_url,runtime_minutes,runtime_display,description,description_is_truncated,cover_image_url,cover_image_source,series_id,series_position,in_audible_library,owned_in_audible,ownership_status,audible_progress_text,remaining_minutes,listening_status,can_listen_now,discovered_from_series,source,first_imported_at,last_seen_at,last_metadata_refresh_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[bookId,record.audible_asin,record.title,record.display_title,record.raw_title,record.audible_product_url,record.runtime_minutes,record.runtime_display,record.description,record.description_is_truncated,record.cover_image_url,record.cover_image_url?'chatgpt-json-exchange':null,seriesId,record.series?.position,1,record.ownership_status==='not_owned'?0:1,record.ownership_status,record.audible_progress_text,record.remaining_minutes,record.listening_status,record.can_listen_now,0,'ChatGPT JSON exchange',now,now,now]);
 }
 for(const [join,table,idColumn,linkColumn,prefix,people] of [['audible_audiobook_authors','audible_authors','audible_author_id','audible_url','audible-author',record.authors],['audible_audiobook_narrators','audible_narrators',null,'audible_url','audible-narrator',record.narrators]]){
  people.forEach((person,index)=>{const personId=findOrCreatePerson(tx,table,idColumn,linkColumn,person,prefix,now);const fk=table==='audible_authors'?'author_id':'narrator_id';tx.run(`INSERT OR IGNORE INTO ${join}(audiobook_id,${fk},display_order) VALUES (?,?,?)`,[bookId,personId,index])});
 }
 return {bookId,wasNew:!existing};
}
