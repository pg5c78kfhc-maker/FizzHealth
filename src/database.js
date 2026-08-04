import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {NUTRIENT_KEYS} from './nutrition/registry.js';

const DB_KEY='fizz-health-sqlite-v1';
const STORAGE_DB='FizzHealthStorage';
const TARGET_SCHEMA_VERSION=124;
let SQL, db;

const migrations=[
  {version:1,name:'initial_schema',sql:`
    CREATE TABLE IF NOT EXISTS foods (
      food_id TEXT PRIMARY KEY, name TEXT, category TEXT,
      default_serving REAL, unit TEXT, calories REAL, protein REAL, carbs REAL,
      fiber REAL, fat REAL, saturated_fat REAL, sodium REAL, potassium REAL, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS pantry (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pantry_id TEXT, item TEXT, food_id TEXT, brand TEXT,
      on_hand TEXT, quantity REAL, unit TEXT, opened TEXT, opened_date TEXT,
      expiration TEXT, location TEXT, status TEXT, priority TEXT, category TEXT, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, eaten_at TEXT, meal_type TEXT,
      food_id TEXT, food_name TEXT, amount REAL, unit TEXT,
      calories REAL DEFAULT 0, protein REAL DEFAULT 0, carbs REAL DEFAULT 0,
      fiber REAL DEFAULT 0, fat REAL DEFAULT 0, saturated_fat REAL DEFAULT 0, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS import_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, imported_at TEXT NOT NULL, file_name TEXT,
      foods INTEGER DEFAULT 0, pantry INTEGER DEFAULT 0, recipes INTEGER DEFAULT 0, warnings INTEGER DEFAULT 0
    );
  `},
  {version:2,name:'recipes',sql:`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id TEXT, recipe_name TEXT, ingredient_name TEXT, amount REAL, unit TEXT,
      ingredient_type TEXT, ingredient_id TEXT, inventory_status TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(recipe_name);
    CREATE INDEX IF NOT EXISTS idx_recipes_id ON recipes(recipe_id);
  `},
  {version:3,name:'import_diagnostics',sql:``},
  {version:4,name:'pantry_priority_compatibility',sql:``},
  {version:5,name:'schema_reconciliation',sql:``},
  {version:6,name:'canonical_recipe_mapping',sql:``},
  {version:7,name:'food_discovery',sql:`
    CREATE TABLE IF NOT EXISTS favorite_foods (
      food_id TEXT PRIMARY KEY, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_meals_food_id ON meals(food_id);
    CREATE INDEX IF NOT EXISTS idx_meals_eaten_at ON meals(eaten_at);
  `},
  {version:8,name:'meal_event_timestamps',sql:`
    ALTER TABLE meals ADD COLUMN created_at TEXT;
    ALTER TABLE meals ADD COLUMN consumed_local_date TEXT;
    ALTER TABLE meals ADD COLUMN timezone_offset_minutes INTEGER;
    UPDATE meals SET created_at=COALESCE(created_at,eaten_at);
    UPDATE meals SET consumed_local_date=COALESCE(consumed_local_date,substr(eaten_at,1,10));
    CREATE INDEX IF NOT EXISTS idx_meals_consumed_local_date ON meals(consumed_local_date);
  `},
  {version:9,name:'nutrition_calculation_status',sql:`
    ALTER TABLE foods ADD COLUMN nutrition_known INTEGER DEFAULT 0;
    ALTER TABLE meals ADD COLUMN nutrition_known INTEGER DEFAULT 0;
    UPDATE foods SET nutrition_known=CASE WHEN calories IS NOT NULL OR protein IS NOT NULL OR carbs IS NOT NULL OR fiber IS NOT NULL OR fat IS NOT NULL THEN 1 ELSE 0 END;
    UPDATE meals SET nutrition_known=CASE WHEN calories!=0 OR protein!=0 OR carbs!=0 OR fiber!=0 OR fat!=0 THEN 1 ELSE 0 END;
  `},
  {version:10,name:'nutrition_import_mapping_fix',sql:``},
  {version:11,name:'meal_editing_and_pantry_linkage',sql:`
    ALTER TABLE meals ADD COLUMN updated_at TEXT;
    ALTER TABLE meals ADD COLUMN pantry_id TEXT;
    ALTER TABLE meals ADD COLUMN pantry_delta REAL DEFAULT 0;
    UPDATE meals SET updated_at=COALESCE(updated_at,created_at,eaten_at);
    CREATE INDEX IF NOT EXISTS idx_meals_pantry_id ON meals(pantry_id);
  `},
  {version:12,name:'package_serving_separation',sql:`
    ALTER TABLE meals ADD COLUMN pantry_opened_changed INTEGER DEFAULT 0;
  `},
  {version:13,name:'atomic_import_validation',sql:``},
  {version:14,name:'nutrition_targets_and_chef_preferences',sql:`
    CREATE TABLE IF NOT EXISTS nutrition_targets (
      nutrient TEXT PRIMARY KEY, target_value REAL NOT NULL, max_value REAL,
      unit TEXT NOT NULL, source TEXT NOT NULL, formula TEXT, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_preferences (
      preference_date TEXT PRIMARY KEY, restaurant_possible INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO settings(key,value) VALUES ('current_weight_lb','227.1');
    INSERT OR IGNORE INTO nutrition_targets(nutrient,target_value,max_value,unit,source,formula,updated_at) VALUES
      ('calories',1700,2100,'kcal','database','Fixed daily target / maximum',CURRENT_TIMESTAMP),
      ('protein',181.7,227.1,'g','database','0.8 / 1.0 g per lb',CURRENT_TIMESTAMP),
      ('carbs',68.1,102.2,'g','database','0.3 / 0.45 g per lb',CURRENT_TIMESTAMP),
      ('fat',45.4,68.1,'g','database','0.2 / 0.3 g per lb',CURRENT_TIMESTAMP),
      ('fiber',102.2,NULL,'g','database','0.45 g per lb',CURRENT_TIMESTAMP);
  `},
  {version:15,name:'history_and_shopping_foundation',sql:`
    CREATE TABLE IF NOT EXISTS target_history (
      effective_date TEXT NOT NULL, nutrient TEXT NOT NULL, target_value REAL NOT NULL,
      max_value REAL, unit TEXT NOT NULL, source TEXT, formula TEXT,
      PRIMARY KEY(effective_date,nutrient)
    );
    INSERT OR IGNORE INTO target_history(effective_date,nutrient,target_value,max_value,unit,source,formula)
      SELECT '2026-01-01',nutrient,target_value,max_value,unit,source,formula FROM nutrition_targets;
    CREATE TABLE IF NOT EXISTS pantry_consumption_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pantry_id TEXT, food_id TEXT,
      event_type TEXT NOT NULL, quantity REAL, unit TEXT, event_at TEXT NOT NULL, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS reorder_rules (
      pantry_id TEXT PRIMARY KEY, mode TEXT DEFAULT 'prediction', minimum_quantity REAL,
      minimum_unit TEXT, preferred_retailer TEXT, buffer_days INTEGER DEFAULT 3, updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS shopping_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT, retailer TEXT NOT NULL, planned_date TEXT NOT NULL,
      status TEXT DEFAULT 'planned', notes TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS shopping_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT, shopping_plan_id INTEGER, pantry_id TEXT, food_id TEXT,
      recommended_quantity REAL, unit TEXT, reason TEXT, predicted_runout_date TEXT,
      created_at TEXT NOT NULL, dismissed INTEGER DEFAULT 0
    );
  `},
  {version:16,name:'unified_historical_dashboard',sql:``},

  {version:17,name:'historical_meal_import_and_refresh',sql:`
    ALTER TABLE meals ADD COLUMN source TEXT;
    ALTER TABLE meals ADD COLUMN source_record_id TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_meals_source_record ON meals(source,source_record_id);
  `},
  {version:18,name:'planning_and_history_index',sql:`
    CREATE TABLE IF NOT EXISTS planned_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, planned_at TEXT NOT NULL, planned_local_date TEXT NOT NULL,
      meal_type TEXT, food_id TEXT, food_name TEXT, amount REAL, unit TEXT,
      calories REAL DEFAULT 0, protein REAL DEFAULT 0, carbs REAL DEFAULT 0, fiber REAL DEFAULT 0, fat REAL DEFAULT 0, saturated_fat REAL DEFAULT 0,
      notes TEXT, status TEXT DEFAULT 'planned', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_planned_meals_date ON planned_meals(planned_local_date,status);
    CREATE INDEX IF NOT EXISTS idx_meals_local_date ON meals(consumed_local_date);
  `},
  {version:19,name:'import_safety_and_history_audit',sql:`
    CREATE TABLE IF NOT EXISTS safety_backup_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, backup_key TEXT NOT NULL, reason TEXT,
      created_at TEXT NOT NULL, byte_size INTEGER DEFAULT 0, status TEXT DEFAULT 'available'
    );
    CREATE TABLE IF NOT EXISTS meal_date_index (
      meal_date TEXT PRIMARY KEY, consumed_count INTEGER DEFAULT 0, planned_count INTEGER DEFAULT 0, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_meals_eaten_at_v19 ON meals(eaten_at);
  `},
  {version:20,name:'planned_meal_lifecycle',sql:`
    ALTER TABLE planned_meals ADD COLUMN pantry_id TEXT;
    ALTER TABLE planned_meals ADD COLUMN source_type TEXT DEFAULT 'food';
    ALTER TABLE planned_meals ADD COLUMN restaurant_name TEXT;
    ALTER TABLE planned_meals ADD COLUMN consumed_at TEXT;
    CREATE INDEX IF NOT EXISTS idx_planned_status_date_v20 ON planned_meals(status,planned_local_date);
  `},
  {version:21,name:'restaurant_and_ai_exchange',sql:`
    CREATE TABLE IF NOT EXISTS restaurants (
      restaurant_id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT, status TEXT,
      best_choices TEXT, occasional_treats TEXT, avoid_limit TEXT, notes TEXT, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS restaurant_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id TEXT, restaurant_name TEXT, meal_name TEXT NOT NULL,
      category TEXT, serving_description TEXT, calories REAL, protein REAL, carbs REAL, fiber REAL, fat REAL,
      saturated_fat REAL, sodium REAL, notes TEXT, nutrition_known INTEGER DEFAULT 0,
      source TEXT DEFAULT 'manual', confidence REAL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_restaurant_meals_restaurant ON restaurant_meals(restaurant_id,meal_name);
    CREATE TABLE IF NOT EXISTS ai_exchange_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, exchange_type TEXT NOT NULL, record_key TEXT,
      direction TEXT NOT NULL, status TEXT NOT NULL, payload TEXT, created_at TEXT NOT NULL
    );
  `},
  {version:22,name:'restaurant_lifecycle_and_exchange_reliability',sql:`
    ALTER TABLE restaurants ADD COLUMN archived INTEGER DEFAULT 0;
    ALTER TABLE restaurants ADD COLUMN current_menu_version INTEGER DEFAULT 0;
    ALTER TABLE restaurants ADD COLUMN closed_at TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN menu_version INTEGER DEFAULT 1;
    ALTER TABLE restaurant_meals ADD COLUMN active INTEGER DEFAULT 1;
    ALTER TABLE restaurant_meals ADD COLUMN price REAL;
    ALTER TABLE restaurant_meals ADD COLUMN currency TEXT DEFAULT 'USD';
    ALTER TABLE restaurant_meals ADD COLUMN price_observed_date TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN meal_period TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN ingredients_json TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN preparation TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN recommendation_tier TEXT;
    ALTER TABLE planned_meals ADD COLUMN restaurant_meal_id INTEGER;
    ALTER TABLE planned_meals ADD COLUMN menu_price REAL;
    ALTER TABLE meals ADD COLUMN restaurant_name TEXT;
    ALTER TABLE meals ADD COLUMN restaurant_meal_id INTEGER;
    ALTER TABLE meals ADD COLUMN actual_cost REAL;
    CREATE INDEX IF NOT EXISTS idx_restaurant_meals_active ON restaurant_meals(restaurant_id,active,menu_version);
  `},
  {version:23,name:'daily_health_metrics',sql:`
    CREATE TABLE IF NOT EXISTS health_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_type TEXT NOT NULL,
      value_primary REAL,
      value_secondary REAL,
      unit TEXT,
      measured_at TEXT NOT NULL,
      local_date TEXT NOT NULL,
      notes TEXT,
      source TEXT DEFAULT 'manual',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_health_metrics_date ON health_metrics(local_date,metric_type,measured_at);
    CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type,measured_at);
  `},
  {version:24,name:'restaurant_favorites',sql:`
    ALTER TABLE restaurant_meals ADD COLUMN favorite INTEGER DEFAULT 0;
  `},
  {version:25,name:'personalization_and_nutrient_engine',sql:`
    CREATE TABLE IF NOT EXISTS health_profile (
      profile_id INTEGER PRIMARY KEY CHECK(profile_id=1),
      date_of_birth TEXT, biological_sex TEXT, height_cm REAL, smoking_status TEXT DEFAULT 'never',
      activity_level TEXT DEFAULT 'moderate', goal_weight_lb REAL, goal_waist_in REAL,
      health_goals_json TEXT DEFAULT '[]', updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO health_profile(profile_id,biological_sex,smoking_status,activity_level,updated_at)
      VALUES (1,'male','never','moderate',CURRENT_TIMESTAMP);
    ALTER TABLE nutrition_targets ADD COLUMN minimum_value REAL;
    ALTER TABLE nutrition_targets ADD COLUMN behavior_type TEXT DEFAULT 'goal';
    ALTER TABLE nutrition_targets ADD COLUMN source_category TEXT;
    ALTER TABLE nutrition_targets ADD COLUMN derived INTEGER DEFAULT 0;
    ALTER TABLE nutrition_targets ADD COLUMN override_target REAL;
    ALTER TABLE nutrition_targets ADD COLUMN override_max REAL;
    ALTER TABLE nutrition_targets ADD COLUMN override_minimum REAL;
    ALTER TABLE nutrition_targets ADD COLUMN recommendation_notes TEXT;
    ALTER TABLE nutrition_targets ADD COLUMN supports_derived INTEGER DEFAULT 0;
    UPDATE nutrition_targets SET behavior_type=CASE nutrient
      WHEN 'calories' THEN 'budget' WHEN 'carbs' THEN 'budget' WHEN 'fat' THEN 'budget'
      WHEN 'saturated_fat' THEN 'limit' WHEN 'sodium' THEN 'limit' WHEN 'cholesterol' THEN 'limit'
      WHEN 'added_sugar' THEN 'limit' WHEN 'alcohol' THEN 'limit' ELSE 'goal' END
      WHERE behavior_type IS NULL OR behavior_type='';
    UPDATE nutrition_targets SET supports_derived=1 WHERE nutrient IN ('calories','protein','carbs','fat','fiber');
    UPDATE nutrition_targets SET derived=1 WHERE nutrient IN ('protein','carbs','fat','fiber') AND derived=0;
    INSERT OR IGNORE INTO nutrition_targets(nutrient,target_value,max_value,unit,source,formula,updated_at,minimum_value,behavior_type,source_category,derived,supports_derived,recommendation_notes) VALUES
      ('saturated_fat',13,20,'g','AHA / personalized LDL support','Conservative LDL-support target',CURRENT_TIMESTAMP,0,'limit','clinical',0,0,'Keep intake below target when possible.'),
      ('sodium',2300,NULL,'mg','USDA Dietary Guidelines','Daily limit',CURRENT_TIMESTAMP,0,'limit','USDA/DRI',0,0,'General adult daily limit.'),
      ('cholesterol',300,NULL,'mg','App default','Daily limit',CURRENT_TIMESTAMP,0,'limit','reference',0,0,'Editable reference limit.'),
      ('total_sugar',50,NULL,'g','App default','Monitoring reference',CURRENT_TIMESTAMP,0,'budget','reference',0,0,'Total sugar includes naturally occurring sugar.'),
      ('added_sugar',25,36,'g','AHA','Conservative daily target / upper reference',CURRENT_TIMESTAMP,0,'limit','clinical',0,0,'Personalized conservative default.'),
      ('potassium',3400,NULL,'mg','USDA/DRI','AI for adult men',CURRENT_TIMESTAMP,NULL,'goal','USDA/DRI',0,0,'Age- and sex-aware default.'),
      ('calcium',1000,2500,'mg','USDA/DRI','RDA / UL for adult men 51-70',CURRENT_TIMESTAMP,NULL,'goal','USDA/DRI',0,0,'Profile-aware default.'),
      ('iron',8,45,'mg','USDA/DRI','RDA / UL for adult men',CURRENT_TIMESTAMP,NULL,'goal','USDA/DRI',0,0,'Profile-aware default.'),
      ('vitamin_d',15,100,'mcg','USDA/DRI','RDA / UL for adults 51-70',CURRENT_TIMESTAMP,NULL,'goal','USDA/DRI',0,0,'Profile-aware default.'),
      ('vitamin_c',90,2000,'mg','USDA/DRI','RDA / UL for nonsmoking adult men',CURRENT_TIMESTAMP,NULL,'goal','USDA/DRI',0,0,'Smoking status can change the recommendation.'),
      ('omega_3',1.6,NULL,'g','USDA/DRI','AI for adult men',CURRENT_TIMESTAMP,NULL,'goal','USDA/DRI',0,0,'Alpha-linolenic acid reference.'),
      ('monounsaturated_fat',20,NULL,'g','App default','Supportive fat-quality goal',CURRENT_TIMESTAMP,NULL,'goal','personalized',0,0,'Editable supportive goal.'),
      ('polyunsaturated_fat',20,NULL,'g','App default','Supportive fat-quality goal',CURRENT_TIMESTAMP,NULL,'goal','personalized',0,0,'Editable supportive goal.'),
      ('alcohol',0,28,'g','Personalized','Prefer zero; caution above two standard drinks',CURRENT_TIMESTAMP,0,'limit','personalized',0,0,'Alcohol is always displayed as a limit nutrient.'),
      ('caffeine',300,400,'mg','FDA reference','Preferred target / general adult upper reference',CURRENT_TIMESTAMP,0,'budget','reference',0,0,'Editable personal tolerance.'),
      ('net_carbs',68.1,102.2,'g','Derived','Carbohydrates minus fiber',CURRENT_TIMESTAMP,0,'budget','derived',1,1,'Derived from carbohydrate and fiber intake.');
    ALTER TABLE foods ADD COLUMN total_sugar REAL;
    ALTER TABLE foods ADD COLUMN added_sugar REAL;
    ALTER TABLE foods ADD COLUMN cholesterol REAL;
    ALTER TABLE foods ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE foods ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE foods ADD COLUMN omega_3 REAL;
    ALTER TABLE foods ADD COLUMN calcium REAL;
    ALTER TABLE foods ADD COLUMN iron REAL;
    ALTER TABLE foods ADD COLUMN vitamin_d REAL;
    ALTER TABLE foods ADD COLUMN vitamin_c REAL;
    ALTER TABLE foods ADD COLUMN alcohol REAL;
    ALTER TABLE foods ADD COLUMN caffeine REAL;
    ALTER TABLE meals ADD COLUMN sodium REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN potassium REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN total_sugar REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN added_sugar REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN cholesterol REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN monounsaturated_fat REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN polyunsaturated_fat REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN omega_3 REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN calcium REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN iron REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN vitamin_d REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN vitamin_c REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN alcohol REAL DEFAULT 0;
    ALTER TABLE meals ADD COLUMN caffeine REAL DEFAULT 0;
    CREATE TABLE IF NOT EXISTS maintenance_estimates (
      estimate_date TEXT PRIMARY KEY, estimated_calories REAL, lower_bound REAL, upper_bound REAL,
      confidence REAL, observation_days INTEGER, method TEXT, inputs_json TEXT, updated_at TEXT NOT NULL
    );
  `},
  {version:26,name:'epic5_pantry_intelligence',sql:`
    ALTER TABLE pantry ADD COLUMN remaining_servings REAL;
    ALTER TABLE pantry ADD COLUMN serving_size REAL;
    ALTER TABLE pantry ADD COLUMN best_by TEXT;
    ALTER TABLE pantry ADD COLUMN thaw_date TEXT;
    ALTER TABLE pantry ADD COLUMN thaw_life_days REAL DEFAULT 3;
    ALTER TABLE pantry ADD COLUMN verified_at TEXT;
    ALTER TABLE pantry ADD COLUMN purchase_date TEXT;
    ALTER TABLE pantry ADD COLUMN confidence_score REAL DEFAULT 50;
    ALTER TABLE pantry ADD COLUMN quantity_accuracy TEXT DEFAULT 'estimated';
    ALTER TABLE pantry ADD COLUMN average_daily_servings REAL;
    CREATE INDEX IF NOT EXISTS idx_pantry_expiration ON pantry(expiration);
    CREATE INDEX IF NOT EXISTS idx_pantry_on_hand ON pantry(on_hand);
    CREATE TABLE IF NOT EXISTS pantry_verification_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, pantry_id TEXT NOT NULL,
      event_type TEXT NOT NULL, quantity REAL, unit TEXT, confidence_delta REAL,
      event_at TEXT NOT NULL, source TEXT, notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_pantry_verification_item ON pantry_verification_events(pantry_id,event_at);
  `},
  {version:27,name:'epic6_health_intelligence',sql:`
    CREATE TABLE IF NOT EXISTS health_goals (
      goal_id TEXT PRIMARY KEY, goal_type TEXT NOT NULL, target_value REAL, unit TEXT,
      direction TEXT DEFAULT 'down', target_date TEXT, priority REAL DEFAULT 50,
      active INTEGER DEFAULT 1, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lab_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT, biomarker TEXT NOT NULL, value REAL,
      unit TEXT, reference_low REAL, reference_high REAL, collected_at TEXT NOT NULL,
      source TEXT DEFAULT 'manual', notes TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS health_intelligence_snapshots (
      snapshot_date TEXT PRIMARY KEY, overall_score REAL, domains_json TEXT,
      top_action_json TEXT, warnings_json TEXT, forecast_json TEXT,
      model_version TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_lab_results_biomarker ON lab_results(biomarker,collected_at);
    CREATE INDEX IF NOT EXISTS idx_health_goals_active ON health_goals(active,goal_type);
  `},
  {version:28,name:'hotfix_safe_archiving',sql:`
    ALTER TABLE foods ADD COLUMN archived INTEGER DEFAULT 0;
    ALTER TABLE foods ADD COLUMN archived_at TEXT;
    ALTER TABLE recipes ADD COLUMN archived INTEGER DEFAULT 0;
    ALTER TABLE recipes ADD COLUMN archived_at TEXT;
    CREATE INDEX IF NOT EXISTS idx_foods_archived ON foods(archived,name);
    CREATE INDEX IF NOT EXISTS idx_recipes_archived ON recipes(archived,recipe_name);
  `},
  {version:29,name:'restaurant_intelligence_core',sql:`
    ALTER TABLE restaurants ADD COLUMN cuisine TEXT;
    ALTER TABLE restaurants ADD COLUMN favorite INTEGER DEFAULT 0;
    ALTER TABLE restaurants ADD COLUMN website TEXT;
    ALTER TABLE restaurants ADD COLUMN phone TEXT;
    ALTER TABLE restaurants ADD COLUMN address TEXT;
    ALTER TABLE restaurants ADD COLUMN price_level TEXT;
    CREATE TABLE IF NOT EXISTS restaurant_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id TEXT NOT NULL, visited_at TEXT NOT NULL,
      occasion TEXT, notes TEXT, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_restaurant_visits_restaurant ON restaurant_visits(restaurant_id,visited_at DESC);
    CREATE TABLE IF NOT EXISTS cuisine_preferences (
      cuisine TEXT PRIMARY KEY, preference INTEGER DEFAULT 0, notes TEXT, updated_at TEXT NOT NULL
    );
  `},
  {version:30,name:'restaurant_intelligence_expansion',sql:`
    ALTER TABLE meals ADD COLUMN restaurant_modifications TEXT;
    ALTER TABLE meals ADD COLUMN nutrition_confidence REAL;
    ALTER TABLE restaurant_meals ADD COLUMN confidence_basis TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN verified_nutrients_json TEXT;
    CREATE TABLE IF NOT EXISTS restaurant_meal_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id TEXT NOT NULL, restaurant_meal_id INTEGER,
      template_name TEXT NOT NULL, amount REAL DEFAULT 1, unit TEXT DEFAULT 'serving',
      modifications_json TEXT, favorite INTEGER DEFAULT 0, use_count INTEGER DEFAULT 0,
      last_used_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_restaurant_templates_restaurant ON restaurant_meal_templates(restaurant_id,favorite DESC,last_used_at DESC);
    CREATE TABLE IF NOT EXISTS restaurant_learning_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id TEXT NOT NULL, restaurant_meal_id INTEGER,
      event_type TEXT NOT NULL, event_value TEXT, occurred_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_restaurant_learning_events ON restaurant_learning_events(restaurant_id,event_type,occurred_at DESC);
  `},
  {version:31,name:'decision_intelligence_enhancements',sql:`
    CREATE TABLE IF NOT EXISTS decision_intelligence_snapshots (
      snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT, local_date TEXT NOT NULL, generated_at TEXT NOT NULL,
      prediction_json TEXT NOT NULL, queue_json TEXT NOT NULL, forecast_json TEXT,
      debt_credit_json TEXT, goal_probabilities_json TEXT, model_version TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_decision_intelligence_date ON decision_intelligence_snapshots(local_date,generated_at DESC);
    CREATE TABLE IF NOT EXISTS decision_simulations (
      simulation_id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, scenario_type TEXT NOT NULL,
      scenario_label TEXT, inputs_json TEXT NOT NULL, result_json TEXT NOT NULL, applied INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_decision_simulations_created ON decision_simulations(created_at DESC);
  `},
  {version:32,name:'pantry_intelligence_2',sql:`
    ALTER TABLE pantry ADD COLUMN purchase_date TEXT;
    ALTER TABLE pantry ADD COLUMN verified_at TEXT;
    ALTER TABLE pantry ADD COLUMN storage_type TEXT;
    ALTER TABLE pantry ADD COLUMN manufacturer_shelf_life_days REAL;
    ALTER TABLE pantry ADD COLUMN opened_shelf_life_days REAL;
    ALTER TABLE pantry ADD COLUMN freshness_observation TEXT;
    ALTER TABLE pantry ADD COLUMN purchase_price REAL;
    ALTER TABLE pantry ADD COLUMN retailer TEXT;
    ALTER TABLE pantry ADD COLUMN original_servings REAL;
    ALTER TABLE pantry ADD COLUMN quantity_accuracy TEXT;
    CREATE TABLE IF NOT EXISTS pantry_locations (location_id TEXT PRIMARY KEY,name TEXT NOT NULL,location_type TEXT,active INTEGER DEFAULT 1,is_current INTEGER DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS pantry_events (event_id INTEGER PRIMARY KEY AUTOINCREMENT,pantry_id TEXT NOT NULL,event_type TEXT NOT NULL,quantity REAL,unit TEXT,location_from TEXT,location_to TEXT,notes TEXT,event_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_pantry_events_item ON pantry_events(pantry_id,event_at DESC);
    CREATE TABLE IF NOT EXISTS pantry_purchases (purchase_id INTEGER PRIMARY KEY AUTOINCREMENT,pantry_id TEXT,food_id TEXT,item_name TEXT NOT NULL,retailer TEXT,quantity REAL,unit TEXT,total_cost REAL,purchased_at TEXT NOT NULL,notes TEXT);
    CREATE INDEX IF NOT EXISTS idx_pantry_purchases_item ON pantry_purchases(food_id,pantry_id,purchased_at DESC);
    CREATE TABLE IF NOT EXISTS pantry_intelligence_snapshots (snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,generated_at TEXT NOT NULL,current_location TEXT,health_score REAL,recommendations_json TEXT,waste_json TEXT,restock_json TEXT,shopping_json TEXT,model_version TEXT NOT NULL);
    INSERT OR IGNORE INTO pantry_locations(location_id,name,location_type,active,is_current,created_at,updated_at) VALUES ('home','Home','home',1,1,datetime('now'),datetime('now')),('refrigerator','Refrigerator','refrigerator',1,0,datetime('now'),datetime('now')),('freezer','Freezer','freezer',1,0,datetime('now'),datetime('now'));
  `},
  {version:33,name:'meal_planning_2',sql:`
    ALTER TABLE planned_meals ADD COLUMN lock_state TEXT DEFAULT 'flexible';
    ALTER TABLE planned_meals ADD COLUMN plan_id TEXT;
    ALTER TABLE planned_meals ADD COLUMN batch_group TEXT;
    ALTER TABLE planned_meals ADD COLUMN adaptation_reason TEXT;
    CREATE TABLE IF NOT EXISTS meal_plans (plan_id TEXT PRIMARY KEY,name TEXT NOT NULL,horizon_days INTEGER NOT NULL,status TEXT DEFAULT 'draft',optimization_score REAL,generated_at TEXT NOT NULL,committed_at TEXT,settings_json TEXT,forecast_json TEXT,shopping_json TEXT);
    CREATE TABLE IF NOT EXISTS meal_plan_events (event_id INTEGER PRIMARY KEY AUTOINCREMENT,plan_id TEXT,event_type TEXT NOT NULL,event_date TEXT,details_json TEXT,created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_meal_plan_events_plan ON meal_plan_events(plan_id,created_at DESC);
  `}
,  {version:34,name:'restaurant_intelligence_2_ai_capture',sql:`
    CREATE TABLE IF NOT EXISTS restaurant_capture_sessions (capture_id TEXT PRIMARY KEY,restaurant_id TEXT,capture_type TEXT NOT NULL,status TEXT DEFAULT 'review_required',source_uri TEXT,raw_text TEXT,result_json TEXT,confidence REAL,provenance TEXT,created_at TEXT NOT NULL,confirmed_at TEXT);
    CREATE TABLE IF NOT EXISTS restaurant_capture_items (id INTEGER PRIMARY KEY AUTOINCREMENT,capture_id TEXT,item_type TEXT,name TEXT,description TEXT,price REAL,portion_g REAL,confidence REAL,nutrition_json TEXT,provenance TEXT,status TEXT DEFAULT 'candidate',created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS restaurant_corrections (id INTEGER PRIMARY KEY AUTOINCREMENT,restaurant_id TEXT,restaurant_meal_id INTEGER,capture_id TEXT,field_name TEXT,original_value TEXT,corrected_value TEXT,modification TEXT,portion_label TEXT,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS restaurant_receipts (receipt_id TEXT PRIMARY KEY,restaurant_id TEXT,ordered_at TEXT,total REAL,items_json TEXT,reconciliation_json TEXT,source TEXT,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS restaurant_memory (restaurant_id TEXT PRIMARY KEY,memory_json TEXT,updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_capture_restaurant ON restaurant_capture_sessions(restaurant_id,created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_capture_items_session ON restaurant_capture_items(capture_id,status);
  `}

,  {version:35,name:'health_intelligence_2',sql:`
    CREATE TABLE IF NOT EXISTS health_interventions (
      intervention_id TEXT PRIMARY KEY,name TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT,
      category TEXT,outcomes_json TEXT,status TEXT DEFAULT 'active',notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS preventive_health_items (
      item_id TEXT PRIMARY KEY,item_type TEXT NOT NULL,name TEXT NOT NULL,due_date TEXT,completed_at TEXT,
      recurrence_months INTEGER,provider TEXT,notes TEXT,status TEXT DEFAULT 'scheduled',created_at TEXT NOT NULL,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS health_event_timeline (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,event_type TEXT NOT NULL,event_at TEXT NOT NULL,title TEXT NOT NULL,
      details_json TEXT,source_table TEXT,source_id TEXT,created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS health_insight_snapshots (
      snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,generated_at TEXT NOT NULL,overview_json TEXT,biomarkers_json TEXT,
      correlations_json TEXT,goals_json TEXT,coach_json TEXT,model_version TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_health_interventions_date ON health_interventions(start_date,status);
    CREATE INDEX IF NOT EXISTS idx_preventive_due ON preventive_health_items(due_date,status);
    CREATE INDEX IF NOT EXISTS idx_health_event_time ON health_event_timeline(event_at DESC);
  `}

,  {version:36,name:'workflow_experience_2',sql:`
    CREATE TABLE IF NOT EXISTS workflow_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,event_type TEXT NOT NULL,intent_type TEXT,input_text TEXT,
      status TEXT DEFAULT 'pending',details_json TEXT,created_at TEXT NOT NULL,resolved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS navigation_usage (
      destination TEXT PRIMARY KEY,use_count INTEGER DEFAULT 0,last_used_at TEXT,score REAL DEFAULT 0,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_queue (
      notification_id TEXT PRIMARY KEY,notification_type TEXT NOT NULL,title TEXT NOT NULL,body TEXT,
      priority REAL DEFAULT 50,action_json TEXT,status TEXT DEFAULT 'pending',scheduled_at TEXT,created_at TEXT NOT NULL,resolved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS offline_write_queue (
      queue_id TEXT PRIMARY KEY,operation_type TEXT NOT NULL,payload_json TEXT NOT NULL,status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,created_at TEXT NOT NULL,last_attempt_at TEXT,resolved_at TEXT,error_message TEXT
    );
    CREATE TABLE IF NOT EXISTS experience_preferences (
      preference_key TEXT PRIMARY KEY,preference_value TEXT,confidence REAL DEFAULT 50,source TEXT,updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_workflow_status ON workflow_events(status,created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_status ON notification_queue(status,priority DESC);
    CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_write_queue(status,created_at);
  `}

,  {version:37,name:'personal_intelligence',sql:`
    CREATE TABLE IF NOT EXISTS personal_profile (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, confidence REAL DEFAULT 0, source TEXT, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS preference_learning_events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, subject TEXT, outcome TEXT, context_json TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS personal_preferences (id INTEGER PRIMARY KEY AUTOINCREMENT, domain TEXT, subject TEXT NOT NULL, score REAL DEFAULT 50, confidence REAL DEFAULT 0, provenance TEXT, active INTEGER DEFAULT 1, updated_at TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_preference_subject ON personal_preferences(domain,subject);
    CREATE TABLE IF NOT EXISTS behavior_patterns (id INTEGER PRIMARY KEY AUTOINCREMENT, pattern_type TEXT NOT NULL, pattern_key TEXT, strength REAL, evidence_json TEXT, first_observed_at TEXT, last_observed_at TEXT, active INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS adherence_predictions (id INTEGER PRIMARY KEY AUTOINCREMENT, recommendation_type TEXT, recommendation_id TEXT, probability REAL, confidence REAL, factors_json TEXT, predicted_at TEXT NOT NULL, outcome TEXT, resolved_at TEXT);
    CREATE TABLE IF NOT EXISTS personal_strategies (id INTEGER PRIMARY KEY AUTOINCREMENT, strategy_key TEXT NOT NULL, title TEXT, score REAL, rationale TEXT, status TEXT DEFAULT 'active', selected_at TEXT NOT NULL, ended_at TEXT);
    CREATE TABLE IF NOT EXISTS personal_health_memory (id INTEGER PRIMARY KEY AUTOINCREMENT, memory_type TEXT NOT NULL, title TEXT NOT NULL, summary TEXT, evidence_json TEXT, outcome_json TEXT, occurred_at TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_personal_memory_date ON personal_health_memory(occurred_at);
    CREATE TABLE IF NOT EXISTS personalization_model_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, version INTEGER NOT NULL, model_json TEXT NOT NULL, reason TEXT, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS personalization_governance_events (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, target_type TEXT, target_id TEXT, previous_json TEXT, next_json TEXT, created_at TEXT NOT NULL);
  `}


,  {version:38,name:'universal_photo_capture',sql:`
    CREATE TABLE IF NOT EXISTS universal_photo_captures (
      capture_id TEXT PRIMARY KEY,source_type TEXT NOT NULL,file_name TEXT,classification TEXT,
      status TEXT DEFAULT 'review_required',request_json TEXT,response_json TEXT,confidence REAL,
      created_at TEXT NOT NULL,confirmed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_universal_photo_status ON universal_photo_captures(status,created_at DESC);
  `}

,  {version:39,name:'pantry_stabilization_workflow_refinement',sql:`
    ALTER TABLE pantry_locations ADD COLUMN parent_location_id TEXT;
    ALTER TABLE pantry_locations ADD COLUMN location_type TEXT DEFAULT 'storage';
    ALTER TABLE pantry_locations ADD COLUMN sort_order INTEGER DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_pantry_locations_parent ON pantry_locations(parent_location_id,active);
    CREATE TABLE IF NOT EXISTS universal_photo_capture_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,capture_id TEXT NOT NULL,file_name TEXT,source_type TEXT,
      mime_type TEXT,sequence_number INTEGER DEFAULT 0,created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_capture_images_capture ON universal_photo_capture_images(capture_id,sequence_number);
    INSERT OR IGNORE INTO pantry_locations(location_id,name,active,is_current,created_at,updated_at,parent_location_id,location_type,sort_order)
      VALUES ('home','Home',1,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL,'root',0);
    INSERT OR IGNORE INTO pantry_locations(location_id,name,active,is_current,created_at,updated_at,parent_location_id,location_type,sort_order)
      VALUES ('refrigerator','Refrigerator',1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'home','appliance',10);
    INSERT OR IGNORE INTO pantry_locations(location_id,name,active,is_current,created_at,updated_at,parent_location_id,location_type,sort_order)
      VALUES ('freezer','Freezer',1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'home','appliance',20);
    INSERT OR IGNORE INTO pantry_locations(location_id,name,active,is_current,created_at,updated_at,parent_location_id,location_type,sort_order)
      VALUES ('pantry','Pantry',1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'home','storage',30);
  `}

,  {version:40,name:'fh1220_legacy_health_import',sql:`
    ALTER TABLE health_metrics ADD COLUMN source_record_id TEXT;
    ALTER TABLE lab_results ADD COLUMN source_record_id TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_health_metrics_source_record ON health_metrics(source,source_record_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_results_source_record ON lab_results(source,source_record_id);
    CREATE TABLE IF NOT EXISTS workout_sessions (
      session_id TEXT PRIMARY KEY,local_date TEXT NOT NULL,workout TEXT,program TEXT,duration_minutes REAL,
      location TEXT,source TEXT,notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_sets (
      set_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,exercise TEXT NOT NULL,set_number INTEGER,load_lb REAL,
      reps REAL,rir REAL,tempo TEXT,notes TEXT,source TEXT,created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(local_date);
    CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(session_id,set_number);
    CREATE TABLE IF NOT EXISTS sleep_daily (
      sleep_id TEXT PRIMARY KEY,sleep_date TEXT NOT NULL,bedtime TEXT,wake_time TEXT,time_in_bed_minutes REAL,
      time_asleep_minutes REAL,awake_minutes REAL,rem_minutes REAL,core_minutes REAL,deep_minutes REAL,
      sleep_efficiency REAL,sleep_score REAL,wake_ups REAL,source TEXT,confidence TEXT,notes TEXT,
      created_at TEXT NOT NULL,updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sleep_daily_date ON sleep_daily(sleep_date);
    CREATE TABLE IF NOT EXISTS health_context_entries (
      context_id TEXT PRIMARY KEY,category TEXT NOT NULL,context_key TEXT NOT NULL,context_value TEXT,
      notes TEXT,source TEXT,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workbook_import_coverage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,imported_at TEXT NOT NULL,file_name TEXT NOT NULL,sheet_name TEXT NOT NULL,
      status TEXT NOT NULL,source_rows INTEGER DEFAULT 0,imported_rows INTEGER DEFAULT 0,skipped_rows INTEGER DEFAULT 0,
      destination TEXT,details TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_workbook_coverage_import ON workbook_import_coverage(imported_at,sheet_name);
  `}


,  {version:41,name:'nutrition_trust_and_planner_corrections',sql:`
    ALTER TABLE planned_meals ADD COLUMN sodium REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN potassium REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN total_sugar REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN added_sugar REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN cholesterol REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN monounsaturated_fat REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN polyunsaturated_fat REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN omega_3 REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN calcium REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN iron REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN vitamin_d REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN vitamin_c REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN alcohol REAL DEFAULT 0;
    ALTER TABLE planned_meals ADD COLUMN caffeine REAL DEFAULT 0;
  `}

,  {version:42,name:'complete_nutrient_contract_and_provenance',sql:`
    ALTER TABLE foods ADD COLUMN trans_fat REAL;
    ALTER TABLE foods ADD COLUMN nutrition_source TEXT;
    ALTER TABLE foods ADD COLUMN nutrition_confidence REAL;
    ALTER TABLE foods ADD COLUMN nutrition_completeness_json TEXT;
    ALTER TABLE foods ADD COLUMN updated_at TEXT;
    ALTER TABLE meals ADD COLUMN trans_fat REAL;
    ALTER TABLE meals ADD COLUMN nutrition_source TEXT;
    ALTER TABLE meals ADD COLUMN nutrition_completeness_json TEXT;
    ALTER TABLE planned_meals ADD COLUMN trans_fat REAL;
    ALTER TABLE planned_meals ADD COLUMN nutrition_source TEXT;
    ALTER TABLE planned_meals ADD COLUMN nutrition_confidence REAL;
    ALTER TABLE planned_meals ADD COLUMN nutrition_completeness_json TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN cholesterol REAL;
    ALTER TABLE restaurant_meals ADD COLUMN trans_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN total_sugar REAL;
    ALTER TABLE restaurant_meals ADD COLUMN added_sugar REAL;
    ALTER TABLE restaurant_meals ADD COLUMN potassium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN calcium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN iron REAL;
    ALTER TABLE restaurant_meals ADD COLUMN magnesium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN vitamin_d REAL;
    ALTER TABLE restaurant_meals ADD COLUMN vitamin_c REAL;
    ALTER TABLE restaurant_meals ADD COLUMN omega_3 REAL;
    ALTER TABLE restaurant_meals ADD COLUMN alcohol REAL;
    ALTER TABLE restaurant_meals ADD COLUMN caffeine REAL;
    ALTER TABLE restaurant_meals ADD COLUMN nutrition_completeness_json TEXT;
  `}


,  {version:43,name:'nutrient_integrity_completion_and_release_metadata',sql:`
    CREATE TABLE IF NOT EXISTS release_metadata (
      version TEXT PRIMARY KEY, release_date TEXT NOT NULL, build_id TEXT,
      schema_version INTEGER NOT NULL, title TEXT, created_at TEXT NOT NULL
    );
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.10.19','2026-07-20','141019',43,'Release Metadata, Home Hierarchy, and Keyboard Editor Correction',CURRENT_TIMESTAMP);
  `}

,  {version:44,name:'universal_food_enrichment_exchange',sql:`
    ALTER TABLE foods ADD COLUMN brand TEXT;
    ALTER TABLE foods ADD COLUMN barcode TEXT;
    ALTER TABLE foods ADD COLUMN serving_description TEXT;
    ALTER TABLE foods ADD COLUMN servings_per_container REAL;
    ALTER TABLE foods ADD COLUMN ingredients TEXT;
    ALTER TABLE foods ADD COLUMN allergens TEXT;
    ALTER TABLE foods ADD COLUMN package_quantity TEXT;
    ALTER TABLE foods ADD COLUMN expiration_date TEXT;
    ALTER TABLE foods ADD COLUMN expiration_date_type TEXT;
    ALTER TABLE foods ADD COLUMN preparation_instructions TEXT;
    CREATE TABLE IF NOT EXISTS ai_exchange_sessions (
      request_id TEXT PRIMARY KEY,operation TEXT NOT NULL,target_type TEXT NOT NULL,target_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'prepared',request_json TEXT NOT NULL,response_json TEXT,approved_payload_json TEXT,
      confidence REAL,identity_match INTEGER,evidence_notes_json TEXT,created_at TEXT NOT NULL,reviewed_at TEXT,applied_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_ai_exchange_target ON ai_exchange_sessions(target_type,target_id,created_at DESC);
    CREATE TABLE IF NOT EXISTS ai_exchange_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,request_id TEXT NOT NULL,field_key TEXT NOT NULL,old_value TEXT,new_value TEXT,
      applied INTEGER DEFAULT 0,created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ai_exchange_changes_request ON ai_exchange_changes(request_id,id);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.10.22','2026-07-21','141022',44,'Unified AI Food Exchange & Restaurant Stability',CURRENT_TIMESTAMP);
  `}

,  {version:45,name:'recipe_favorites_and_pantry_detail',sql:`
    CREATE TABLE IF NOT EXISTS favorite_recipes (
      recipe_id TEXT PRIMARY KEY, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_favorite_recipes_created ON favorite_recipes(created_at DESC);
  `}

,  {version:46,name:'meal_intelligence_foundation',sql:`
    CREATE TABLE IF NOT EXISTS meal_definitions (
      meal_id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Any', icon TEXT DEFAULT 'utensils',
      notes TEXT, favorite INTEGER DEFAULT 0, archived INTEGER DEFAULT 0,
      calories REAL DEFAULT 0, protein REAL DEFAULT 0, carbs REAL DEFAULT 0, fiber REAL DEFAULT 0, fat REAL DEFAULT 0, saturated_fat REAL DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meal_components (
      id INTEGER PRIMARY KEY AUTOINCREMENT, meal_id TEXT NOT NULL, component_type TEXT NOT NULL,
      component_id TEXT, component_name TEXT NOT NULL, amount REAL NOT NULL DEFAULT 1, unit TEXT DEFAULT 'serving', optional INTEGER DEFAULT 0,
      calories REAL DEFAULT 0, protein REAL DEFAULT 0, carbs REAL DEFAULT 0, fiber REAL DEFAULT 0, fat REAL DEFAULT 0, saturated_fat REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_meal_definitions_category ON meal_definitions(category,archived,title);
    CREATE INDEX IF NOT EXISTS idx_meal_components_meal ON meal_components(meal_id,sort_order,id);
    ALTER TABLE meals ADD COLUMN source_type TEXT DEFAULT 'food';
    ALTER TABLE meals ADD COLUMN meal_definition_id TEXT;
    ALTER TABLE planned_meals ADD COLUMN meal_definition_id TEXT;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.2','2026-07-23','141120',46,'Daily Brief & Meal Intelligence — First Pass',CURRENT_TIMESTAMP);
  `}


,  {version:47,name:'navigation_workflow_and_release_integrity',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.4','2026-07-23','141140',48,'Critical Action Wiring Repair','2026-07-23T13:15:00.000Z');
  `}

,  {version:48,name:'pantry_package_structure_and_editor_stabilization',sql:`
    ALTER TABLE pantry ADD COLUMN package_count REAL;
    ALTER TABLE pantry ADD COLUMN package_type TEXT;
    ALTER TABLE pantry ADD COLUMN container_size REAL;
    ALTER TABLE pantry ADD COLUMN container_unit TEXT;
    ALTER TABLE pantry ADD COLUMN unopened_packages REAL;
    ALTER TABLE pantry ADD COLUMN partial_package_quantity REAL;
    ALTER TABLE pantry ADD COLUMN freshness_status TEXT;
    ALTER TABLE pantry ADD COLUMN source_recipe_id TEXT;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.11','2026-07-23','141210',48,'Pantry Structure & Editing Stabilization','2026-07-23T15:45:00.000Z');
  `}

,  {version:49,name:'pantry_package_persistence_repair',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.12','2026-07-23','141220',49,'Pantry Package Persistence Repair','2026-07-23T16:20:00.000Z');
  `}

,  {version:50,name:'json_exchange_workflow_repair',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.13','2026-07-23','141230',50,'JSON Exchange Workflow Repair','2026-07-23T16:30:00.000Z');
  `}

,  {version:51,name:'meal_planning_calendar_prototype',sql:`
    ALTER TABLE planned_meals ADD COLUMN item_role TEXT DEFAULT 'main';
    ALTER TABLE planned_meals ADD COLUMN reserved_calories REAL DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_planned_meal_definition_date ON planned_meals(meal_definition_id,planned_local_date,status);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.14','2026-07-23','141240',51,'Meal Planning Calendar Prototype','2026-07-23T21:40:00.000Z');
  `}

,  {version:52,name:'restaurant_aware_meal_planning',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.17','2026-07-23','141317',52,'Restaurant Intelligence Completion','2026-07-23T23:13:17.000Z');
  `}

,  {version:53,name:'restaurant_meal_classification_and_complete_rankings',sql:`
    ALTER TABLE restaurant_meals ADD COLUMN primary_category TEXT;
    ALTER TABLE restaurant_meals ADD COLUMN eligible_categories_json TEXT;
    CREATE INDEX IF NOT EXISTS idx_restaurant_meals_primary_category ON restaurant_meals(restaurant_id,primary_category,active);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.19','2026-07-23','141319',53,'Restaurant Intelligence UX & Decision Dashboard','2026-07-24T01:30:00.000Z');
  `}

,  {version:54,name:'restaurant_dashboard_final_and_nutrition_header',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.20','2026-07-24','141320',54,'Restaurant Decision Dashboard Polish','2026-07-24T15:30:00.000Z');
  `}

,  {version:55,name:'classified_meal_promotion',sql:`
    ALTER TABLE foods ADD COLUMN consumption_role TEXT DEFAULT 'both';
    UPDATE foods SET consumption_role='both' WHERE consumption_role IS NULL OR TRIM(consumption_role)='';
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.31','2026-07-24','141131',55,'Classified Meal Promotion Activation','2026-07-24T23:15:00-04:00');
  `}

,  {version:56,name:'meal_promotion_uniqueness_and_deletion',sql:`
    ALTER TABLE meal_definitions ADD COLUMN source_type TEXT;
    ALTER TABLE meal_definitions ADD COLUMN source_id TEXT;

    -- Backfill only one canonical promoted Meal for each Food or Recipe source.
    -- Existing duplicate Meal records are preserved but deliberately left unlinked.
    UPDATE meal_definitions AS target
      SET source_type=(SELECT component_type FROM meal_components WHERE meal_components.meal_id=target.meal_id ORDER BY sort_order,id LIMIT 1),
          source_id=(SELECT CAST(component_id AS TEXT) FROM meal_components WHERE meal_components.meal_id=target.meal_id ORDER BY sort_order,id LIMIT 1)
      WHERE target.notes LIKE 'Promoted from %'
        AND target.source_type IS NULL
        AND (SELECT COUNT(*) FROM meal_components WHERE meal_components.meal_id=target.meal_id)=1
        AND target.rowid=(
          SELECT MIN(candidate.rowid)
          FROM meal_definitions AS candidate
          JOIN meal_components AS candidate_component ON candidate_component.meal_id=candidate.meal_id
          WHERE candidate.notes LIKE 'Promoted from %'
            AND (SELECT COUNT(*) FROM meal_components WHERE meal_components.meal_id=candidate.meal_id)=1
            AND candidate_component.component_type=(SELECT component_type FROM meal_components WHERE meal_components.meal_id=target.meal_id ORDER BY sort_order,id LIMIT 1)
            AND CAST(candidate_component.component_id AS TEXT)=(SELECT CAST(component_id AS TEXT) FROM meal_components WHERE meal_components.meal_id=target.meal_id ORDER BY sort_order,id LIMIT 1)
        );

    -- Repair databases containing source links written by an interrupted or older build.
    -- Keep the oldest active linked Meal and unlink later duplicates without deleting them.
    UPDATE meal_definitions AS duplicate
      SET source_type=NULL, source_id=NULL
      WHERE duplicate.source_type IS NOT NULL
        AND duplicate.source_id IS NOT NULL
        AND COALESCE(duplicate.archived,0)=0
        AND EXISTS (
          SELECT 1 FROM meal_definitions AS canonical
          WHERE canonical.rowid < duplicate.rowid
            AND COALESCE(canonical.archived,0)=0
            AND canonical.source_type=duplicate.source_type
            AND canonical.source_id=duplicate.source_id
        );

    DROP INDEX IF EXISTS idx_meal_definitions_source;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_definitions_active_source_unique
      ON meal_definitions(source_type,source_id)
      WHERE COALESCE(archived,0)=0 AND source_type IS NOT NULL AND source_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_meal_definitions_source ON meal_definitions(source_type,source_id,archived);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.32','2026-07-24','141132',56,'Promotion Uniqueness & Meal Deletion','2026-07-24T23:55:00-04:00');
  `}

,  {version:57,name:'migration_56_duplicate_recovery',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.33','2026-07-24','141133',57,'Migration 56 Duplicate Recovery','2026-07-24T23:59:00-04:00');
  `}

,  {version:58,name:'archive_metadata_and_data_readiness',sql:`
    ALTER TABLE foods ADD COLUMN archive_source TEXT;
    ALTER TABLE foods ADD COLUMN restored_at TEXT;
    ALTER TABLE foods ADD COLUMN needs_review INTEGER DEFAULT 0;
    ALTER TABLE recipes ADD COLUMN archive_source TEXT;
    ALTER TABLE recipes ADD COLUMN restored_at TEXT;
    ALTER TABLE meal_definitions ADD COLUMN archived_at TEXT;
    ALTER TABLE meal_definitions ADD COLUMN archive_source TEXT;
    ALTER TABLE meal_definitions ADD COLUMN restored_at TEXT;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.37','2026-07-24','141137',58,'UI Stabilization & Archive Recovery','2026-07-24T23:59:00-04:00');
  `}


,  {version:59,name:'archive_restore_completion_release',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.38','2026-07-25','141138',59,'Archive Restore Completion','2026-07-25T00:30:00-04:00');
  `}

,  {version:60,name:'food_classification_and_usage_model',sql:`
    ALTER TABLE foods ADD COLUMN classification TEXT DEFAULT 'ingredient';
    ALTER TABLE foods ADD COLUMN usage_designation TEXT DEFAULT 'component';
    ALTER TABLE recipes ADD COLUMN classification TEXT DEFAULT 'recipe';
    ALTER TABLE recipes ADD COLUMN usage_designation TEXT DEFAULT 'standalone';
    ALTER TABLE meal_definitions ADD COLUMN classification TEXT DEFAULT 'meal';
    ALTER TABLE meal_definitions ADD COLUMN usage_designation TEXT DEFAULT 'standalone';
    UPDATE foods SET classification='ingredient' WHERE classification IS NULL OR TRIM(classification)='';
    UPDATE foods SET usage_designation=CASE WHEN consumption_role IN ('standalone','both','component') THEN consumption_role ELSE 'component' END WHERE usage_designation IS NULL OR TRIM(usage_designation)='';
    UPDATE recipes SET classification='recipe' WHERE classification IS NULL OR TRIM(classification)='';
    UPDATE recipes SET usage_designation='standalone' WHERE usage_designation IS NULL OR TRIM(usage_designation)='';
    UPDATE meal_definitions SET classification='meal' WHERE classification IS NULL OR TRIM(classification)='';
    UPDATE meal_definitions SET usage_designation='standalone' WHERE usage_designation IS NULL OR TRIM(usage_designation)='';
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.39','2026-07-25','141139',60,'Food Classification & Planning Intelligence','2026-07-25T18:30:00-04:00');
  `}

,  {version:61,name:'project_integrity_and_food_library_recovery',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.40','2026-07-25','141140',61,'Project Integrity & Food Library Recovery','2026-07-25T19:15:00-04:00');
  `}
,  {version:62,name:'eat_navigation_and_library_header_polish',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.41','2026-07-25','141141',62,'Eat Navigation & Library Header Polish','2026-07-25T20:10:00-04:00');
  `}

,  {version:63,name:'eat_header_finalization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.11.42','2026-07-25','141142',63,'Eat Header Finalization','2026-07-25T10:30:00-04:00');
  `}

,  {version:66,name:'menu_universal_recipe_categories',sql:`
    ALTER TABLE recipes ADD COLUMN category TEXT DEFAULT 'Any';
    UPDATE recipes SET category='Any' WHERE category IS NULL OR TRIM(category)='';
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.14.4B','2026-07-26','141404B',66,'Canonical Menu Classification Corrective','2026-07-26T22:45:00-04:00');
  `}
,  {version:67,name:'canonical_food_category_repository',sql:`
    CREATE TABLE IF NOT EXISTS food_categories (
      category_key TEXT PRIMARY KEY,
      display_name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    DELETE FROM food_categories;
    INSERT INTO food_categories(category_key,display_name,sort_order,active,created_at,updated_at) VALUES
      ('breakfast','Breakfast',10,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('appetizer','Appetizer',20,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('tapas','Tapas',30,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('soup','Soup',40,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('salad','Salad',50,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('entree','Entrée',60,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('side','Side',70,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('snack','Snack',80,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('dessert','Dessert',90,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('beverage','Beverage',100,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('alcohol','Alcohol',110,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
      ('condiment','Condiment',120,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.14.4C','2026-07-26','141404C',67,'Database Categories and Compact Menu Nutrition','2026-07-26T23:20:00-04:00');
  `}

,  {version:68,name:'unified_classification_and_meals_builder',sql:`
    ALTER TABLE foods ADD COLUMN ingredient_only INTEGER DEFAULT 0;
    ALTER TABLE recipes ADD COLUMN ingredient_only INTEGER DEFAULT 0;
    ALTER TABLE meal_definitions ADD COLUMN ingredient_only INTEGER DEFAULT 0;
    UPDATE foods SET ingredient_only=CASE WHEN COALESCE(usage_designation,consumption_role,'')='component' THEN 1 ELSE 0 END;
    UPDATE recipes SET ingredient_only=CASE WHEN COALESCE(usage_designation,'')='component' THEN 1 ELSE 0 END;
    UPDATE meal_definitions SET ingredient_only=CASE WHEN COALESCE(usage_designation,'')='component' THEN 1 ELSE 0 END;
    UPDATE foods SET category='Ingredient' WHERE ingredient_only=1;
    UPDATE recipes SET category='Ingredient' WHERE ingredient_only=1;
    UPDATE meal_definitions SET category='Ingredient' WHERE ingredient_only=1;
    UPDATE foods SET category=NULL WHERE ingredient_only=0 AND category='Ingredient';
    UPDATE recipes SET category=NULL WHERE ingredient_only=0 AND category='Ingredient';
    UPDATE meal_definitions SET category=NULL WHERE ingredient_only=0 AND category='Ingredient';
    CREATE TABLE IF NOT EXISTS release_register (
      version TEXT PRIMARY KEY,
      issued_date TEXT NOT NULL,
      build_id TEXT NOT NULL,
      schema_version INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.2','2026-07-27','141502',68,'Meals Builder Stabilization','2026-07-27T11:30:00-04:00');
    INSERT OR IGNORE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.2','2026-07-27','141502',68,'Meals Builder Stabilization','2026-07-27T11:30:00-04:00');
  `}
,
  {version:69,name:'startup_loop_recovery',sql:`
    CREATE TABLE IF NOT EXISTS release_register (
      version TEXT PRIMARY KEY,
      issued_date TEXT NOT NULL,
      build_id TEXT NOT NULL,
      schema_version INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.6','2026-07-27','141506',69,'Category Commit Corrective','2026-07-27T13:05:00-04:00');
    INSERT OR IGNORE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.6','2026-07-27','141506',69,'Category Commit Corrective','2026-07-27T13:05:00-04:00');
  `},
  {version:70,name:'corrective_stabilization',sql:`
    UPDATE meal_definitions
       SET archived=1, archived_at=CURRENT_TIMESTAMP, archive_source='v1.4.15.7_duplicate_cleanup', updated_at=CURRENT_TIMESTAMP
     WHERE COALESCE(archived,0)=0
       AND source_type='food'
       AND created_at>='2026-07-27T11:00:00-04:00'
       AND EXISTS (SELECT 1 FROM foods f WHERE CAST(f.food_id AS TEXT)=CAST(meal_definitions.source_id AS TEXT) AND LOWER(TRIM(f.name))=LOWER(TRIM(meal_definitions.title)))
       AND EXISTS (SELECT 1 FROM meal_components c WHERE c.meal_id=meal_definitions.meal_id AND c.component_type='food' AND CAST(c.component_id AS TEXT)=CAST(meal_definitions.source_id AS TEXT))
       AND (SELECT COUNT(*) FROM meal_components c2 WHERE c2.meal_id=meal_definitions.meal_id)=1;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.7','2026-07-27','141507',70,'Corrective Stabilization','2026-07-27T13:35:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.7','2026-07-27','141507',70,'Corrective Stabilization','2026-07-27T13:35:00-04:00');
  `}


,  {version:71,name:'pantry_inventory_model_cleanup',sql:`
    ALTER TABLE pantry ADD COLUMN discontinued INTEGER DEFAULT 0;
    UPDATE pantry SET discontinued=0 WHERE discontinued IS NULL;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.13','2026-07-27','141513',72,'Menu Alignment and Inventory Availability','2026-07-27T23:55:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.13','2026-07-27','141513',72,'Menu Alignment and Inventory Availability','2026-07-27T23:55:00-04:00');
  `},
  {version:73,name:'pantry_state_and_meals_library_repair',sql:`
    UPDATE pantry
       SET quantity=0,
           on_hand='No',
           status='Out of Stock',
           verified_at=COALESCE(verified_at,CURRENT_TIMESTAMP),
           quantity_accuracy=COALESCE(quantity_accuracy,'reconciled')
     WHERE COALESCE(discontinued,0)=0
       AND (
         COALESCE(quantity,0)<=0
         OR LOWER(TRIM(COALESCE(on_hand,''))) IN ('no','false','0','out of stock','unavailable')
         OR LOWER(TRIM(COALESCE(status,''))) IN ('out of stock','out_of_stock','unavailable','none')
       );
    UPDATE pantry
       SET on_hand='Yes',
           status='Active'
     WHERE COALESCE(discontinued,0)=0
       AND COALESCE(quantity,0)>0
       AND LOWER(TRIM(COALESCE(on_hand,'yes'))) NOT IN ('no','false','0','out of stock','unavailable')
       AND LOWER(TRIM(COALESCE(status,'active'))) NOT IN ('out of stock','out_of_stock','unavailable','none');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.19','2026-07-28','141519',73,'Build Syntax Correction','2026-07-28T04:10:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.19','2026-07-28','141519',73,'Build Syntax Correction','2026-07-28T04:10:00-04:00');
  `},
  {version:72,name:'menu_eligibility_classification_repair',sql:`
    UPDATE foods
       SET usage_designation=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'component' ELSE 'both' END,
           consumption_role=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'component' ELSE 'both' END,
           classification=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'ingredient' ELSE 'food' END,
           category=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'Ingredient' WHEN category='Ingredient' THEN NULL ELSE category END,
           updated_at=CURRENT_TIMESTAMP
     WHERE COALESCE(archived,0)=0
       AND (COALESCE(usage_designation,'')<>CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'component' ELSE 'both' END
         OR COALESCE(consumption_role,'')<>CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'component' ELSE 'both' END
         OR COALESCE(classification,'')<>CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'ingredient' ELSE 'food' END
         OR (COALESCE(ingredient_only,0)=1 AND COALESCE(category,'')<>'Ingredient')
         OR (COALESCE(ingredient_only,0)=0 AND category='Ingredient'));
    UPDATE recipes
       SET usage_designation=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'component' ELSE 'both' END,
           classification=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'ingredient' ELSE 'recipe' END,
           category=CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'Ingredient' WHEN category='Ingredient' THEN NULL ELSE category END
     WHERE COALESCE(archived,0)=0
       AND (COALESCE(usage_designation,'')<>CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'component' ELSE 'both' END
         OR COALESCE(classification,'')<>CASE WHEN COALESCE(ingredient_only,0)=1 THEN 'ingredient' ELSE 'recipe' END
         OR (COALESCE(ingredient_only,0)=1 AND COALESCE(category,'')<>'Ingredient')
         OR (COALESCE(ingredient_only,0)=0 AND category='Ingredient'));
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.17','2026-07-28','141517',72,'Menu Eligibility Classification Repair','2026-07-28T02:35:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.17','2026-07-28','141517',72,'Menu Eligibility Classification Repair','2026-07-28T02:35:00-04:00');
  `}

,  {version:74,name:'recipe_ingredient_resolution_integrity',sql:`
    UPDATE foods
       SET nutrition_known=1,
           nutrition_source=COALESCE(NULLIF(nutrition_source,''),'reconciled_existing_values'),
           updated_at=CURRENT_TIMESTAMP
     WHERE COALESCE(archived,0)=0
       AND COALESCE(nutrition_known,0)<>1
       AND default_serving>0
       AND TRIM(COALESCE(unit,''))<>''
       AND calories IS NOT NULL AND calories>=0
       AND protein IS NOT NULL AND protein>=0
       AND carbs IS NOT NULL AND carbs>=0
       AND fiber IS NOT NULL AND fiber>=0
       AND fat IS NOT NULL AND fat>=0
       AND saturated_fat IS NOT NULL AND saturated_fat>=0
       AND trans_fat IS NOT NULL AND trans_fat>=0
       AND cholesterol IS NOT NULL AND cholesterol>=0
       AND sodium IS NOT NULL AND sodium>=0
       AND total_sugar IS NOT NULL AND total_sugar>=0
       AND added_sugar IS NOT NULL AND added_sugar>=0;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.20','2026-07-28','141520',74,'Recipe Ingredient Resolution Integrity','2026-07-28T05:05:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.20','2026-07-28','141520',74,'Recipe Ingredient Resolution Integrity','2026-07-28T05:05:00-04:00');
  `}
,  {version:75,name:'pantry_barcode_reconciliation_foundation',sql:`
    CREATE TABLE IF NOT EXISTS barcode_scan_events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL,
      food_id TEXT,
      food_name TEXT,
      result TEXT NOT NULL,
      scanned_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_barcode_scan_events_barcode ON barcode_scan_events(barcode);
    CREATE INDEX IF NOT EXISTS idx_foods_barcode_normalized ON foods(barcode);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.28','2026-07-28','141528',75,'Pantry Reconciliation Foundation','2026-07-28T21:30:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.28','2026-07-28','141528',75,'Pantry Reconciliation Foundation','2026-07-28T21:30:00-04:00');
  `}
,  {version:76,name:'iphone_barcode_camera_corrective',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.29','2026-07-28','141529',76,'iPhone Barcode Camera Corrective','2026-07-28T22:30:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.29','2026-07-28','141529',76,'iPhone Barcode Camera Corrective','2026-07-28T22:30:00-04:00');
  `}
,  {version:77,name:'pantry_reconciliation_product_fields',sql:`
    ALTER TABLE foods ADD COLUMN manufacturer TEXT;
    CREATE TABLE IF NOT EXISTS food_barcodes (
      barcode TEXT PRIMARY KEY,
      food_id TEXT NOT NULL,
      package_description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO food_barcodes(barcode,food_id,created_at,updated_at)
      SELECT REPLACE(REPLACE(barcode,'-',''),' ',''),food_id,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
      FROM foods WHERE TRIM(COALESCE(barcode,''))<>'';
    CREATE INDEX IF NOT EXISTS idx_food_barcodes_food_id ON food_barcodes(food_id);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.32','2026-07-28','141532',77,'Pantry Stabilization and Promote to Meal','2026-07-28T23:59:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.32','2026-07-28','141532',77,'Pantry Stabilization and Promote to Meal','2026-07-28T23:59:00-04:00');
  `}
,  {version:78,name:'pantry_persistence_scanner_corrective',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.33','2026-07-28','141533',78,'Pantry Persistence and Barcode Scanner Corrective','2026-07-28T23:59:30-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.33','2026-07-28','141533',78,'Pantry Persistence and Barcode Scanner Corrective','2026-07-28T23:59:30-04:00');
  `}
,  {version:79,name:'pantry_inventory_conversation_corrective',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.35','2026-07-29','141535',80,'Barcode Scanner Reliability Corrective','2026-07-29T07:05:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.35','2026-07-29','141535',80,'Barcode Scanner Reliability Corrective','2026-07-29T07:05:00-04:00');
  `}
,  {version:80,name:'linked_shopping_cart_pilot',sql:`
    ALTER TABLE pantry ADD COLUMN product_link TEXT;
    ALTER TABLE pantry ADD COLUMN product_image_url TEXT;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.36','2026-07-29','141536',81,'Linked Shopping Cart Pilot','2026-07-29T09:45:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.36','2026-07-29','141536',81,'Linked Shopping Cart Pilot','2026-07-29T09:45:00-04:00');
  `}
,  {version:81,name:'inventory_consumption_shopping_image_corrective',sql:`
    ALTER TABLE pantry ADD COLUMN product_image_status TEXT;
    ALTER TABLE pantry ADD COLUMN product_image_checked_at TEXT;
    ALTER TABLE pantry ADD COLUMN product_image_error TEXT;
    CREATE TABLE IF NOT EXISTS meal_pantry_adjustments (id INTEGER PRIMARY KEY AUTOINCREMENT,meal_id INTEGER NOT NULL,source_record_id TEXT,pantry_id TEXT NOT NULL,delta REAL NOT NULL,created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_meal_pantry_adjustments_meal ON meal_pantry_adjustments(meal_id);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.37','2026-07-29','141537',82,'Inventory Consumption and Shopping Image Corrective','2026-07-29T10:30:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.37','2026-07-29','141537',82,'Inventory Consumption and Shopping Image Corrective','2026-07-29T10:30:00-04:00');
  `}
,  {version:82,name:'inventory_integrity_runtime_path_corrective',sql:`
    ALTER TABLE meal_pantry_adjustments ADD COLUMN before_json TEXT;
    ALTER TABLE meal_pantry_adjustments ADD COLUMN after_json TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_pantry_adjustments_unique ON meal_pantry_adjustments(meal_id,pantry_id);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.41','2026-07-29','141541',82,'Menu & Daily Brief Corrections','2026-07-29T12:15:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.41','2026-07-29','141541',82,'Menu & Daily Brief Corrections','2026-07-29T12:15:00-04:00');
  `}
,  {version:83,name:'inventory_shopping_completion',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.40','2026-07-29','141540',83,'Inventory & Shopping Completion','2026-07-29T12:15:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.40','2026-07-29','141540',83,'Inventory & Shopping Completion','2026-07-29T12:15:00-04:00');
  `}
,  {version:84,name:'inventory_packaging_consolidation',sql:`
    ALTER TABLE pantry ADD COLUMN servings_per_package REAL;
    UPDATE pantry SET servings_per_package=(SELECT f.servings_per_container FROM foods f WHERE UPPER(f.food_id)=UPPER(pantry.food_id)) WHERE servings_per_package IS NULL;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.15.56','2026-07-30','141556',84,'Inventory Model Consolidation & Nutrition Landing Cleanup','2026-07-30T09:45:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at) VALUES ('1.4.15.56','2026-07-30','141556',84,'Inventory Model Consolidation & Nutrition Landing Cleanup','2026-07-30T09:45:00-04:00');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.15.57','2026-07-30','141557',84,'Inventory Editor Focus Corrective','2026-07-30T10:40:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at) VALUES ('1.4.15.57','2026-07-30','141557',84,'Inventory Editor Focus Corrective','2026-07-30T10:40:00-04:00');
  `}
,  {version:85,name:'recipe_consolidation_phase_1',sql:`
    ALTER TABLE recipes ADD COLUMN notes TEXT;
    ALTER TABLE recipes ADD COLUMN favorite INTEGER DEFAULT 0;
    ALTER TABLE meal_definitions ADD COLUMN serving_size REAL DEFAULT 1;
    ALTER TABLE meal_definitions ADD COLUMN serving_unit TEXT DEFAULT 'serving';
    ALTER TABLE meal_definitions ADD COLUMN servings_per_batch REAL DEFAULT 1;
    ALTER TABLE meal_definitions ADD COLUMN track_inventory INTEGER DEFAULT 0;
    CREATE TABLE IF NOT EXISTS recipe_migration_log (
      legacy_recipe_id TEXT PRIMARY KEY, canonical_meal_id TEXT NOT NULL,
      legacy_ingredient_count INTEGER NOT NULL, canonical_component_count INTEGER NOT NULL,
      status TEXT NOT NULL, details TEXT, migrated_at TEXT NOT NULL, validated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS recipe_migration_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT, legacy_recipe_id TEXT, recipe_name TEXT,
      issue_type TEXT NOT NULL, details TEXT, created_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO meal_definitions(meal_id,title,category,icon,notes,favorite,archived,created_at,updated_at,source_type,source_id,classification,usage_designation,ingredient_only,serving_size,serving_unit,servings_per_batch,track_inventory)
    SELECT 'recipe:'||r.recipe_id,MAX(r.recipe_name),COALESCE(MAX(NULLIF(r.category,'')),'Any'),'utensils',MAX(r.notes),COALESCE(MAX(r.favorite),0),COALESCE(MAX(r.archived),0),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'legacy_recipe',r.recipe_id,'recipe',COALESCE(MAX(NULLIF(r.usage_designation,'')),'standalone'),COALESCE(MAX(r.ingredient_only),0),1,'serving',1,0
    FROM recipes r WHERE COALESCE(r.recipe_id,'')<>'' GROUP BY r.recipe_id;
    INSERT INTO meal_components(meal_id,component_type,component_id,component_name,amount,unit,optional,sort_order)
    SELECT 'recipe:'||r.recipe_id,COALESCE(NULLIF(LOWER(r.ingredient_type),''),'food'),r.ingredient_id,r.ingredient_name,r.amount,COALESCE(NULLIF(r.unit,''),'serving'),0,r.id
    FROM recipes r
    WHERE COALESCE(r.recipe_id,'')<>'' AND NOT EXISTS (
      SELECT 1 FROM meal_components mc WHERE mc.meal_id='recipe:'||r.recipe_id
    );
    INSERT OR REPLACE INTO recipe_migration_log(legacy_recipe_id,canonical_meal_id,legacy_ingredient_count,canonical_component_count,status,details,migrated_at,validated_at)
    SELECT r.recipe_id,'recipe:'||r.recipe_id,COUNT(*),(SELECT COUNT(*) FROM meal_components mc WHERE mc.meal_id='recipe:'||r.recipe_id),
      CASE WHEN COUNT(*)=(SELECT COUNT(*) FROM meal_components mc WHERE mc.meal_id='recipe:'||r.recipe_id) THEN 'validated' ELSE 'issue' END,
      CASE WHEN COUNT(*)=(SELECT COUNT(*) FROM meal_components mc WHERE mc.meal_id='recipe:'||r.recipe_id) THEN 'Ingredient counts match.' ELSE 'Ingredient count mismatch.' END,
      CURRENT_TIMESTAMP,CASE WHEN COUNT(*)=(SELECT COUNT(*) FROM meal_components mc WHERE mc.meal_id='recipe:'||r.recipe_id) THEN CURRENT_TIMESTAMP ELSE NULL END
    FROM recipes r WHERE COALESCE(r.recipe_id,'')<>'' GROUP BY r.recipe_id;
    INSERT INTO recipe_migration_issues(legacy_recipe_id,recipe_name,issue_type,details,created_at)
    SELECT r.recipe_id,MAX(r.recipe_name),'malformed_ingredient','One or more legacy ingredients have a missing name, invalid quantity, or missing unit.',CURRENT_TIMESTAMP
    FROM recipes r WHERE COALESCE(r.recipe_id,'')<>'' GROUP BY r.recipe_id
    HAVING SUM(CASE WHEN COALESCE(TRIM(r.ingredient_name),'')='' OR COALESCE(r.amount,0)<=0 OR COALESCE(TRIM(r.unit),'')='' THEN 1 ELSE 0 END)>0;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.59','2026-07-30','141559',85,'Recipe Record Navigation Corrective','2026-07-30T13:25:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.59','2026-07-30','141559',85,'Recipe Record Navigation Corrective','2026-07-30T13:25:00-04:00');
  `}

,  {version:86,name:'recipe_serving_availability_integration',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.60','2026-07-30','141560',86,'Recipe Serving & Availability Integration','2026-07-30T14:27:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.60','2026-07-30','141560',86,'Recipe Serving & Availability Integration','2026-07-30T14:27:00-04:00');
  `},
  {version:87,name:'prepared_batch_weight_and_food_category_repair',sql:`
    UPDATE foods
       SET category=NULL, updated_at=COALESCE(updated_at,CURRENT_TIMESTAMP)
     WHERE COALESCE(ingredient_only,0)=0
       AND COALESCE(TRIM(category),'')<>''
       AND LOWER(TRIM(category))<>'ingredient'
       AND NOT EXISTS (
         SELECT 1 FROM food_categories fc
          WHERE fc.active=1 AND LOWER(TRIM(fc.display_name))=LOWER(TRIM(foods.category))
       );
    UPDATE foods SET category=NULL WHERE COALESCE(ingredient_only,0)=0 AND LOWER(TRIM(COALESCE(category,'')))='food';
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.61','2026-07-30','141561',87,'Prepared Batch Weight & Food Import Visibility','2026-07-30T15:05:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.61','2026-07-30','141561',87,'Prepared Batch Weight & Food Import Visibility','2026-07-30T15:05:00-04:00');
  `},
  {version:88,name:'food_delete_and_serving_corrective',sql:`
    UPDATE foods
       SET default_serving=1, updated_at=COALESCE(updated_at,CURRENT_TIMESTAMP)
     WHERE (default_serving IS NULL OR default_serving<=0)
       AND COALESCE(TRIM(unit),'')<>'';
    UPDATE foods
       SET unit='serving', updated_at=COALESCE(updated_at,CURRENT_TIMESTAMP)
     WHERE COALESCE(TRIM(unit),'')=''
       AND default_serving>0;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.62','2026-07-30','141562',88,'Food Delete & Serving Corrective','2026-07-30T15:38:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.62','2026-07-30','141562',88,'Food Delete & Serving Corrective','2026-07-30T15:38:00-04:00');
  `},
  {version:89,name:'recipe_serving_conversion_stabilization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.63','2026-07-30','141563',89,'Recipe Serving Conversion Stabilization','2026-07-30T16:16:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.63','2026-07-30','141563',89,'Recipe Serving Conversion Stabilization','2026-07-30T16:16:00-04:00');
  `},
  {version:90,name:'recipe_navigation_stabilization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.64','2026-07-30','141564',90,'Recipe Navigation Stabilization','2026-07-30T16:30:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.64','2026-07-30','141564',90,'Recipe Navigation Stabilization','2026-07-30T16:30:00-04:00');
  `},
  {version:91,name:'recipe_form_availability_stabilization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.65','2026-07-30','141565',91,'Recipe Form & Availability Stabilization','2026-07-30T17:45:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.65','2026-07-30','141565',91,'Recipe Form & Availability Stabilization','2026-07-30T17:45:00-04:00');
  `},
  {version:92,name:'availability_engine_stabilization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.66','2026-07-30','141566',92,'Availability Engine Stabilization','2026-07-30T17:58:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.66','2026-07-30','141566',92,'Availability Engine Stabilization','2026-07-30T17:58:00-04:00');
  `},
  {version:93,name:'modern_record_recipe_creation_stabilization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.67','2026-07-30','141567',93,'Modern Record Routing & Recipe Creation Stabilization','2026-07-30T19:20:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.67','2026-07-30','141567',93,'Modern Record Routing & Recipe Creation Stabilization','2026-07-30T19:20:00-04:00');
  `},
  {version:94,name:'recipe_food_delete_legacy_ui_stabilization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.69','2026-07-30','141569',95,'Recipe Library, Migration & Editor Recovery','2026-07-30T21:20:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.69','2026-07-30','141569',95,'Recipe Library, Migration & Editor Recovery','2026-07-30T21:20:00-04:00');
  `},
  {version:95,name:'production_build_syntax_corrective',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.71','2026-07-31','141571',96,'Recipe, Inventory & Enrichment Corrective','2026-07-31T01:35:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.71','2026-07-31','141571',96,'Recipe, Inventory & Enrichment Corrective','2026-07-31T01:35:00-04:00');
   `},
  {version:96,name:'canonical_nutrient_schema_reconciliation',sql:`
    ALTER TABLE foods ADD COLUMN calories REAL;
    ALTER TABLE foods ADD COLUMN protein REAL;
    ALTER TABLE foods ADD COLUMN carbs REAL;
    ALTER TABLE foods ADD COLUMN fiber REAL;
    ALTER TABLE foods ADD COLUMN fat REAL;
    ALTER TABLE foods ADD COLUMN saturated_fat REAL;
    ALTER TABLE foods ADD COLUMN trans_fat REAL;
    ALTER TABLE foods ADD COLUMN cholesterol REAL;
    ALTER TABLE foods ADD COLUMN sodium REAL;
    ALTER TABLE foods ADD COLUMN potassium REAL;
    ALTER TABLE foods ADD COLUMN total_sugar REAL;
    ALTER TABLE foods ADD COLUMN added_sugar REAL;
    ALTER TABLE foods ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE foods ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE foods ADD COLUMN omega_3 REAL;
    ALTER TABLE foods ADD COLUMN calcium REAL;
    ALTER TABLE foods ADD COLUMN iron REAL;
    ALTER TABLE foods ADD COLUMN magnesium REAL;
    ALTER TABLE foods ADD COLUMN vitamin_d REAL;
    ALTER TABLE foods ADD COLUMN vitamin_c REAL;
    ALTER TABLE foods ADD COLUMN alcohol REAL;
    ALTER TABLE foods ADD COLUMN caffeine REAL;
    ALTER TABLE meals ADD COLUMN calories REAL;
    ALTER TABLE meals ADD COLUMN protein REAL;
    ALTER TABLE meals ADD COLUMN carbs REAL;
    ALTER TABLE meals ADD COLUMN fiber REAL;
    ALTER TABLE meals ADD COLUMN fat REAL;
    ALTER TABLE meals ADD COLUMN saturated_fat REAL;
    ALTER TABLE meals ADD COLUMN trans_fat REAL;
    ALTER TABLE meals ADD COLUMN cholesterol REAL;
    ALTER TABLE meals ADD COLUMN sodium REAL;
    ALTER TABLE meals ADD COLUMN potassium REAL;
    ALTER TABLE meals ADD COLUMN total_sugar REAL;
    ALTER TABLE meals ADD COLUMN added_sugar REAL;
    ALTER TABLE meals ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE meals ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE meals ADD COLUMN omega_3 REAL;
    ALTER TABLE meals ADD COLUMN calcium REAL;
    ALTER TABLE meals ADD COLUMN iron REAL;
    ALTER TABLE meals ADD COLUMN magnesium REAL;
    ALTER TABLE meals ADD COLUMN vitamin_d REAL;
    ALTER TABLE meals ADD COLUMN vitamin_c REAL;
    ALTER TABLE meals ADD COLUMN alcohol REAL;
    ALTER TABLE meals ADD COLUMN caffeine REAL;
    ALTER TABLE planned_meals ADD COLUMN calories REAL;
    ALTER TABLE planned_meals ADD COLUMN protein REAL;
    ALTER TABLE planned_meals ADD COLUMN carbs REAL;
    ALTER TABLE planned_meals ADD COLUMN fiber REAL;
    ALTER TABLE planned_meals ADD COLUMN fat REAL;
    ALTER TABLE planned_meals ADD COLUMN saturated_fat REAL;
    ALTER TABLE planned_meals ADD COLUMN trans_fat REAL;
    ALTER TABLE planned_meals ADD COLUMN cholesterol REAL;
    ALTER TABLE planned_meals ADD COLUMN sodium REAL;
    ALTER TABLE planned_meals ADD COLUMN potassium REAL;
    ALTER TABLE planned_meals ADD COLUMN total_sugar REAL;
    ALTER TABLE planned_meals ADD COLUMN added_sugar REAL;
    ALTER TABLE planned_meals ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE planned_meals ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE planned_meals ADD COLUMN omega_3 REAL;
    ALTER TABLE planned_meals ADD COLUMN calcium REAL;
    ALTER TABLE planned_meals ADD COLUMN iron REAL;
    ALTER TABLE planned_meals ADD COLUMN magnesium REAL;
    ALTER TABLE planned_meals ADD COLUMN vitamin_d REAL;
    ALTER TABLE planned_meals ADD COLUMN vitamin_c REAL;
    ALTER TABLE planned_meals ADD COLUMN alcohol REAL;
    ALTER TABLE planned_meals ADD COLUMN caffeine REAL;
    ALTER TABLE restaurant_meals ADD COLUMN calories REAL;
    ALTER TABLE restaurant_meals ADD COLUMN protein REAL;
    ALTER TABLE restaurant_meals ADD COLUMN carbs REAL;
    ALTER TABLE restaurant_meals ADD COLUMN fiber REAL;
    ALTER TABLE restaurant_meals ADD COLUMN fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN saturated_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN trans_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN cholesterol REAL;
    ALTER TABLE restaurant_meals ADD COLUMN sodium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN potassium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN total_sugar REAL;
    ALTER TABLE restaurant_meals ADD COLUMN added_sugar REAL;
    ALTER TABLE restaurant_meals ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE restaurant_meals ADD COLUMN omega_3 REAL;
    ALTER TABLE restaurant_meals ADD COLUMN calcium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN iron REAL;
    ALTER TABLE restaurant_meals ADD COLUMN magnesium REAL;
    ALTER TABLE restaurant_meals ADD COLUMN vitamin_d REAL;
    ALTER TABLE restaurant_meals ADD COLUMN vitamin_c REAL;
    ALTER TABLE restaurant_meals ADD COLUMN alcohol REAL;
    ALTER TABLE restaurant_meals ADD COLUMN caffeine REAL;
    ALTER TABLE meal_definitions ADD COLUMN calories REAL;
    ALTER TABLE meal_definitions ADD COLUMN protein REAL;
    ALTER TABLE meal_definitions ADD COLUMN carbs REAL;
    ALTER TABLE meal_definitions ADD COLUMN fiber REAL;
    ALTER TABLE meal_definitions ADD COLUMN fat REAL;
    ALTER TABLE meal_definitions ADD COLUMN saturated_fat REAL;
    ALTER TABLE meal_definitions ADD COLUMN trans_fat REAL;
    ALTER TABLE meal_definitions ADD COLUMN cholesterol REAL;
    ALTER TABLE meal_definitions ADD COLUMN sodium REAL;
    ALTER TABLE meal_definitions ADD COLUMN potassium REAL;
    ALTER TABLE meal_definitions ADD COLUMN total_sugar REAL;
    ALTER TABLE meal_definitions ADD COLUMN added_sugar REAL;
    ALTER TABLE meal_definitions ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE meal_definitions ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE meal_definitions ADD COLUMN omega_3 REAL;
    ALTER TABLE meal_definitions ADD COLUMN calcium REAL;
    ALTER TABLE meal_definitions ADD COLUMN iron REAL;
    ALTER TABLE meal_definitions ADD COLUMN magnesium REAL;
    ALTER TABLE meal_definitions ADD COLUMN vitamin_d REAL;
    ALTER TABLE meal_definitions ADD COLUMN vitamin_c REAL;
    ALTER TABLE meal_definitions ADD COLUMN alcohol REAL;
    ALTER TABLE meal_definitions ADD COLUMN caffeine REAL;
    ALTER TABLE meal_components ADD COLUMN calories REAL;
    ALTER TABLE meal_components ADD COLUMN protein REAL;
    ALTER TABLE meal_components ADD COLUMN carbs REAL;
    ALTER TABLE meal_components ADD COLUMN fiber REAL;
    ALTER TABLE meal_components ADD COLUMN fat REAL;
    ALTER TABLE meal_components ADD COLUMN saturated_fat REAL;
    ALTER TABLE meal_components ADD COLUMN trans_fat REAL;
    ALTER TABLE meal_components ADD COLUMN cholesterol REAL;
    ALTER TABLE meal_components ADD COLUMN sodium REAL;
    ALTER TABLE meal_components ADD COLUMN potassium REAL;
    ALTER TABLE meal_components ADD COLUMN total_sugar REAL;
    ALTER TABLE meal_components ADD COLUMN added_sugar REAL;
    ALTER TABLE meal_components ADD COLUMN monounsaturated_fat REAL;
    ALTER TABLE meal_components ADD COLUMN polyunsaturated_fat REAL;
    ALTER TABLE meal_components ADD COLUMN omega_3 REAL;
    ALTER TABLE meal_components ADD COLUMN calcium REAL;
    ALTER TABLE meal_components ADD COLUMN iron REAL;
    ALTER TABLE meal_components ADD COLUMN magnesium REAL;
    ALTER TABLE meal_components ADD COLUMN vitamin_d REAL;
    ALTER TABLE meal_components ADD COLUMN vitamin_c REAL;
    ALTER TABLE meal_components ADD COLUMN alcohol REAL;
    ALTER TABLE meal_components ADD COLUMN caffeine REAL;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.86','2026-07-31','141586',96,'Canonical Nutrient Schema Reconciliation','2026-07-31T18:43:00-04:00');
    INSERT OR REPLACE INTO release_register(version,issued_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.86','2026-07-31','141586',96,'Canonical Nutrient Schema Reconciliation','2026-07-31T18:43:00-04:00');
  `}
  ,{version:97,name:'fixed_fiber_target_and_prepared_inventory_integrity',sql:`
    UPDATE nutrition_targets
       SET target_value=30,
           max_value=40,
           override_target=30,
           override_max=40,
           derived=0,
           source='User configured',
           source_category='fixed',
           formula='Fixed daily target / maximum',
           recommendation_notes='Aim for 30 g daily; 40 g is the configured maximum.',
           updated_at=CURRENT_TIMESTAMP
     WHERE nutrient='fiber';
    INSERT OR REPLACE INTO target_history(effective_date,nutrient,target_value,max_value,unit,source,formula)
    VALUES ('2026-08-01','fiber',30,40,'g','User configured','Fixed daily target / maximum');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.91','2026-08-01','141591',97,'Prepared Inventory & Nutrition Target Stabilization','2026-08-01T04:55:00-04:00');
  `}

