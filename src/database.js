import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const DB_KEY='fizz-health-sqlite-v1';
const STORAGE_DB='FizzHealthStorage';
const TARGET_SCHEMA_VERSION=44;
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

];

const canonicalSchema={
  foods:{
    create:`CREATE TABLE IF NOT EXISTS foods (food_id TEXT PRIMARY KEY, name TEXT, category TEXT, default_serving REAL, unit TEXT, calories REAL, protein REAL, carbs REAL, fiber REAL, fat REAL, saturated_fat REAL, sodium REAL, potassium REAL, notes TEXT)`,
    columns:{food_id:'TEXT',name:'TEXT',category:'TEXT',default_serving:'REAL',unit:'TEXT',calories:'REAL',protein:'REAL',carbs:'REAL',fiber:'REAL',fat:'REAL',saturated_fat:'REAL',sodium:'REAL',potassium:'REAL',notes:'TEXT',nutrition_known:'INTEGER DEFAULT 0',archived:'INTEGER DEFAULT 0',archived_at:'TEXT'},
    aliases:{name:['food','food_name']}
  },
  pantry:{
    create:`CREATE TABLE IF NOT EXISTS pantry (id INTEGER PRIMARY KEY AUTOINCREMENT, pantry_id TEXT, item TEXT, food_id TEXT, brand TEXT, on_hand TEXT, quantity REAL, unit TEXT, opened TEXT, opened_date TEXT, expiration TEXT, location TEXT, status TEXT, priority TEXT, category TEXT, notes TEXT)`,
    columns:{pantry_id:'TEXT',item:'TEXT',food_id:'TEXT',brand:'TEXT',on_hand:'TEXT',quantity:'REAL',unit:'TEXT',opened:'TEXT',opened_date:'TEXT',expiration:'TEXT',location:'TEXT',status:'TEXT',priority:'TEXT',category:'TEXT',notes:'TEXT',purchase_date:'TEXT',verified_at:'TEXT',storage_type:'TEXT',manufacturer_shelf_life_days:'REAL',opened_shelf_life_days:'REAL',freshness_observation:'TEXT',purchase_price:'REAL',retailer:'TEXT',original_servings:'REAL',quantity_accuracy:'TEXT'},
    aliases:{item:['name','food','pantry_item'],food_id:['canonical_food_id'],expiration:['effective_expiry','best_by_expiration']}
  },
  recipes:{
    create:`CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, recipe_id TEXT, recipe_name TEXT, ingredient_name TEXT, amount REAL, unit TEXT, ingredient_type TEXT, ingredient_id TEXT, inventory_status TEXT)`,
    columns:{recipe_id:'TEXT',recipe_name:'TEXT',ingredient_name:'TEXT',amount:'REAL',unit:'TEXT',ingredient_type:'TEXT',ingredient_id:'TEXT',inventory_status:'TEXT',archived:'INTEGER DEFAULT 0',archived_at:'TEXT'},
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

function idbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(STORAGE_DB,2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('files'))req.result.createObjectStore('files');if(!req.result.objectStoreNames.contains('backups'))req.result.createObjectStore('backups')};req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result)})}
async function saveBytes(bytes){const store=await idbOpen();return new Promise((resolve,reject)=>{const tx=store.transaction('files','readwrite');tx.objectStore('files').put(bytes,DB_KEY);tx.oncomplete=()=>{store.close();resolve()};tx.onerror=()=>{store.close();reject(tx.error)}})}
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
async function migrate(){
  if(!hasTable('schema_migrations'))db.run('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)');
  const applied=new Set(query('SELECT version FROM schema_migrations').map(r=>Number(r.version)));
  for(const migration of migrations){
    if(applied.has(migration.version))continue;
    const backup=db.export();
    try{
      db.run('BEGIN');
      if(migration.sql.trim())runMigrationSql(migration.sql);
      reconcileImportSchema({apply:true});
      db.run('INSERT OR IGNORE INTO schema_migrations(version,name,applied_at) VALUES (?,?,?)',[migration.version,migration.name,new Date().toISOString()]);
      db.run('COMMIT');
    }catch(error){
      try{db.run('ROLLBACK')}catch{}
      db=new SQL.Database(new Uint8Array(backup));
      throw new Error(`Database migration ${migration.version} failed: ${error.message}`);
    }
  }
  const backup=db.export();
  try{db.run('BEGIN');repairFeatureSchema();reconcileImportSchema({apply:true});db.run('COMMIT')}catch(error){try{db.run('ROLLBACK')}catch{}db=new SQL.Database(new Uint8Array(backup));throw new Error(`Database schema reconciliation failed: ${error.message}`)}
  if(hasTable('meal_date_index'))normalizeHistoricalMeals();
  await persist();
}
export async function openDatabase(){if(db)return db;SQL=await initSqlJs({locateFile:()=>wasmUrl});const bytes=await loadBytes();db=bytes?new SQL.Database(new Uint8Array(bytes)):new SQL.Database();await migrate();return db}
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
