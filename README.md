# TrustScore AI 🚀

An alternative credit scoring platform that leverages Alternative Data (UPI, bill payments, behavioral footprint) to assign TrustScores to the unbanked and underbanked population.

![Demo](https://via.placeholder.com/800x400?text=Insert+Screenshot+Here)

## 💪 Why We Win (Hackathon Pitch Points)
1. **Real AI, Not Just Rules:** Built using a powerful `VotingRegressor` (RandomForest + XGBoost Ensemble).
2. **Deep Data Modeling:** Trained on synthetic transactions perfectly mirroring Indian macro-economic behavioral footprints (UPI, late night spending flags, rental consistency).
3. **Explainable AI:** Does not operate as a black box. Uses **SHAP values** to explain exactly mathematically *why* a user was scored low/high (E.g. "-15 pts for volatile spending").
4. **Complete Stack:** Flask Python Backend + Glassmorphism UI + Dynamic JS Frontend. 
5. **Batch Processing:** Drop massive folders of CSVs at once for instant risk-profiling.

## 🌟 30-Second Demo Script
> *"Meet TrustScore AI. Over 1 Billion people globally have no traditional credit score, meaning they can't get loans. But they DO have data.*
>
> *(Click the Drag and Drop Zone and upload Batch CSVs)* 
> 
> *Our platform ingests their raw digital footprints—UPI transactions, utilities, and salary flows—and runs it through our proprietary XGBoost machine learning ensemble.*
> 
> *(Watch the animations hit the screen)*
>
> *Within seconds, we calculate a secure TrustScore. But we don't stop there. Our Explainable AI immediately flags extreme risk markers like erratic late-night spending or consistent rental defaults. The unbanked get credit. And lenders get security. Thank you."*

## 🛠 Features
- **Drag & Drop Upload:** Pure Vanilla JS with Drag & Drop chunking.
- **Batch Processing:** Upload multiple CSVs simultaneously for immediate bulk-table analysis.
- **Factor Risk Grid:** Breaks down the 8 primary factors our ML model looks at.
- **Interactive UI:** Dynamic dark/light modes and fully responsive grid patterns.

## 🚀 1-Click Heroku Deployment
The project is built to immediately deploy live.
1. Make sure you have the Heroku CLI installed.
2. Run `./deploy.sh` 
3. *That's it.* Heroku will capture the `Procfile`, pull `requirements.txt`, setup the Python 3.11 environment via `runtime.txt`, and start the Gunicorn server.

--- 
*Built natively during HackMumbai.*
