# CityFlow - Traffic Tension Prediction

AI-powered traffic analysis and prediction system using machine learning to predict traffic tension scores from metro traffic data with weather conditions.

## Project Structure

```
CityFlow/
├── cityflow_ml_lab/
│   ├── data/
│   │   ├── metro_traffic.csv       # Raw dataset
│   │   └── metro_traffic_cleaned.csv # Preprocessed data
│   ├── models/
│   │   ├── random_forest_model.joblib
│   │   ├── xgboost_model.joblib
│   │   ├── lightgbm_model.joblib
│   │   ├── preprocessor.joblib
│   │   └── training_results.csv
│   ├── notebooks/
│   │   ├── exploration.ipynb       # Data exploration and analysis
│   │   └── preprocess.ipynb        # Data preprocessing pipeline
│   ├── src/
│   │   ├── train.py               # Model training script
│   │   └── preprocess.py          # Preprocessing utilities
│   └── requirements.txt           # Python dependencies
|   └── README.md                # Project documentation
└── README.md
```

## Features

- **Data Preprocessing**: Comprehensive pipeline with outlier handling, feature engineering, and normalization
- **Multiple Models**: Trained Random Forest, XGBoost, and LightGBM regressors
- **Feature Engineering**: Cyclical time encoding, weather condition processing
- **Visualization**: Complete exploratory data analysis with graphs and correlation matrices

## Model Performance

| Model | RMSE | MAE | R² Score |
|-------|------|-----|----------|
| **XGBoost** | 6.53 | 3.79 | **0.9428** |
| Random Forest | 6.57 | 3.75 | 0.9422 |
| LightGBM | 6.57 | 3.81 | 0.9420 |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CityFlow
   ```

2. **Install dependencies**
   ```bash
   cd cityflow_ml_lab
   pip install -r requirements.txt
   ```

3. **Run training**
   ```bash
   python src/train.py
   ```

## Data

- **Source**: Metro traffic dataset with weather conditions
- **Size**: 48,204 hourly records (Oct 2012 - Sep 2018)
- **Features**: Time, weather conditions (temperature, rain, snow), traffic volume
- **Target**: Traffic tension score (0-100 scale)

## Dependencies

- pandas, numpy - Data manipulation
- scikit-learn - Machine learning
- xgboost, lightgbm - Gradient boosting models
- matplotlib, seaborn - Visualization
- jupyter - Interactive notebooks

## License

MIT License