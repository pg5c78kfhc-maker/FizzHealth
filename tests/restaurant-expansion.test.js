import test from 'node:test';
import assert from 'node:assert/strict';
import {confidenceBand,explainNutritionConfidence,buildRestaurantLearning,restaurantAnalytics,rankRestaurantMenu} from '../src/restaurant/intelligence.js';

test('nutrition confidence provides clear bands and explanations',()=>{
 assert.equal(confidenceBand(.9),'High');
 assert.equal(confidenceBand(.7),'Medium');
 assert.equal(confidenceBand(.4),'Low');
 const result=explainNutritionConfidence({confidence:.88,source:'restaurant_verified',verified_nutrients_json:'["calories","protein"]'});
 assert.equal(result.score,88); assert.equal(result.band,'High'); assert.deepEqual(result.verified,['calories','protein']);
});

test('learning engine identifies repeated meals and modifications',()=>{
 const learning=buildRestaurantLearning({meals:[
  {restaurant_meal_id:7,restaurant_modifications:'dressing on side'},
  {restaurant_meal_id:7,restaurant_modifications:'dressing on side; no cheese'},
  {restaurant_meal_id:9,restaurant_modifications:''}
 ],templates:[{id:1,favorite:1,use_count:2}],events:[]});
 assert.deepEqual(learning.favoriteMealIds[0],{id:'7',count:2});
 assert.deepEqual(learning.commonModifications[0],{name:'dressing on side',count:2});
 assert.equal(learning.reusableTemplates[0].id,1);
});

test('restaurant analytics summarizes dining and nutrition trends',()=>{
 const analytics=restaurantAnalytics({restaurants:[{restaurant_id:'r1',name:'Baires',cuisine:'Argentinian'}],visits:[{restaurant_id:'r1'},{restaurant_id:'r1'}],meals:[{restaurant_id:'r1',calories:600,protein:40,fiber:6,saturated_fat:4},{restaurant_id:'r1',calories:800,protein:50,fiber:8,saturated_fat:6}]});
 assert.equal(analytics.totalVisits,2); assert.equal(analytics.totalOrders,2);
 assert.equal(analytics.restaurants[0].averageCalories,700);
 assert.equal(analytics.restaurants[0].averageProtein,45);
 assert.deepEqual(analytics.cuisines[0],{cuisine:'Argentinian',count:4});
});

test('restaurant ranking can apply a bounded history preference boost',()=>{
 const meals=[{id:1,meal_name:'Fish',calories:500,protein:40,fiber:5,saturated_fat:3,confidence:.9},{id:2,meal_name:'Chicken',calories:500,protein:40,fiber:5,saturated_fat:3,confidence:.9}];
 const ranked=rankRestaurantMenu({meals,learning:{favoriteMealIds:[{id:'2',count:3}]}});
 assert.equal(ranked[0].meal.id,2); assert.equal(ranked[0].historyBoost,3);
});