,  {version:98,name:'replace_health_forms_and_seed_laboratory_history',sql:`
    ALTER TABLE lab_results ADD COLUMN text_value TEXT;
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Fasted','',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2016-10-31:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',199,NULL,'mg/dL',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2016-10-31:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',199,NULL,'mg/dL','2016-10-31T12:00:00.000Z','2016-10-31','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2016-10-31:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',135,NULL,'mg/dL',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2016-10-31:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',135,NULL,'mg/dL','2016-10-31T12:00:00.000Z','2016-10-31','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2016-10-31:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',49,NULL,'mg/dL',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2016-10-31:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',49,NULL,'mg/dL','2016-10-31T12:00:00.000Z','2016-10-31','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2016-10-31:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',75,NULL,'mg/dL',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2016-10-31:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',75,NULL,'mg/dL','2016-10-31T12:00:00.000Z','2016-10-31','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2016-10-31:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',150,NULL,'mg/dL',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2016-10-31:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',150,NULL,'mg/dL','2016-10-31T12:00:00.000Z','2016-10-31','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2016-10-31:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('PSA',0.6,NULL,'ng/mL',NULL,NULL,'2016-10-31T12:00:00.000Z','workbook-seed','ng/mL',CURRENT_TIMESTAMP,'lab:2016-10-31:psa');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:psa',0.6,NULL,'ng/mL','2016-10-31T12:00:00.000Z','2016-10-31','ng/mL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2016-10-31:psa');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Fasted','',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2017-11-03:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',163,NULL,'mg/dL',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2017-11-03:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',163,NULL,'mg/dL','2017-11-03T12:00:00.000Z','2017-11-03','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2017-11-03:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',95,NULL,'mg/dL',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2017-11-03:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',95,NULL,'mg/dL','2017-11-03T12:00:00.000Z','2017-11-03','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2017-11-03:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',51,NULL,'mg/dL',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2017-11-03:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',51,NULL,'mg/dL','2017-11-03T12:00:00.000Z','2017-11-03','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2017-11-03:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',80,NULL,'mg/dL',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2017-11-03:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',80,NULL,'mg/dL','2017-11-03T12:00:00.000Z','2017-11-03','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2017-11-03:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',112,NULL,'mg/dL',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2017-11-03:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',112,NULL,'mg/dL','2017-11-03T12:00:00.000Z','2017-11-03','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2017-11-03:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('PSA',0.7,NULL,'ng/mL',NULL,NULL,'2017-11-03T12:00:00.000Z','workbook-seed','ng/mL',CURRENT_TIMESTAMP,'lab:2017-11-03:psa');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:psa',0.7,NULL,'ng/mL','2017-11-03T12:00:00.000Z','2017-11-03','ng/mL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2017-11-03:psa');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Fasted','',NULL,NULL,'2018-11-20T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2018-11-20:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('PSA',1,NULL,'ng/mL',NULL,NULL,'2018-11-20T12:00:00.000Z','workbook-seed','ng/mL',CURRENT_TIMESTAMP,'lab:2018-11-20:psa');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:psa',1,NULL,'ng/mL','2018-11-20T12:00:00.000Z','2018-11-20','ng/mL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2018-11-20:psa');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Fasted','',NULL,NULL,'2021-01-07T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2021-01-07:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',192,NULL,'mg/dL',NULL,NULL,'2021-01-07T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2021-01-07:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',192,NULL,'mg/dL','2021-01-07T12:00:00.000Z','2021-01-07','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2021-01-07:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',119,NULL,'mg/dL',NULL,NULL,'2021-01-07T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2021-01-07:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',119,NULL,'mg/dL','2021-01-07T12:00:00.000Z','2021-01-07','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2021-01-07:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',58,NULL,'mg/dL',NULL,NULL,'2021-01-07T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2021-01-07:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',58,NULL,'mg/dL','2021-01-07T12:00:00.000Z','2021-01-07','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2021-01-07:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',73,NULL,'mg/dL',NULL,NULL,'2021-01-07T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2021-01-07:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',73,NULL,'mg/dL','2021-01-07T12:00:00.000Z','2021-01-07','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2021-01-07:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',134,NULL,'mg/dL',NULL,NULL,'2021-01-07T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2021-01-07:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',134,NULL,'mg/dL','2021-01-07T12:00:00.000Z','2021-01-07','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2021-01-07:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Fasted','',NULL,NULL,'2022-01-10T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2022-01-10:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',215,NULL,'mg/dL',NULL,NULL,'2022-01-10T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2022-01-10:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',215,NULL,'mg/dL','2022-01-10T12:00:00.000Z','2022-01-10','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2022-01-10:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',137,NULL,'mg/dL',NULL,NULL,'2022-01-10T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2022-01-10:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',137,NULL,'mg/dL','2022-01-10T12:00:00.000Z','2022-01-10','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2022-01-10:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',60,NULL,'mg/dL',NULL,NULL,'2022-01-10T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2022-01-10:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',60,NULL,'mg/dL','2022-01-10T12:00:00.000Z','2022-01-10','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2022-01-10:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',84,NULL,'mg/dL',NULL,NULL,'2022-01-10T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2022-01-10:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',84,NULL,'mg/dL','2022-01-10T12:00:00.000Z','2022-01-10','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2022-01-10:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',155,NULL,'mg/dL',NULL,NULL,'2022-01-10T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2022-01-10:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',155,NULL,'mg/dL','2022-01-10T12:00:00.000Z','2022-01-10','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2022-01-10:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Fasted','',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2024-06-27:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',242,NULL,'mg/dL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2024-06-27:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',242,NULL,'mg/dL','2024-06-27T12:00:00.000Z','2024-06-27','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',164,NULL,'mg/dL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2024-06-27:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',164,NULL,'mg/dL','2024-06-27T12:00:00.000Z','2024-06-27','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',59,NULL,'mg/dL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2024-06-27:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',59,NULL,'mg/dL','2024-06-27T12:00:00.000Z','2024-06-27','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',83,NULL,'mg/dL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2024-06-27:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',83,NULL,'mg/dL','2024-06-27T12:00:00.000Z','2024-06-27','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',183,NULL,'mg/dL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2024-06-27:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',183,NULL,'mg/dL','2024-06-27T12:00:00.000Z','2024-06-27','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('ApoB',127,NULL,'mg/dL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2024-06-27:apob');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:apob',127,NULL,'mg/dL','2024-06-27T12:00:00.000Z','2024-06-27','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:apob');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Lp(a)',68,NULL,'',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','Units not specified in source summary',CURRENT_TIMESTAMP,'lab:2024-06-27:lp-a');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:lp-a',68,NULL,'','2024-06-27T12:00:00.000Z','2024-06-27','Units not specified in source summary','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:lp-a');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('A1c',5.5,NULL,'%',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','%',CURRENT_TIMESTAMP,'lab:2024-06-27:a1c');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:a1c',5.5,NULL,'%','2024-06-27T12:00:00.000Z','2024-06-27','%','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:a1c');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('PSA',1.3,NULL,'ng/mL',NULL,NULL,'2024-06-27T12:00:00.000Z','workbook-seed','ng/mL',CURRENT_TIMESTAMP,'lab:2024-06-27:psa');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:psa',1.3,NULL,'ng/mL','2024-06-27T12:00:00.000Z','2024-06-27','ng/mL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2024-06-27:psa');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Non-fasted','',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2025-06-04:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',232,NULL,'mg/dL',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2025-06-04:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',232,NULL,'mg/dL','2025-06-04T12:00:00.000Z','2025-06-04','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',147,NULL,'mg/dL',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2025-06-04:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',147,NULL,'mg/dL','2025-06-04T12:00:00.000Z','2025-06-04','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',51,NULL,'mg/dL',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2025-06-04:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',51,NULL,'mg/dL','2025-06-04T12:00:00.000Z','2025-06-04','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',207,NULL,'mg/dL',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2025-06-04:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',207,NULL,'mg/dL','2025-06-04T12:00:00.000Z','2025-06-04','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',181,NULL,'mg/dL',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2025-06-04:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',181,NULL,'mg/dL','2025-06-04T12:00:00.000Z','2025-06-04','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('A1c',5.6,NULL,'%',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','%',CURRENT_TIMESTAMP,'lab:2025-06-04:a1c');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:a1c',5.6,NULL,'%','2025-06-04T12:00:00.000Z','2025-06-04','%','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:a1c');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('PSA',1.5,NULL,'ng/mL',NULL,NULL,'2025-06-04T12:00:00.000Z','workbook-seed','ng/mL',CURRENT_TIMESTAMP,'lab:2025-06-04:psa');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:psa',1.5,NULL,'ng/mL','2025-06-04T12:00:00.000Z','2025-06-04','ng/mL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2025-06-04:psa');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Fasting Status',NULL,'Non-fasted','',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','Historical laboratory timeline',CURRENT_TIMESTAMP,'lab:2026-07-08:fasting-status');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Total Cholesterol',255,NULL,'mg/dL',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2026-07-08:total-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:total-cholesterol',255,NULL,'mg/dL','2026-07-08T12:00:00.000Z','2026-07-08','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:total-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('LDL Cholesterol',178,NULL,'mg/dL',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2026-07-08:ldl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:ldl-cholesterol',178,NULL,'mg/dL','2026-07-08T12:00:00.000Z','2026-07-08','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:ldl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('HDL Cholesterol',58,NULL,'mg/dL',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2026-07-08:hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:hdl-cholesterol',58,NULL,'mg/dL','2026-07-08T12:00:00.000Z','2026-07-08','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Triglycerides',84,NULL,'mg/dL',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2026-07-08:triglycerides');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:triglycerides',84,NULL,'mg/dL','2026-07-08T12:00:00.000Z','2026-07-08','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:triglycerides');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('Non-HDL Cholesterol',197,NULL,'mg/dL',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','mg/dL',CURRENT_TIMESTAMP,'lab:2026-07-08:non-hdl-cholesterol');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:non-hdl-cholesterol',197,NULL,'mg/dL','2026-07-08T12:00:00.000Z','2026-07-08','mg/dL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:non-hdl-cholesterol');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('A1c',5.5,NULL,'%',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','%',CURRENT_TIMESTAMP,'lab:2026-07-08:a1c');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:a1c',5.5,NULL,'%','2026-07-08T12:00:00.000Z','2026-07-08','%','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:a1c');
    INSERT OR IGNORE INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES ('PSA',1.03,NULL,'ng/mL',NULL,NULL,'2026-07-08T12:00:00.000Z','workbook-seed','ng/mL',CURRENT_TIMESTAMP,'lab:2026-07-08:psa');
    INSERT OR IGNORE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES ('biomarker:psa',1.03,NULL,'ng/mL','2026-07-08T12:00:00.000Z','2026-07-08','ng/mL','workbook-seed',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'lab-metric:2026-07-08:psa');
  `}
