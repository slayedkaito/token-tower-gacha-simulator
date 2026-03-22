# 🖥️ Token Tower Gacha Simulator

![UI Preview](https://via.placeholder.com/800x400.png?text=UI+Preview+Coming+Soon)

A high-fidelity, interactive web simulator designed to deconstruct and demonstrate the predatory mathematics behind modern "Token Tower" gacha ecosystems. Wrapped in a clean, minimalist Glassmorphism UI, this project exposes how algorithms use *State-Dependent Probability* and psychological triggers to drain wallets.

## ✨ Features
* **State-Dependent RNG:** Probability dynamically chokes from 25% down to a microscopic 0.38% as players progress.
* **Pity System & Refund Loop:** Simulates the illusion of value by granting conditional cashback (Tickets) to trigger the *Zeigarnik Effect*.
* **Live CDF Analytics:** Features a built-in Monte Carlo simulation generating a Cumulative Distribution Function (CDF) chart via Chart.js to map the player's financial ruin.
* **Mock Payment Gateway:** Fully animated top-up simulation (IDR to Diamonds) to provide a realistic sense of sunk cost.
* **Glassmorphism UI:** Minimalist and responsive design built with Tailwind CSS.

## 🧮 The Math Behind The Madness
This simulator isn't just pure RNG; it runs on a Discrete-Time Markov Chain model. 
The transition to the final grand prize (Token 5) is designed as a "Wall" (0.38% drop rate), forcing an extreme standard deviation where the "Law of Large Numbers" breaks down for individual players.

## 🚀 How to Run (Local)
This project uses pure HTML, CSS, and Vanilla JavaScript. No build tools required.
1. Clone this repository:
   ```bash
   git clone [https://github.com/slayedkaito/token-tower-gacha-simulator.git](https://github.com/slayedkaito/token-tower-gacha-simulator.git)
