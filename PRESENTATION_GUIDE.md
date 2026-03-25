# CityFlow Sentinel — Soutenance Presentation Guide

---

## 1. Introduction (Hook)

> **CityFlow Sentinel** est une plateforme locale de mobilité intelligente qui prédit les niveaux de tension routière à Casablanca grâce au Machine Learning, tout en offrant un assistant IA spécialisé dans la réglementation urbaine marocaine.
>
> En combinant un moteur prédictif XGBoost, un pipeline RAG alimenté par Llama-3, et un tableau de bord interactif, CityFlow transforme les données brutes en décisions opérationnelles pour les gestionnaires de ville.

---

## 2. Problématique (Les 3 Problèmes)

| # | Pain Point | Impact |
|---|---|---|
| 1 | **Tension routière imprévisible** | Les gestionnaires n'ont aucun outil prédictif pour anticiper les pics de congestion par quartier et par heure |
| 2 | **Complexité réglementaire** | Le Code de la Route marocain et les protocoles d'urgence sont dispersés dans des PDFs volumineux, inaccessibles en temps réel |
| 3 | **Absence de monitoring intégré** | Aucun tableau de bord unifié ne combine prédiction ML, assistance IA, et supervision d'infrastructure |

---

## 3. Solution Proposée (3 Piliers)

### Pilier 1 — Moteur Prédictif
- **XGBoost** entraîné sur 48 204 enregistrements horaires (R² = 0.9428)
- **Spatial Bias Haversine** : simulation déterministe de variations par quartier autour de Casablanca (centre +15, banlieue -20)
- Météo en temps réel via Open-Meteo pour chaque point cliqué sur la carte

### Pilier 2 — Assistant Réglementaire (RAG)
- Embeddings locaux **BAAI/bge-m3** → ChromaDB
- LLM local **Llama-3** (via Ollama) — aucune donnée envoyée au cloud
- **Batch Query Generation** : une seule inférence LLM génère 4 reformulations
- **Cross-Encoder Reranking** (bge-reranker-v2-m3) : 20 chunks → 5 passages pertinents

### Pilier 3 — Centre de Contrôle
- **React + Leaflet** : carte interactive Click-to-Predict avec marqueurs SVG animés
- **Grafana** : 13 panneaux dont jauges CPU/RAM Ollama, taux d'erreur, latence RAG
- **Prometheus + cAdvisor** : collecte métriques conteneurs en temps réel

---

## 4. Planification & Gestion des Tâches

| Phase | Contenu | Statut |
|---|---|---|
| Phase 1 | Conception (UML, MCD/MPD) | ✅ |
| Phase 2 | Data & ML (Preprocessing, XGBoost, RF, LightGBM) | ✅ |
| Phase 3 | LLM & RAG (ChromaDB, Llama-3, Reranker) | ✅ |
| Phase 4 | Full-Stack (FastAPI, React, JWT, Leaflet) | ✅ |
| Phase 5 | MLOps & Sécurité (MLflow, Prometheus, Grafana, Pytest, CI/CD) | ✅ |
| Phase 6 | Finalisation (Rapport, tests E2E, présentation) | ✅ |

**Outils de gestion** : Workflow Docker-first, Git/GitHub pour le versioning, GitHub Actions pour CI/CD.

---

## 5. Outils & Technologies

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet, Recharts |
| **Backend** | FastAPI, PostgreSQL, SQLAlchemy, JWT (python-jose) |
| **IA / ML** | XGBoost, Scikit-learn, Ollama + Llama-3, LangChain, BAAI/bge-m3, BAAI/bge-reranker-v2-m3, ChromaDB |
| **MLOps** | MLflow, Prometheus, Grafana 11, cAdvisor, Docker Compose |
| **CI/CD** | GitHub Actions, Pytest, Flake8 |

---

## 6. Deep-Dives Techniques

### 6.1 Le Pipeline RAG
1. L'utilisateur pose une question en français
2. **Batch Generation** : un seul appel LLM produit 4 reformulations autonomes de la question
3. **Multi-Query Search** : chaque reformulation interroge ChromaDB → 20 chunks uniques maximum
4. **Cross-Encoder Reranking** : le modèle bge-reranker-v2-m3 classe les 20 chunks et retourne les 5 meilleurs
5. **Génération finale** : Llama-3 synthétise la réponse en citant ses sources

> *Résultat : latence divisée par 2 grâce au batching, précision améliorée grâce au reranking.*

### 6.2 ML Accuracy & Déterminisme Spatial
- Le modèle XGBoost prédit un **score global** basé sur `[heure, jour, température, pluie, neige]`
- La fonction `apply_spatial_bias` calcule la distance euclidienne entre le clic et le centre de Casablanca (33.5731, -7.5898)
- **3 zones** : Centre (< 3 km → +15), Anneau intermédiaire (< 8 km → 0), Banlieue (> 8 km → -20)
- **Bruit déterministe** : `sin(lat × 5000) + cos(lng × 5000)` garantit que le même point retourne toujours le même score unique

> *Résultat : la carte affiche des variations réalistes par quartier tout en restant 100% reproductible.*

### 6.3 Observabilité (Grafana)
- **🚀 Performance KPIs** : Total Predictions, Latence moyenne chat (seuils vert/jaune/rouge), Uptime
- **🧠 AI Model Metrics** : courbes de latence Llama-3 (avg + P95), distribution des scores, ratio succès/erreur (Donut)
- **🖥️ Infrastructure** : 4 jauges speedometer (CPU/RAM Ollama + FastAPI) alimentées par cAdvisor

> *Résultat : supervision complète en temps réel, prête pour la production.*

---

## 7. Conclusion

### Proposition de valeur
CityFlow Sentinel offre aux gestionnaires urbains un **outil décisionnel data-driven** combinant prédiction ML, expertise réglementaire IA, et monitoring infrastructure — le tout en architecture **100% locale** respectant la souveraineté des données.

### Évolution future
- **Indice de Pollution** : intégration des capteurs PM10/PM2.5/NO₂ pour corréler congestion et qualité de l'air
- **Données spatiales réelles** : réentraînement du modèle avec des features géographiques (`ID_Quartier`, coordonnées GPS) pour remplacer le biais simulé