,  {version:99,name:'complete_2026_laboratory_panel_and_align_labs_ui',sql:`
    ALTER TABLE lab_results ADD COLUMN comparison_operator TEXT;
    ALTER TABLE lab_results ADD COLUMN panel_name TEXT;
    ALTER TABLE lab_results ADD COLUMN fasting_context TEXT;
    ALTER TABLE lab_results ADD COLUMN calculation_method TEXT;
    DELETE FROM lab_results WHERE substr(collected_at,1,10)='2026-07-08';
    DELETE FROM health_metrics WHERE metric_type LIKE 'biomarker:%' AND local_date='2026-07-08';
    INSERT INTO lab_results(biomarker,value,text_value,unit,reference_low,reference_high,comparison_operator,panel_name,collected_at,fasting_context,calculation_method,source,notes,source_record_id,created_at) VALUES
      ('Total Cholesterol',255,NULL,'mg/dL',NULL,200,'<','Lipid panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:total-cholesterol',CURRENT_TIMESTAMP),
      ('HDL Cholesterol',58,NULL,'mg/dL',40,NULL,'>=','Lipid panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:hdl-cholesterol',CURRENT_TIMESTAMP),
      ('Triglycerides',84,NULL,'mg/dL',NULL,150,'<','Lipid panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:triglycerides',CURRENT_TIMESTAMP),
      ('LDL Cholesterol',178,NULL,'mg/dL',NULL,100,'<','Lipid panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:ldl-cholesterol',CURRENT_TIMESTAMP),
      ('Cholesterol/HDL Ratio',4.4,NULL,'calculated',NULL,5.0,'<','Lipid panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:cholesterol-hdl-ratio',CURRENT_TIMESTAMP),
      ('Non-HDL Cholesterol',197,NULL,'mg/dL',NULL,130,'<','Lipid panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:non-hdl-cholesterol',CURRENT_TIMESTAMP),
      ('Glucose',99,NULL,'mg/dL',65,139,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:glucose',CURRENT_TIMESTAMP),
      ('Urea Nitrogen / BUN',18,NULL,'mg/dL',7,25,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:urea-nitrogen-bun',CURRENT_TIMESTAMP),
      ('Creatinine',1.0,NULL,'mg/dL',0.7,1.35,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:creatinine',CURRENT_TIMESTAMP),
      ('eGFR, Creatinine-Based',85,NULL,'mL/min/1.73 m²',60,NULL,'>=','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting','creatinine-based','quest-2026','Quest July 8, 2026 report','lab:2026-07-08:egfr-creatinine-based',CURRENT_TIMESTAMP),
      ('BUN/Creatinine Ratio',NULL,'Not reported','calculated',6,22,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:bun-creatinine-ratio',CURRENT_TIMESTAMP),
      ('Sodium',139,NULL,'mmol/L',135,146,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:sodium',CURRENT_TIMESTAMP),
      ('Potassium',4.5,NULL,'mmol/L',3.5,5.3,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:potassium',CURRENT_TIMESTAMP),
      ('Chloride',104,NULL,'mmol/L',98,110,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:chloride',CURRENT_TIMESTAMP),
      ('Carbon Dioxide',25,NULL,'mmol/L',20,32,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:carbon-dioxide',CURRENT_TIMESTAMP),
      ('Calcium',9.4,NULL,'mg/dL',8.6,10.3,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:calcium',CURRENT_TIMESTAMP),
      ('Total Protein',7.1,NULL,'g/dL',6.1,8.1,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:total-protein',CURRENT_TIMESTAMP),
      ('Albumin',4.5,NULL,'g/dL',3.6,5.1,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:albumin',CURRENT_TIMESTAMP),
      ('Globulin',2.6,NULL,'g/dL',1.9,3.7,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:globulin',CURRENT_TIMESTAMP),
      ('Albumin/Globulin Ratio',1.7,NULL,'calculated',1.0,2.5,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:albumin-globulin-ratio',CURRENT_TIMESTAMP),
      ('Total Bilirubin',0.6,NULL,'mg/dL',0.2,1.2,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:total-bilirubin',CURRENT_TIMESTAMP),
      ('Alkaline Phosphatase',53,NULL,'U/L',35,144,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:alkaline-phosphatase',CURRENT_TIMESTAMP),
      ('AST',17,NULL,'U/L',10,35,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:ast',CURRENT_TIMESTAMP),
      ('ALT',17,NULL,'U/L',9,46,'between','Comprehensive metabolic panel','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:alt',CURRENT_TIMESTAMP),
      ('Hemoglobin A1C',5.5,NULL,'%',NULL,5.7,'<','Additional tests','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:hemoglobin-a1c',CURRENT_TIMESTAMP),
      ('Cystatin C',0.91,NULL,'mg/L',0.52,1.2,'between','Additional tests','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:cystatin-c',CURRENT_TIMESTAMP),
      ('eGFR, Cystatin-C-Based',87,NULL,'mL/min/1.73 m²',60,NULL,'>=','Additional tests','2026-07-08T12:00:00.000Z','Non-fasting','cystatin-C-based','quest-2026','Quest July 8, 2026 report','lab:2026-07-08:egfr-cystatin-c-based',CURRENT_TIMESTAMP),
      ('PSA, Total',1.03,NULL,'ng/mL',NULL,4.0,'<=','Additional tests','2026-07-08T12:00:00.000Z','Non-fasting',NULL,'quest-2026','Quest July 8, 2026 report','lab:2026-07-08:psa-total',CURRENT_TIMESTAMP);
    DELETE FROM lab_results WHERE id NOT IN (SELECT MIN(id) FROM lab_results GROUP BY lower(replace(replace(biomarker,'-',' '),'_',' ')),substr(collected_at,1,10),COALESCE(value,-999999),COALESCE(text_value,''));
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.99','2026-08-01','141599',99,'Laboratory Panel Completion & Labs UI','2026-08-01T11:15:00-04:00');
  `},
  {version:100,name:'Health Editor Replacement, Timeline Deletion & Labs Cards',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.100','2026-08-01','1415100',100,'Health Editor Replacement, Timeline Deletion & Labs Cards','2026-08-01T12:15:00-04:00');
  `},
  {version:101,name:'Scaled Laboratory Range Visualization',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.101','2026-08-01','1415101',101,'Scaled Laboratory Range Visualization','2026-08-01T12:35:00-04:00');
  `},
  {version:102,name:'Labs Thresholds and Adaptive Recommendations',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.102','2026-08-01','1415102',102,'Labs Thresholds and Adaptive Recommendations','2026-08-01T13:30:00-04:00');
  `},
  {version:103,name:'Menu Copy Planning',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.104','2026-08-01','1415104',104,'Menu Copy Build Hotfix','2026-08-01T18:20:00-04:00');
  `},
  {version:104,name:'Workflow Stability and Canonical Restaurant Names',sql:`
    UPDATE restaurant_meals
       SET restaurant_name=(SELECT r.name FROM restaurants r WHERE r.restaurant_id=restaurant_meals.restaurant_id),
           updated_at=CURRENT_TIMESTAMP
     WHERE EXISTS (SELECT 1 FROM restaurants r WHERE r.restaurant_id=restaurant_meals.restaurant_id)
       AND COALESCE(restaurant_name,'')<>COALESCE((SELECT r.name FROM restaurants r WHERE r.restaurant_id=restaurant_meals.restaurant_id),'');
    UPDATE planned_meals
       SET restaurant_name=(SELECT r.name FROM restaurant_meals rm JOIN restaurants r ON r.restaurant_id=rm.restaurant_id WHERE rm.id=planned_meals.restaurant_meal_id),
           updated_at=CURRENT_TIMESTAMP
     WHERE status='planned' AND restaurant_meal_id IS NOT NULL
       AND EXISTS (SELECT 1 FROM restaurant_meals rm JOIN restaurants r ON r.restaurant_id=rm.restaurant_id WHERE rm.id=planned_meals.restaurant_meal_id);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.106','2026-08-02','1415106',105,'Canonical Recipe & Transaction Consistency','2026-08-02T11:45:00-04:00');
  `},
  {version:105,name:'Canonical Recipe Composition',sql:`
    DELETE FROM recipes
     WHERE recipe_id IN (
       SELECT CAST(source_id AS TEXT) FROM meal_definitions
        WHERE source_type IN ('recipe','legacy_recipe') AND COALESCE(source_id,'')<>''
     );
    INSERT INTO recipes(recipe_id,recipe_name,ingredient_name,amount,unit,ingredient_type,ingredient_id,inventory_status,archived,archived_at,classification,usage_designation,category,ingredient_only,notes,favorite)
    SELECT CAST(md.source_id AS TEXT),md.title,mc.component_name,mc.amount,mc.unit,COALESCE(mc.component_type,'food'),mc.component_id,'linked',
           COALESCE(md.archived,0),md.archived_at,'recipe',COALESCE(md.usage_designation,'standalone'),COALESCE(md.category,'Any'),COALESCE(md.ingredient_only,0),md.notes,COALESCE(md.favorite,0)
      FROM meal_definitions md
      JOIN meal_components mc ON mc.meal_id=md.meal_id
     WHERE md.source_type IN ('recipe','legacy_recipe') AND COALESCE(md.source_id,'')<>''
     ORDER BY md.meal_id,mc.sort_order,mc.id;
    UPDATE planned_meals
       SET source_type='recipe',
           food_id='recipe:'||REPLACE(COALESCE(NULLIF(food_id,''),meal_definition_id),'recipe:',''),
           meal_definition_id='recipe:'||REPLACE(COALESCE(NULLIF(food_id,''),meal_definition_id),'recipe:',''),
           updated_at=CURRENT_TIMESTAMP
     WHERE status='planned' AND (source_type IN ('recipe','meal') OR food_id LIKE 'recipe:%' OR meal_definition_id LIKE 'recipe:%')
       AND EXISTS (
         SELECT 1 FROM meal_definitions md
          WHERE md.meal_id='recipe:'||REPLACE(COALESCE(NULLIF(planned_meals.food_id,''),planned_meals.meal_definition_id),'recipe:','')
            AND md.source_type IN ('recipe','legacy_recipe')
       );
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at)
    VALUES ('1.4.15.107','2026-08-02','1415107',106,'Canonical Recipe Composition','2026-08-02T12:15:00-04:00');
  `},
  {version:106,name:'Podcasts Foundation',sql:`
    CREATE TABLE IF NOT EXISTS podcasts (podcast_id TEXT PRIMARY KEY,title TEXT NOT NULL,publisher TEXT,description TEXT,artwork_url TEXT,rss_feed_url TEXT,apple_podcasts_url TEXT,website_url TEXT,categories TEXT,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_podcasts_title ON podcasts(title COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_podcasts_active ON podcasts(active,title COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS podcast_episodes (episode_id TEXT PRIMARY KEY,podcast_id TEXT NOT NULL,title TEXT NOT NULL,description TEXT,published_at TEXT,duration_seconds INTEGER,enclosure_url TEXT,apple_podcasts_url TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE);
    CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast ON podcast_episodes(podcast_id,published_at DESC);
    CREATE TABLE IF NOT EXISTS podcast_notes (note_id TEXT PRIMARY KEY,podcast_id TEXT NOT NULL,note TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS podcast_tags (podcast_id TEXT NOT NULL,tag TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(podcast_id,tag),FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.0','2026-08-02','141600',106,'Podcasts Foundation','2026-08-02T13:30:00-04:00');
  `},

  {version:107,name:'Podcast Directory Search',sql:`
    ALTER TABLE podcasts ADD COLUMN directory_source TEXT DEFAULT 'manual';
    ALTER TABLE podcasts ADD COLUMN directory_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_podcasts_directory_id ON podcasts(directory_source,directory_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_podcasts_active_feed ON podcasts(LOWER(rss_feed_url)) WHERE active=1 AND rss_feed_url IS NOT NULL AND TRIM(rss_feed_url)<>'';
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.1','2026-08-02','141601',107,'Podcast Directory Search','2026-08-02T14:30:00-04:00');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.2','2026-08-02','141602',107,'Podcast Episodes','2026-08-02T14:55:00-04:00');
  `},
  {version:108,name:'Podcast Player and Progress',sql:`
    CREATE TABLE IF NOT EXISTS podcast_playback (
      episode_key TEXT PRIMARY KEY,
      podcast_id TEXT NOT NULL,
      episode_guid TEXT,
      episode_title TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      artwork_url TEXT,
      duration_seconds REAL NOT NULL DEFAULT 0,
      position_seconds REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unplayed' CHECK(status IN ('unplayed','in_progress','played')),
      started_at TEXT,
      last_played_at TEXT,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_podcast_playback_podcast ON podcast_playback(podcast_id,status,last_played_at DESC);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.3','2026-08-02','141603',108,'Podcast Player & External Launch Repair','2026-08-02T15:20:00-04:00');
  `},

  {version:109,name:'Podcast Player Preferences',sql:`
    CREATE TABLE IF NOT EXISTS podcast_player_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO podcast_player_settings(setting_key,setting_value,updated_at) VALUES ('playback_speed','1.0','2026-08-02T15:45:00-04:00');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.4','2026-08-02','141604',109,'Player Preferences & Playback Experience','2026-08-02T15:45:00-04:00');
  `},

  {version:110,name:'Podcast Up Next Queue',sql:`
    CREATE TABLE IF NOT EXISTS podcast_up_next (
      queue_id TEXT PRIMARY KEY,
      episode_key TEXT NOT NULL UNIQUE,
      podcast_id TEXT NOT NULL,
      podcast_title TEXT NOT NULL,
      episode_guid TEXT,
      episode_title TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      artwork_url TEXT,
      duration_seconds REAL DEFAULT 0,
      queue_position INTEGER NOT NULL,
      added_at TEXT NOT NULL,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_podcast_up_next_position ON podcast_up_next(queue_position,added_at);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.5','2026-08-02','141605',110,'Podcast Up Next Queue','2026-08-02T22:05:00-04:00');
  `},


  {version:111,name:'Podcast Playback Stability',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.6','2026-08-03','141606',111,'Podcast Playback Stability & Queue Reliability','2026-08-03T06:15:00-04:00');
  `},

  {version:112,name:'Podcast Settings Hierarchy and Playback Recovery',sql:`
    CREATE TABLE IF NOT EXISTS podcast_preferences (
      podcast_id TEXT PRIMARY KEY,
      playback_speed_override REAL,
      show_latest_only INTEGER NOT NULL DEFAULT 0 CHECK(show_latest_only IN (0,1)),
      updated_at TEXT NOT NULL,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS podcast_player_errors (
      error_id INTEGER PRIMARY KEY AUTOINCREMENT,
      occurred_at TEXT NOT NULL,
      message TEXT NOT NULL,
      stack TEXT,
      episode_key TEXT,
      podcast_id TEXT,
      position_seconds REAL,
      duration_seconds REAL,
      queue_size INTEGER DEFAULT 0
    );
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.7','2026-08-03','141607',112,'Podcast Settings Hierarchy & Playback Recovery','2026-08-03T06:45:00-04:00');
  `},


  {version:113,name:'Podcast Organization and Automation',sql:`
    ALTER TABLE podcasts ADD COLUMN display_order INTEGER;
    ALTER TABLE podcast_preferences ADD COLUMN oldest_first INTEGER NOT NULL DEFAULT 0 CHECK(oldest_first IN (0,1));
    ALTER TABLE podcast_preferences ADD COLUMN auto_add_up_next INTEGER NOT NULL DEFAULT 0 CHECK(auto_add_up_next IN (0,1));
    UPDATE podcasts SET display_order=(SELECT COUNT(*) FROM podcasts p2 WHERE p2.active=1 AND (LOWER(p2.title)<LOWER(podcasts.title) OR (LOWER(p2.title)=LOWER(podcasts.title) AND p2.podcast_id<=podcasts.podcast_id))) WHERE active=1 AND display_order IS NULL;
    CREATE INDEX IF NOT EXISTS idx_podcasts_display_order ON podcasts(active,display_order,title COLLATE NOCASE);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.8','2026-08-03','141608',113,'Podcast Organization & Automation','2026-08-03T07:45:00-04:00');
  `},

  {version:114,name:'Podcast Library Experience',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.9','2026-08-03','141609',114,'Podcast Library Experience','2026-08-03T08:00:00-04:00');
  `},

  {version:115,name:'Podcast Playlists Foundation',sql:`
    CREATE TABLE IF NOT EXISTS podcast_playlists (
      playlist_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      autoplay INTEGER NOT NULL DEFAULT 0 CHECK(autoplay IN (0,1)),
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS podcast_playlist_subscriptions (
      playlist_id TEXT NOT NULL,
      podcast_id TEXT NOT NULL,
      subscribed INTEGER NOT NULL DEFAULT 1 CHECK(subscribed IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(playlist_id,podcast_id)
    );
    CREATE TABLE IF NOT EXISTS podcast_playlist_items (
      playlist_item_id TEXT PRIMARY KEY,
      playlist_id TEXT NOT NULL,
      episode_key TEXT NOT NULL,
      podcast_id TEXT NOT NULL,
      podcast_title TEXT,
      episode_guid TEXT,
      episode_title TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      artwork_url TEXT,
      duration_seconds REAL DEFAULT 0,
      playlist_position INTEGER NOT NULL,
      added_at TEXT NOT NULL,
      UNIQUE(playlist_id,episode_key)
    );
    CREATE INDEX IF NOT EXISTS idx_podcast_playlist_items_order ON podcast_playlist_items(playlist_id,playlist_position,added_at);
    INSERT OR IGNORE INTO podcast_playlists(playlist_id,name,autoplay,display_order,created_at,updated_at) VALUES
      ('up-next','Up Next',1,1,datetime('now'),datetime('now')),
      ('stories','Stories',0,2,datetime('now'),datetime('now'));
    INSERT OR IGNORE INTO podcast_playlist_subscriptions(playlist_id,podcast_id,subscribed,created_at,updated_at)
      SELECT 'up-next',podcast_id,1,datetime('now'),datetime('now') FROM podcast_preferences WHERE COALESCE(auto_add_up_next,0)=1;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.10','2026-08-03','141610',115,'Podcast Playlists Foundation','2026-08-03T08:30:00-04:00');
  `},


  {version:116,name:'Podcast Playlist Reconciliation',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.11','2026-08-03','141611',116,'Podcast Playlist Reconciliation','2026-08-03T08:42:00-04:00');
  `},


  {version:117,name:'Playlist Filters and Automatic Reconciliation',sql:`
    ALTER TABLE podcast_playlists ADD COLUMN enforce_master_order INTEGER NOT NULL DEFAULT 0 CHECK(enforce_master_order IN (0,1));
    ALTER TABLE podcast_playlists ADD COLUMN enforce_variety INTEGER NOT NULL DEFAULT 0 CHECK(enforce_variety IN (0,1));
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.12','2026-08-03','141612',117,'Playlist Filters & Automatic Reconciliation','2026-08-03T09:20:00-04:00');
  `},

  {version:118,name:'Podcast OPML Import',sql:`
    CREATE TABLE IF NOT EXISTS podcast_import_history (import_id INTEGER PRIMARY KEY AUTOINCREMENT,file_name TEXT,subscriptions_found INTEGER NOT NULL DEFAULT 0,imported_count INTEGER NOT NULL DEFAULT 0,duplicate_count INTEGER NOT NULL DEFAULT 0,failed_count INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.13','2026-08-03','141613',118,'Podcast Import','2026-08-03T10:15:00-04:00');
  `},

  {version:119,name:'iPhone OPML File Selection Hotfix',sql:`
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.14','2026-08-03','141614',119,'iPhone OPML File Selection Hotfix','2026-08-03T10:30:00-04:00');
  `},

  {version:120,name:'Podcast Refresh Duration and Activity',sql:`
    ALTER TABLE podcasts ADD COLUMN last_episode_at TEXT;
    ALTER TABLE podcasts ADD COLUMN last_refreshed_at TEXT;
    INSERT OR IGNORE INTO podcast_player_settings(setting_key,setting_value,updated_at) VALUES ('active_threshold_months','6','2026-08-03T10:50:00-04:00');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.15','2026-08-03','141615',120,'Podcast Refresh, Playlist Duration & Activity Status','2026-08-03T10:50:00-04:00');
  `},

  {version:121,name:'Podcast Metadata and Playback Consistency',sql:`
    ALTER TABLE podcasts ADD COLUMN feed_health_status TEXT;
    ALTER TABLE podcasts ADD COLUMN feed_error TEXT;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.16','2026-08-03','141616',121,'Podcast Metadata, Playback Controls & Playlist Consistency','2026-08-03T13:20:00-04:00');
  `},

  {version:122,name:'Podcast Subscription Lifecycle and Metadata Repair',sql:`
    ALTER TABLE podcasts ADD COLUMN metadata_incomplete INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE podcasts ADD COLUMN metadata_last_attempt_at TEXT;
    UPDATE podcasts SET metadata_incomplete=CASE WHEN TRIM(COALESCE(title,''))='' OR TRIM(COALESCE(publisher,''))='' OR TRIM(COALESCE(artwork_url,''))='' OR TRIM(COALESCE(website_url,''))='' THEN 1 ELSE 0 END;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.17','2026-08-03','141617',122,'Podcast Subscription Lifecycle & Metadata Repair','2026-08-03T14:10:00-04:00');
  `},

  {version:123,name:'Podcast Drama and Episode Details',sql:`
    INSERT OR IGNORE INTO podcast_playlists(playlist_id,name,autoplay,display_order,created_at,updated_at) VALUES ('drama','Drama',0,3,datetime('now'),datetime('now'));
    ALTER TABLE podcast_playlist_items ADD COLUMN published_at TEXT;
    ALTER TABLE podcast_playlist_items ADD COLUMN publisher TEXT;
    ALTER TABLE podcast_playlist_items ADD COLUMN description TEXT;
    ALTER TABLE podcast_playlist_items ADD COLUMN season TEXT;
    ALTER TABLE podcast_playlist_items ADD COLUMN episode_number TEXT;
    ALTER TABLE podcast_playlist_items ADD COLUMN explicit INTEGER;
    ALTER TABLE podcast_playlist_items ADD COLUMN episode_url TEXT;
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.18','2026-08-03','141618',123,'Podcast Drama, Organization & Episode Details','2026-08-03T15:06:00-04:00');
  `},

  {version:124,name:'Podcast Stability Paging and Publication Metadata',sql:`
    ALTER TABLE podcast_up_next ADD COLUMN published_at TEXT;
    UPDATE podcast_up_next SET published_at=(SELECT e.published_at FROM podcast_episodes e WHERE e.episode_id=podcast_up_next.episode_key LIMIT 1) WHERE TRIM(COALESCE(published_at,''))='';
    UPDATE podcast_playlist_items SET published_at=(SELECT e.published_at FROM podcast_episodes e WHERE e.episode_id=podcast_playlist_items.episode_key LIMIT 1) WHERE TRIM(COALESCE(published_at,''))='';
    INSERT OR IGNORE INTO podcast_player_settings(setting_key,setting_value,updated_at) VALUES ('playlist_page_size','50','2026-08-03T20:15:00-04:00');
    INSERT OR REPLACE INTO release_metadata(version,release_date,build_id,schema_version,title,created_at) VALUES ('1.4.16.28','2026-08-03','141628',124,'Podcast Stability, Paging & Metadata Repair','2026-08-03T20:15:00-04:00');
  `},

];
const canonicalNutrientColumns=Object.freeze(Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,'REAL'])));

const canonicalSchema={
  foods:{
    create:`CREATE TABLE IF NOT EXISTS foods (food_id TEXT PRIMARY KEY, name TEXT, category TEXT, default_serving REAL, unit TEXT, calories REAL, protein REAL, carbs REAL, fiber REAL, fat REAL, saturated_fat REAL, sodium REAL, potassium REAL, notes TEXT)`,
    columns:{food_id:'TEXT',name:'TEXT',category:'TEXT',default_serving:'REAL',unit:'TEXT',...canonicalNutrientColumns,notes:'TEXT',nutrition_known:'INTEGER DEFAULT 0',archived:'INTEGER DEFAULT 0',archived_at:'TEXT',classification:"TEXT DEFAULT 'ingredient'",usage_designation:"TEXT DEFAULT 'component'",ingredient_only:'INTEGER DEFAULT 0',brand:'TEXT',manufacturer:'TEXT',barcode:'TEXT',serving_description:'TEXT',servings_per_container:'REAL',package_quantity:'TEXT'},
    aliases:{name:['food','food_name']}
  },
  meals:{create:`CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, eaten_at TEXT, meal_type TEXT, food_id TEXT, food_name TEXT, amount REAL, unit TEXT)`,columns:{...canonicalNutrientColumns},aliases:{}},
  planned_meals:{create:`CREATE TABLE IF NOT EXISTS planned_meals (id INTEGER PRIMARY KEY AUTOINCREMENT, planned_at TEXT, planned_local_date TEXT, food_id TEXT, food_name TEXT, amount REAL, unit TEXT)`,columns:{...canonicalNutrientColumns},aliases:{}},
  restaurant_meals:{create:`CREATE TABLE IF NOT EXISTS restaurant_meals (id INTEGER PRIMARY KEY AUTOINCREMENT, meal_name TEXT)`,columns:{...canonicalNutrientColumns},aliases:{}},
  meal_definitions:{create:`CREATE TABLE IF NOT EXISTS meal_definitions (meal_id TEXT PRIMARY KEY, title TEXT)`,columns:{...canonicalNutrientColumns},aliases:{}},
  meal_components:{create:`CREATE TABLE IF NOT EXISTS meal_components (id INTEGER PRIMARY KEY AUTOINCREMENT, meal_id TEXT, component_name TEXT)`,columns:{...canonicalNutrientColumns},aliases:{}},
  pantry:{
    create:`CREATE TABLE IF NOT EXISTS pantry (id INTEGER PRIMARY KEY AUTOINCREMENT, pantry_id TEXT, item TEXT, food_id TEXT, brand TEXT, on_hand TEXT, quantity REAL, unit TEXT, opened TEXT, opened_date TEXT, expiration TEXT, location TEXT, status TEXT, priority TEXT, category TEXT, notes TEXT, servings_per_package REAL)`,
    columns:{pantry_id:'TEXT',item:'TEXT',food_id:'TEXT',brand:'TEXT',on_hand:'TEXT',quantity:'REAL',unit:'TEXT',opened:'TEXT',opened_date:'TEXT',expiration:'TEXT',location:'TEXT',status:'TEXT',priority:'TEXT',category:'TEXT',notes:'TEXT',servings_per_package:'REAL',purchase_date:'TEXT',verified_at:'TEXT',storage_type:'TEXT',manufacturer_shelf_life_days:'REAL',opened_shelf_life_days:'REAL',freshness_observation:'TEXT',purchase_price:'REAL',retailer:'TEXT',original_servings:'REAL',quantity_accuracy:'TEXT',package_count:'REAL',package_type:'TEXT',container_size:'REAL',container_unit:'TEXT',unopened_packages:'REAL',partial_package_quantity:'REAL',freshness_status:'TEXT',source_recipe_id:'TEXT',discontinued:'INTEGER DEFAULT 0',product_link:'TEXT',product_image_url:'TEXT',product_image_status:'TEXT',product_image_checked_at:'TEXT',product_image_error:'TEXT'},
    aliases:{item:['name','food','pantry_item'],food_id:['canonical_food_id'],expiration:['effective_expiry','best_by_expiration']}
  },
  recipes:{
    create:`CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, recipe_id TEXT, recipe_name TEXT, ingredient_name TEXT, amount REAL, unit TEXT, ingredient_type TEXT, ingredient_id TEXT, inventory_status TEXT)`,
    columns:{recipe_id:'TEXT',recipe_name:'TEXT',ingredient_name:'TEXT',amount:'REAL',unit:'TEXT',ingredient_type:'TEXT',ingredient_id:'TEXT',inventory_status:'TEXT',archived:'INTEGER DEFAULT 0',archived_at:'TEXT',classification:"TEXT DEFAULT 'recipe'",usage_designation:"TEXT DEFAULT 'standalone'",category:"TEXT DEFAULT 'Any'",ingredient_only:'INTEGER DEFAULT 0',notes:'TEXT',favorite:'INTEGER DEFAULT 0'},
    aliases:{recipe_name:['recipe','name'],ingredient_name:['ingredient','food_name']}
  },
  health_metrics:{
    create:`CREATE TABLE IF NOT EXISTS health_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, metric_type TEXT NOT NULL, value_primary REAL, value_secondary REAL, unit TEXT, measured_at TEXT NOT NULL, local_date TEXT NOT NULL, notes TEXT, source TEXT DEFAULT 'manual', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    columns:{metric_type:'TEXT',value_primary:'REAL',value_secondary:'REAL',unit:'TEXT',measured_at:'TEXT',local_date:'TEXT',notes:'TEXT',source:"TEXT DEFAULT 'manual'",created_at:'TEXT',updated_at:'TEXT',source_record_id:'TEXT'},
    aliases:{}
  },
  import_history:{
    create:`CREATE TABLE IF NOT EXISTS import_history (id INTEGER PRIMARY KEY AUTOINCREMENT, imported_at TEXT, file_name TEXT, foods INTEGER DEFAULT 0, pantry INTEGER DEFAULT 0, recipes INTEGER DEFAULT 0, warnings INTEGER DEFAULT 0, status TEXT DEFAULT 'success', duration_ms INTEGER DEFAULT 0, error_message TEXT)`,
    columns:{imported_at:'TEXT',file_name:'TEXT',foods:'INTEGER DEFAULT 0',pantry:'INTEGER DEFAULT 0',recipes:'INTEGER DEFAULT 0',warnings:'INTEGER DEFAULT 0',status:"TEXT DEFAULT 'success'",duration_ms:'INTEGER DEFAULT 0',error_message:'TEXT'},
    aliases:{}
  }
};

