/** Canonical lifecycle helpers shared by Menu and Food Log views. */
export function isRestaurantReservation(row={}){
 return row.source_type==='reservation'||row.item_role==='reservation';
}

export function isRestaurantActual(row={}){
 return row.source_type==='restaurant'||row.restaurant_meal_id!=null||Boolean(String(row.restaurant_name||'').trim());
}

export function plannedLifecycleState(row={}){
 if(isRestaurantReservation(row))return 'reservation';
 return row.status==='planned'?'proposed':String(row.status||'unknown');
}

export function plannerCalendarHasItems(rows=[]){
 return rows.some(row=>row&&row.status==='planned');
}
