import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import joblib
import os


def preprocess_data(df, scaler_features=None, scaler_target=None, fit=False):
    df_clean = df.copy()
    
    df_clean['date_time'] = pd.to_datetime(df_clean['date_time'])
    
    df_clean['hour'] = df_clean['date_time'].dt.hour
    df_clean['day_of_week'] = df_clean['date_time'].dt.dayofweek
    df_clean['is_weekend'] = df_clean['day_of_week'].isin([5, 6]).astype(int)
    
    df_clean['temp_celsius'] = df_clean['temp'] - 273.15
    
    df_clean['hour_sin'] = np.sin(2 * np.pi * df_clean['hour'] / 24)
    df_clean['hour_cos'] = np.cos(2 * np.pi * df_clean['hour'] / 24)
    
    Q1 = df_clean['temp_celsius'].quantile(0.25)
    Q3 = df_clean['temp_celsius'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 3 * IQR
    upper_bound = Q3 + 3 * IQR
    df_clean['temp_celsius'] = df_clean['temp_celsius'].clip(lower=lower_bound, upper=upper_bound)
    
    df_clean['rain_1h'] = df_clean['rain_1h'].clip(upper=50)
    df_clean['snow_1h'] = df_clean['snow_1h'].clip(upper=50)
    
    continuous_features = ['temp_celsius', 'rain_1h', 'snow_1h']
    if fit:
        scaler_features = StandardScaler()
        df_clean[continuous_features] = scaler_features.fit_transform(df_clean[continuous_features])
    else:
        df_clean[continuous_features] = scaler_features.transform(df_clean[continuous_features])
    
    if fit:
        scaler_target = MinMaxScaler(feature_range=(0, 100))
        df_clean['tension_score'] = scaler_target.fit_transform(df_clean[['traffic_volume']])
    else:
        df_clean['tension_score'] = scaler_target.transform(df_clean[['traffic_volume']])
    
    feature_cols = ['hour_sin', 'hour_cos', 'day_of_week', 'is_weekend', 
                    'temp_celsius', 'rain_1h', 'snow_1h']
    target_col = 'tension_score'
    
    X = df_clean[feature_cols]
    y = df_clean[target_col]
    
    return X, y, scaler_features, scaler_target


def save_preprocessor(scaler_features, scaler_target, filepath):
    feature_cols = ['hour_sin', 'hour_cos', 'day_of_week', 'is_weekend', 
                    'temp_celsius', 'rain_1h', 'snow_1h']
    joblib.dump({
        'scaler_features': scaler_features,
        'scaler_target': scaler_target,
        'feature_cols': feature_cols,
        'target_col': 'tension_score'
    }, filepath)
    print(f"Preprocessor saved to: {filepath}")


def load_preprocessor(filepath):
    return joblib.load(filepath)


def evaluate_model(y_true, y_pred, model_name):
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    print(f"\n{model_name} Performance:")
    print("=" * 50)
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE:  {mae:.4f}")
    print(f"R²:   {r2:.4f}")
    
    return {'rmse': rmse, 'mae': mae, 'r2': r2}


def train_models():
    print("CityFlow ML - Training Script")
    print("=" * 70)
    
    models_dir = '../models'
    os.makedirs(models_dir, exist_ok=True)
    
    print("\n[1/6] Loading data...")
    df = pd.read_csv('../data/metro_traffic.csv')
    print(f"Loaded {len(df):,} records")
    
    print("\n[2/6] Preprocessing data...")
    X, y, scaler_features, scaler_target = preprocess_data(df, fit=True)
    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    print(f"Features: {list(X.columns)}")
    
    save_preprocessor(scaler_features, scaler_target, 
                     os.path.join(models_dir, 'preprocessor.joblib'))
    
    print("\n[3/6] Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Train set: {X_train.shape[0]:,} samples")
    print(f"Test set:  {X_test.shape[0]:,} samples")
    
    results = {}
    
    print("\n[4/6] Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    rf_model.fit(X_train, y_train)
    
    y_pred_rf = rf_model.predict(X_test)
    results['Random Forest'] = evaluate_model(y_test, y_pred_rf, "Random Forest")
    
    rf_path = os.path.join(models_dir, 'random_forest_model.joblib')
    joblib.dump(rf_model, rf_path)
    print(f"Model saved to: {rf_path}")
    
    print("\n[5/6] Training XGBoost Regressor...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbosity=1
    )
    xgb_model.fit(X_train, y_train)
    
    y_pred_xgb = xgb_model.predict(X_test)
    results['XGBoost'] = evaluate_model(y_test, y_pred_xgb, "XGBoost")
    
    xgb_path = os.path.join(models_dir, 'xgboost_model.joblib')
    joblib.dump(xgb_model, xgb_path)
    print(f"Model saved to: {xgb_path}")
    
    print("\n[6/6] Training LightGBM Regressor...")
    lgb_model = lgb.LGBMRegressor(
        n_estimators=100,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    lgb_model.fit(X_train, y_train)
    
    y_pred_lgb = lgb_model.predict(X_test)
    results['LightGBM'] = evaluate_model(y_test, y_pred_lgb, "LightGBM")
    
    lgb_path = os.path.join(models_dir, 'lightgbm_model.joblib')
    joblib.dump(lgb_model, lgb_path)
    print(f"Model saved to: {lgb_path}")
    
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE - Model Comparison")
    print("=" * 70)
    
    results_df = pd.DataFrame(results).T
    results_df = results_df.sort_values('r2', ascending=False)
    print("\n", results_df.to_string())
    
    results_path = os.path.join(models_dir, 'training_results.csv')
    results_df.to_csv(results_path)
    print(f"\nResults saved to: {results_path}")
    
    best_model = results_df.index[0]
    print(f"\n🏆 Best Model: {best_model} (R² = {results_df.loc[best_model, 'r2']:.4f})")
    
    print("\n" + "=" * 70)
    print("All models saved in:", os.path.abspath(models_dir))
    print("  - random_forest_model.joblib")
    print("  - xgboost_model.joblib")
    print("  - lightgbm_model.joblib")
    print("  - preprocessor.joblib")
    print("  - training_results.csv")
    print("=" * 70)


if __name__ == "__main__":
    train_models()
