# Model Files

This directory contains trained models. After running `python src/train.py`, you'll find:

- `random_forest_model.joblib` - Random Forest regression model
- `xgboost_model.joblib` - XGBoost regression model  
- `lightgbm_model.joblib` - LightGBM regression model
- `preprocessor.joblib` - Data preprocessing pipeline
- `training_results.csv` - Model performance comparison

**Note**: Model files (*.joblib) are excluded from git due to large file sizes. Run the training script to generate them locally.