let idbWriteChain=Promise.resolve();let idbTransactionSequence=0;const isIndexedDbInternalError=error=>/internal error|UnknownError|InvalidStateError/i.test(String(error?.message||error?.name||error||''));async function withSerializedIdbWrite(operation){const transactionId=`idb-${Date.now()}-${++idbTransactionSequence}`;const execute=async()=>{let lastError;for(let attempt=1;attempt<=3;attempt+=1){try{return await operation({transactionId,attempt})}catch(error){lastError=error;if(!isIndexedDbInternalError(error)||attempt===3)throw error;await new Promise(resolve=>setTimeout(resolve,50*attempt))}}throw lastError};const next=idbWriteChain.then(execute,execute);idbWriteChain=next.catch(()=>{});return next}
function idbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(STORAGE_DB,2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('files'))req.result.createObjectStore('files');if(!req.result.objectStoreNames.contains('backups'))req.result.createObjectStore('backups')};req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result)})}
async function saveBytes(bytes){return withSerializedIdbWrite(async({transactionId,attempt})=>{const store=await idbOpen();return new Promise((resolve,reject)=>{let settled=false;const tx=store.transaction('files','readwrite');const request=tx.objectStore('files').put(bytes,DB_KEY);request.onerror=()=>{if(!settled){settled=true;store.close();reject(Object.assign(request.error||new Error('IndexedDB write failed'),{transactionId,objectStore:'files',operation:'put',attempt}))}};tx.oncomplete=()=>{if(!settled){settled=true;store.close();resolve({transactionId,attempt,commitResult:'committed'})}};tx.onabort=tx.onerror=()=>{if(!settled){settled=true;store.close();reject(Object.assign(tx.error||new Error('IndexedDB transaction failed'),{transactionId,objectStore:'files',operation:'commit',attempt}))}}})})}
async function loadBytes(){const store=await idbOpen();return new Promise((resolve,reject)=>{const tx=store.transaction('files','readonly');const get=tx.objectStore('files').get(DB_KEY);get.onsuccess=()=>{store.close();resolve(get.result||null)};get.onerror=()=>{store.close();reject(get.error)}})}
async function saveSafetyBytes(bytes,key){const store=await idbOpen();return new Promise((resolve,reject)=>{const tx=store.transaction('backups','readwrite');tx.objectStore('backups').put(bytes,key);tx.oncomplete=()=>{store.close();resolve()};tx.onerror=()=>{store.close();reject(tx.error)}})}
export async function createSafetyBackup(reason='Safety backup'){
  if(!db)return null;
  const bytes=db.export();const key=`fizz-backup-${new Date().toISOString()}`;
  await saveSafetyBytes(bytes,key);
  try{db.run('INSERT INTO safety_backup_log(backup_key,reason,created_at,byte_size,status) VALUES (?,?,?,?,?)',[key,reason,new Date().toISOString(),bytes.byteLength,'available']);await persist()}catch{}
  return key;
}
export function normalizeHistoricalMeals(){
  if(!hasTable('meals'))return {repaired:0};
  const before=Number(query("SELECT COUNT(*) count FROM meals WHERE consumed_local_date IS NULL OR consumed_local_date='' OR consumed_local_date NOT LIKE '____-__-__'")[0]?.count||0);
  db.run(`UPDATE meals SET consumed_local_date=substr(eaten_at,1,10) WHERE (consumed_local_date IS NULL OR consumed_local_date='' OR consumed_local_date NOT LIKE '____-__-__') AND eaten_at IS NOT NULL`);
  db.run(`DELETE FROM meal_date_index`);
  db.run(`INSERT INTO meal_date_index(meal_date,consumed_count,planned_count,updated_at)
    SELECT d.meal_date,SUM(d.consumed_count),SUM(d.planned_count),CURRENT_TIMESTAMP FROM (
      SELECT consumed_local_date meal_date,COUNT(*) consumed_count,0 planned_count FROM meals WHERE consumed_local_date IS NOT NULL GROUP BY consumed_local_date
      UNION ALL SELECT planned_local_date,0,COUNT(*) FROM planned_meals WHERE status='planned' GROUP BY planned_local_date
    ) d WHERE d.meal_date IS NOT NULL GROUP BY d.meal_date`);
  return {repaired:before};
}
function safeIdentifier(value){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))throw new Error(`Unsafe SQL identifier: ${value}`);return value}
function hasTable(name){return query("SELECT name FROM sqlite_master WHERE type='table' AND name=?",[name]).length>0}
function tableInfo(table){if(!hasTable(table))return [];return query(`PRAGMA table_info(${safeIdentifier(table)})`)}
function tableColumns(table){return tableInfo(table).map(r=>String(r.name))}
function columnExists(table,column){return tableColumns(table).includes(column)}


