import test from 'node:test';
import assert from 'node:assert/strict';
import {rankRestaurantMenu,restaurantContext,restaurantProfileSummary} from '../src/restaurant/intelligence.js';

test('restaurant context calculates remaining daily nutrition room',()=>{
 const context=restaurantContext({totals:{calories:900,protein:80,fiber:12,saturated_fat:8},targets:{calories:{target:1700},protein:{target:150},fiber:{target:35},saturated_fat:{max:15}}});
 assert.deepEqual(context.remaining,{calories:800,protein:70,fiber:23,saturated_fat:7});
});

test('restaurant menu intelligence ranks stronger LDL-supportive choice first',()=>{
 const meals=[
  {id:1,meal_name:'Grilled fish and vegetables',calories:520,protein:45,fiber:8,saturated_fat:3,recommendation_tier:'best_choice',confidence:.9,serving_description:'1 plate',preparation:'grilled'},
  {id:2,meal_name:'Creamy cheeseburger',calories:980,protein:35,fiber:2,saturated_fat:18,recommendation_tier:'avoid_limit',confidence:.9,serving_description:'1 burger',preparation:'fried'}
 ];
 const ranked=rankRestaurantMenu({meals,totals:{calories:600,protein:50,fiber:10,saturated_fat:5},targets:{calories:{target:1700},protein:{target:150},fiber:{target:35},saturated_fat:{max:15}}});
 assert.equal(ranked[0].meal.id,1);
 assert.equal(ranked[0].rank,1);
 assert.ok(ranked[0].decision.score>ranked[1].decision.score);
});

test('restaurant profile summarizes favorites and visit history',()=>{
 const summary=restaurantProfileSummary({restaurant:{favorite:1,cuisine:'Argentinian',website:'example.com'},visits:[{visited_at:'2026-07-18T10:00:00Z'}],meals:[{meal_name:'Mahi-mahi',favorite:1},{meal_name:'Steak',favorite:0}]});
 assert.equal(summary.favorite,true);
 assert.equal(summary.cuisine,'Argentinian');
 assert.equal(summary.visitCount,1);
 assert.deepEqual(summary.favoriteMeals,['Mahi-mahi']);
});
