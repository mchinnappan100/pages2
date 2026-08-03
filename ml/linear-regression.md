# Linear Regression

## What is Linear Regression?

Linear regression models the relationship between a **dependent variable** (target `y`) and one or more **independent variables** (features `X`) by fitting a straight line:

```
y = mx + b
```

| Symbol | Meaning |
|--------|---------|
| `y` | Predicted value |
| `x` | Input feature |
| `m` | Slope (coefficient) |
| `b` | Intercept |

The model learns `m` and `b` by minimizing the **sum of squared residuals** — the squared differences between predicted and actual values.

---

## Example with scikit-learn

### Data

| X | y (actual) |
|---|-----------|
| 1 | 2.1 |
| 2 | 3.9 |
| 3 | 6.2 |
| 4 | 7.8 |
| 5 | 10.1 |

### Code

```python
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3],[4],[5]])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])

model = LinearRegression()
model.fit(X, y)           # learn slope and intercept

predictions = model.predict([[6], [7]])
print(predictions)        # [12.03, 14.07]
```

### Learned Parameters

After fitting, scikit-learn reports:

- **Slope (`coef_`)** ≈ 2.02 — for every unit increase in X, y increases by ~2
- **Intercept (`intercept_`)** ≈ 0.01 — value of y when X = 0

So the fitted line is approximately:

```
y = 2.02x + 0.01
```

### Predictions

| X | Predicted y |
|---|------------|
| 6 | ≈ 12.13 |
| 7 | ≈ 14.15 |

---

## Visualisation

```python
import matplotlib.pyplot as plt

X_line = np.linspace(0, 8, 100).reshape(-1, 1)
y_line = model.predict(X_line)

plt.scatter(X, y, color='steelblue', label='Training data')
plt.scatter([[6],[7]], predictions, color='tomato', marker='*', s=150, label='Predictions')
plt.plot(X_line, y_line, color='gray', label='Fit line')
plt.xlabel('X')
plt.ylabel('y')
plt.title('Linear Regression')
plt.legend()
plt.show()
```

The plot shows:
- **Blue dots** — training data points
- **Gray line** — fitted regression line
- **Red stars** — predicted values for X = 6 and X = 7

---

## How the Model Learns

scikit-learn uses the **Ordinary Least Squares (OLS)** method, which finds `m` and `b` by minimising the **Mean Squared Error (MSE)**:

```
MSE = (1/n) * Σ (y_actual - y_predicted)²
```

For small datasets like this, OLS has a closed-form solution and does not require iterative optimisation.

---

## When to Use Linear Regression

| Use it when | Avoid it when |
|-------------|---------------|
| Relationship between X and y is roughly linear | Data has a curved or non-linear pattern |
| Interpretability matters | Outliers dominate the data |
| Low-dimensional features | Features are highly correlated (multicollinearity) |

---

## Key scikit-learn API

| Method | Description |
|--------|-------------|
| `model.fit(X, y)` | Train the model |
| `model.predict(X)` | Generate predictions |
| `model.coef_` | Learned slope(s) |
| `model.intercept_` | Learned intercept |
| `model.score(X, y)` | R² score (1.0 = perfect fit) |