function rebuildRecipesToCanonical(){
  if(!hasTable('recipes'))return {rebuilt:false,copied:0};
  const info=tableInfo('recipes');
  const cols=new Set(info.map(r=>String(r.name)));
  const hasLegacyRequired=info.some(r=>String(r.name)==='name'&&Number(r.notnull)===1);
  if(!hasLegacyRequired)return {rebuilt:false,copied:0};
  const pick=(...names)=>names.find(n=>cols.has(n));
  const expr=(names,fallback='NULL')=>{const n=pick(...names);return n?safeIdentifier(n):fallback};
  db.run('DROP TABLE IF EXISTS recipes_canonical_v6');
  db.run(`CREATE TABLE recipes_canonical_v6 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id TEXT, recipe_name TEXT, ingredient_name TEXT, amount REAL, unit TEXT,
    ingredient_type TEXT, ingredient_id TEXT, inventory_status TEXT
  )`);
  const count=Number(query('SELECT COUNT(*) AS count FROM recipes')[0]?.count||0);
  if(count){
    db.run(`INSERT INTO recipes_canonical_v6(recipe_id,recipe_name,ingredient_name,amount,unit,ingredient_type,ingredient_id,inventory_status)
      SELECT ${expr(['recipe_id'])},
             COALESCE(${expr(['recipe_name','name','recipe'],"''")},''),
             COALESCE(${expr(['ingredient_name','ingredient','food_name'],"''")},''),
             ${expr(['amount'])},${expr(['unit'])},${expr(['ingredient_type'])},${expr(['ingredient_id'])},${expr(['inventory_status'])}
      FROM recipes`);
  }
  db.run('DROP TABLE recipes');
  db.run('ALTER TABLE recipes_canonical_v6 RENAME TO recipes');
  db.run('CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(recipe_name)');
  db.run('CREATE INDEX IF NOT EXISTS idx_recipes_id ON recipes(recipe_id)');
  return {rebuilt:true,copied:count};
}

