# Gradient Descent

- **What it is:** An optimization algorithm that minimizes a loss function by iteratively adjusting model parameters in the direction of the **steepest descent** (negative gradient).

- **How it works:** At each step, parameters are updated using the formula:
  $$\theta = \theta - \alpha \cdot \nabla J(\theta)$$
  where `α` is the **learning rate** and `∇J(θ)` is the gradient of the loss function.

- **Key idea:** By repeatedly moving *opposite* to the gradient, the algorithm converges toward a **minimum** of the loss function, improving model performance over time.