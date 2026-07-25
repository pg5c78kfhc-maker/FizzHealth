import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');

test('Nutrition replaces Eat as the subsystem and navigation label',()=>{
 assert.match(main,/label:'Nutrition'/);
 assert.match(main,/<h2>Nutrition<\/h2>/);
 assert.match(main,/<h1>Nutrition<\/h1>/);
 assert.doesNotMatch(main,/label:'Eat'/);
});

test('Nutrition landing page groups equal-sized actions into Eating and Manage cards',()=>{
 for(const title of ['Eating','Manage','Menu','The Chef','Log Once','Meals','Pantry','Restaurants','Shopping'])assert.ok(main.includes(`title:'${title}'`)||main.includes(`title="${title}"`),`${title} is missing`);
 assert.match(main,/nutrition-hub-card/);
 assert.match(css,/\.nutrition-action-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/\.nutrition-action-grid>button\{[^}]*min-height:138px/);
});

test('existing subsystem destinations are preserved while labels change',()=>{
 assert.match(main,/{id:'add',Icon:Apple,title:'Meals'/);
 assert.match(main,/{id:'pantry',Icon:Package,title:'Pantry'/);
 assert.match(main,/{id:'restaurants',Icon:UtensilsCrossed,title:'Restaurants'/);
 assert.match(main,/{id:'shopping',Icon:ShoppingCart,title:'Shopping'/);
 assert.match(main,/{id:'food-planner',Icon:CalendarDays,title:'Menu'/);
 assert.match(main,/{id:'food-recommendations',Icon:ChefHat,title:'The Chef'/);
});

test('Log Once is launched from Nutrition and removed from the Meals create menu',()=>{
 assert.match(main,/{id:'food-log-once',Icon:Plus,title:'Log Once'/);
 assert.match(main,/tab==='food-log-once'.*initialLogOnce/s);
 const createMenu=main.match(/<div className="create-menu" role="menu">([\s\S]*?)<\/div>/)?.[1]||'';
 assert.doesNotMatch(createMenu,/Log Once/);
 assert.match(createMenu,/New Ingredient/);
 assert.match(createMenu,/New Recipe/);
 assert.match(createMenu,/New Meal/);
});

test('obsolete landing controls and Upcoming Meals page are retired',()=>{
 assert.doesNotMatch(main,/food-upcoming/);
 assert.doesNotMatch(main,/function UpcomingMealsPage/);
 assert.doesNotMatch(main,/\{id:'food-upcoming'/);
 assert.doesNotMatch(main,/className="standard-page-head food-page-head"/);
});