export function reconcileImportSchema({apply=true}={}){
  const report={current:true,added:[],backfilled:[],tablesCreated:[],rebuilt:[],warnings:[]};
  if(apply){const recipeRepair=rebuildRecipesToCanonical();if(recipeRepair.rebuilt)report.rebuilt.push(`recipes (${recipeRepair.copied} rows preserved)`)}
  for(const [table,spec] of Object.entries(canonicalSchema)){
    if(!hasTable(table)){
      report.current=false;
      if(apply){db.run(spec.create);report.tablesCreated.push(table)}
      else report.warnings.push(`Missing table: ${table}`);
    }
    let columns=tableColumns(table);
    for(const [column,type] of Object.entries(spec.columns)){
      if(columns.includes(column))continue;
      report.current=false;
      if(apply){
        db.run(`ALTER TABLE ${safeIdentifier(table)} ADD COLUMN ${safeIdentifier(column)} ${type}`);
        report.added.push(`${table}.${column}`);
        columns.push(column);
      }else report.warnings.push(`Missing column: ${table}.${column}`);
    }
    if(apply){
      columns=tableColumns(table);
      for(const [target,aliases] of Object.entries(spec.aliases||{})){
        const source=aliases.find(alias=>columns.includes(alias));
        if(source&&columns.includes(target)){
          db.run(`UPDATE ${safeIdentifier(table)} SET ${safeIdentifier(target)}=${safeIdentifier(source)} WHERE (${safeIdentifier(target)} IS NULL OR TRIM(CAST(${safeIdentifier(target)} AS TEXT))='') AND ${safeIdentifier(source)} IS NOT NULL`);
          report.backfilled.push(`${table}.${target} ← ${source}`);
        }
      }
    }
  }
  if(apply){
    db.run('CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(recipe_name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_recipes_id ON recipes(recipe_id)');
  }
  report.current=report.added.length===0&&report.tablesCreated.length===0&&report.rebuilt.length===0&&report.warnings.length===0;
  return report;
}

