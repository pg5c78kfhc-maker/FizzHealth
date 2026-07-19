const norm=v=>String(v??'').trim().toLowerCase();

export function locationDescendants(locations=[],selected='Home'){
 const byParent=new Map();
 for(const loc of locations){const parent=loc.parent_location_id??loc.parent_id??null;if(!byParent.has(String(parent)))byParent.set(String(parent),[]);byParent.get(String(parent)).push(loc)}
 const chosen=locations.find(l=>norm(l.name)===norm(selected));
 if(!chosen||norm(selected)==='home'){
  const home=chosen||locations.find(l=>norm(l.name)==='home');
  if(!home)return new Set(['home','refrigerator','freezer','pantry','garage refrigerator','wine cellar']);
  const ids=new Set([String(home.location_id)]),names=new Set([norm(home.name)]),queue=[home];
  while(queue.length){const parent=queue.shift();for(const child of byParent.get(String(parent.location_id))||[]){if(ids.has(String(child.location_id)))continue;ids.add(String(child.location_id));names.add(norm(child.name));queue.push(child)}}
  return names;
 }
 const names=new Set([norm(chosen.name)]),queue=[chosen];
 while(queue.length){const parent=queue.shift();for(const child of byParent.get(String(parent.location_id))||[]){if(names.has(norm(child.name)))continue;names.add(norm(child.name));queue.push(child)}}
 return names;
}

export function filterPantryInventory(items=[],{search='',location='Home',locations=[]}={}){
 const allowed=locationDescendants(locations,location),needle=norm(search);
 return items.filter(item=>{
  const itemLocation=norm(item.location||item.storage_type||'Home');
  const locationMatch=norm(location)==='home'||allowed.has(itemLocation)||itemLocation.includes(norm(location));
  const searchMatch=!needle||[item.item,item.name,item.brand,item.category,item.location].some(v=>norm(v).includes(needle));
  return locationMatch&&searchMatch;
 });
}

export function pantryEmptyState({allItems=[],filteredItems=[],search='',location='Home'}={}){
 if(!allItems.length)return {title:'Pantry is empty.',action:'Add a food manually, scan a barcode, or take a photo.'};
 if(search&&filteredItems.length===0)return {title:'No foods match your search.',action:'Clear the search or try a broader term.'};
 if(filteredItems.length===0)return {title:`No foods match ${location}.`,action:'Choose Home or add an item to this location.'};
 return null;
}