function splitSqlStatements(sql){
  const statements=[];
  let current='';
  let quote=null;
  for(let i=0;i<String(sql||'').length;i++){
    const char=sql[i];
    const next=sql[i+1];
    current+=char;
    if(quote){
      if(char===quote){
        // SQLite escapes quote characters by doubling them.
        if(next===quote){current+=next;i++}
        else quote=null;
      }
      continue;
    }
    if(char==="'"||char==='"'||char==='`'){quote=char;continue}
    if(char===';'){
      const statement=current.slice(0,-1).trim();
      if(statement)statements.push(statement);
      current='';
    }
  }
  const trailing=current.trim();
  if(trailing)statements.push(trailing);
  return statements;
}
function runMigrationSql(sql){
  const statements=splitSqlStatements(String(sql||''));
  for(const statement of statements){
    try{db.run(statement)}catch(error){
      const message=String(error?.message||error).toLowerCase();
      // Older builds sometimes added a column before recording the migration.
      // Treat those already-applied DDL operations as successful.
      if(message.includes('duplicate column name')||message.includes('already exists'))continue;
      throw error;
    }
  }
}
function repairFeatureSchema(){
  // Repair databases that recorded a release migration before every feature table/column was created.
  // All statements are idempotent; duplicate-column and existing-index errors are intentionally ignored.
  for(const migration of migrations.filter(item=>item.version>=34)){
    if(migration.sql.trim())runMigrationSql(migration.sql);
  }
}
async function migrate(onProgress=()=>{}){
  onProgress('Checking database structure…');
  if(!hasTable('schema_migrations'))db.run('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)');
  const applied=new Set(query('SELECT version FROM schema_migrations').map(r=>Number(r.version)));
  const pending=migrations.filter(migration=>!applied.has(migration.version));
  for(let index=0;index<pending.length;index++){
    const migration=pending[index];
    onProgress(`Updating health database ${index+1} of ${pending.length}…`);
    const backup=db.export();
    try{
      db.run('BEGIN');
      if(migration.sql.trim())runMigrationSql(migration.sql);
      db.run('INSERT OR IGNORE INTO schema_migrations(version,name,applied_at) VALUES (?,?,?)',[migration.version,migration.name,new Date().toISOString()]);
      db.run('COMMIT');
    }catch(error){
      try{db.run('ROLLBACK')}catch{}
      db=new SQL.Database(new Uint8Array(backup));
      throw new Error(`Database migration ${migration.version} failed: ${error.message}`);
    }
  }
  const repairMarker=`feature_schema_repaired_v${TARGET_SCHEMA_VERSION}`;
  const alreadyRepaired=hasTable('settings')&&query('SELECT value FROM settings WHERE key=?',[repairMarker])[0]?.value==='1';
  const needsRepair=pending.length===0&&!alreadyRepaired;
  const backup=db.export();
  try{
    onProgress('Finalizing database structure…');
    db.run('BEGIN');
    if(needsRepair)repairFeatureSchema();
    reconcileImportSchema({apply:true});
    if(hasTable('settings'))db.run('INSERT OR REPLACE INTO settings(key,value) VALUES (?,?)',[repairMarker,'1']);
    db.run('COMMIT');
  }catch(error){try{db.run('ROLLBACK')}catch{}db=new SQL.Database(new Uint8Array(backup));throw new Error(`Database schema reconciliation failed: ${error.message}`)}
  if(hasTable('food_categories')){
    const requiredCategories=['Breakfast','Appetizer','Tapas','Soup','Salad','Entrée','Side','Snack','Dessert','Beverage','Alcohol','Condiment'];
    const storedCategories=query('SELECT display_name FROM food_categories WHERE active=1 ORDER BY sort_order').map(row=>row.display_name);
    const missing=requiredCategories.filter(name=>!storedCategories.includes(name));
    const unexpected=storedCategories.filter(name=>!requiredCategories.includes(name));
    if(missing.length||unexpected.length||storedCategories.length!==requiredCategories.length)throw new Error(`Canonical food category integrity failure. Missing: ${missing.join(', ')||'none'}. Unexpected: ${unexpected.join(', ')||'none'}.`);
  }
  if(hasTable('meal_date_index')){onProgress('Indexing meal history…');normalizeHistoricalMeals()}
  onProgress('Saving database…');
  await persist();
}
let openDatabasePromise=null;
export async function openDatabase({onProgress=()=>{}}={}){
  if(db){onProgress('Database ready');return db}
  if(openDatabasePromise)return openDatabasePromise;
  openDatabasePromise=(async()=>{
    onProgress('Loading database engine…');
    SQL=await initSqlJs({locateFile:()=>wasmUrl});
    onProgress('Opening saved health data…');
    const bytes=await loadBytes();
    db=bytes?new SQL.Database(new Uint8Array(bytes)):new SQL.Database();
    await migrate(onProgress);
    onProgress('Database ready');
    return db;
  })();
  try{return await openDatabasePromise}
  catch(error){db=null;throw error}
  finally{openDatabasePromise=null}
}
export async function persist(){if(db)await saveBytes(db.export())}
export async function resetDatabase(){db=new SQL.Database();await migrate();return db}
const normalizeBindValue=value=>{
  if(value===undefined)return null;
  if(value===null||typeof value==='string'||typeof value==='number')return value;
  if(typeof value==='boolean')return value?1:0;
  if(value instanceof Date)return value.toISOString();
  return String(value);
};
const normalizeParams=params=>Array.isArray(params)?params.map(normalizeBindValue):params;
export function query(sql,params=[]){const stmt=db.prepare(sql);stmt.bind(normalizeParams(params));const rows=[];while(stmt.step())rows.push(stmt.getAsObject());stmt.free();return rows}
export async function run(sql,params=[]){db.run(sql,normalizeParams(params));await persist()}
export async function transaction(callback){const backup=db.export();const savepoint=`fizz_${Date.now()}_${Math.random().toString(36).slice(2)}`;try{db.run(`SAVEPOINT ${savepoint}`);await callback({run:(sql,params=[])=>db.run(sql,normalizeParams(params)),query});db.run(`RELEASE SAVEPOINT ${savepoint}`);await persist()}catch(error){try{db.run(`ROLLBACK TO SAVEPOINT ${savepoint}`);db.run(`RELEASE SAVEPOINT ${savepoint}`)}catch{}db=new SQL.Database(new Uint8Array(backup));await persist();throw error}}
export async function prepareWorkbookImport(){const backup=db.export();try{await createSafetyBackup('Before workbook import');const report=reconcileImportSchema({apply:true});if(hasTable('meal_date_index'))normalizeHistoricalMeals();await persist();return report}catch(error){db=new SQL.Database(new Uint8Array(backup));await persist();throw new Error(`Schema preparation failed: ${error.message}`)}}

export async function recordImportFailure({fileName='',durationMs=0,errorMessage='' }={}){
  if(!db)return;
  try{
    reconcileImportSchema({apply:true});
    db.run('INSERT INTO import_history(imported_at,file_name,foods,pantry,recipes,warnings,status,duration_ms,error_message) VALUES (?,?,?,?,?,?,?,?,?)',[
      new Date().toISOString(),fileName,0,0,0,0,'failed',Number(durationMs)||0,String(errorMessage||'Import failed')
    ]);
    await persist();
  }catch{}
}

export function exportDatabase(){return db.export()}
export async function importDatabase(bytes){const candidate=new SQL.Database(new Uint8Array(bytes));const prior=db;db=candidate;try{await migrate()}catch(error){db=prior;throw error}await persist()}
export function databaseStatus(){
  const count=table=>hasTable(table)?Number(query(`SELECT COUNT(*) AS count FROM ${safeIdentifier(table)}`)[0]?.count||0):0;
  const latest=hasTable('import_history')?query('SELECT * FROM import_history ORDER BY id DESC LIMIT 1')[0]||null:null;
  const version=hasTable('schema_migrations')?Number(query('SELECT MAX(version) AS version FROM schema_migrations')[0]?.version||0):0;
  const compatibility=reconcileImportSchema({apply:false});
  const foodsWithNutrition=hasTable('foods')?Number(query('SELECT COUNT(*) AS count FROM foods WHERE COALESCE(nutrition_known,0)=1')[0]?.count||0):0;
  const foodsMissingNutrition=hasTable('foods')?Number(query('SELECT COUNT(*) AS count FROM foods WHERE COALESCE(nutrition_known,0)=0')[0]?.count||0):0;
  const mealsPendingNutrition=hasTable('meals')?Number(query('SELECT COUNT(*) AS count FROM meals WHERE COALESCE(nutrition_known,0)=0')[0]?.count||0):0;
  const missingNutritionFoods=hasTable('foods')?query(`SELECT food_id,name,category,default_serving,unit FROM foods WHERE COALESCE(nutrition_known,0)=0 ORDER BY name COLLATE NOCASE LIMIT 50`):[];
  const nutritionCoverage=count('foods')?Math.round((foodsWithNutrition/count('foods'))*100):0;
  const pantryNutritionIssues=hasTable('pantry')&&hasTable('foods')?query(`SELECT p.pantry_id,p.item,p.food_id,f.name AS linked_food,
    COALESCE(f.nutrition_known,0) AS nutrition_known,COALESCE(f.calories,0) AS calories
    FROM pantry p LEFT JOIN foods f ON UPPER(f.food_id)=UPPER(p.food_id)
    WHERE p.on_hand='Yes' AND (f.food_id IS NULL OR COALESCE(f.nutrition_known,0)=0 OR
      (COALESCE(f.calories,0)=0 AND COALESCE(f.protein,0)=0 AND COALESCE(f.carbs,0)=0 AND COALESCE(f.fat,0)=0 AND COALESCE(f.fiber,0)=0))
    ORDER BY p.item COLLATE NOCASE LIMIT 50`):[];
  const history=hasTable('meals')?query(`SELECT MIN(consumed_local_date) earliest,MAX(consumed_local_date) latest,COUNT(*) total_meals,COUNT(DISTINCT consumed_local_date) total_days FROM meals`)[0]||{}:{};
  const mealDates=hasTable('meal_date_index')?query('SELECT meal_date,consumed_count,planned_count FROM meal_date_index ORDER BY meal_date'):[];
  const safetyBackups=hasTable('safety_backup_log')?count('safety_backup_log'):0;
  return {schemaVersion:version,targetSchemaVersion:TARGET_SCHEMA_VERSION,foods:count('foods'),foodsWithNutrition,foodsMissingNutrition,missingNutritionFoods,nutritionCoverage,mealsPendingNutrition,pantry:count('pantry'),recipes:count('recipes'),meals:count('meals'),latest,compatibility,pantryNutritionIssues,history,mealDates,safetyBackups};
}
