# ELEVEN — FC Clubs Position Randomizer

A lightweight React + TypeScript + Tailwind CSS web app for deciding who plays where in EA Sports FC Clubs.

## Features
- **Strict Front-to-Back Distribution**: Automatically fills positions from front to back (`FWD` → `MID` → `DEF` → `GK`) using attacking priority (e.g., `ST` → `LW/RW` → `CAM` → `LM/RM` → `CM` → `CDM` → `Fullbacks` → `CBs` → `GK`).
- **Saved Club Squad & Shareable Links**: Saves your squad in `localStorage` and lets you click **Copy Squad Link** to generate a URL (`?squad=Name1,Name2,...`) that pre-loads your squad on any browser.
- **Animated Reveal**: Sequential front-to-back slot-machine position reveal.
- **Click-to-Pin Positions**: Click any position node on the pitch to lock a specific player into that spot before rolling the rest.
- **All 32 FC Clubs Formations**: Every 3-back, 4-back, and 5-back tactical variation available in EA Sports FC Clubs (`3-1-4-2`, `3-4-1-2`, `3-4-2-1`, `3-4-3 Flat/Diamond`, `3-5-1-1`, `3-5-2`, `4-1-2-1-2 Narrow/Wide`, `4-1-3-2`, `4-1-4-1`, `4-2-1-3`, `4-2-2-2`, `4-2-3-1 Narrow/Wide`, `4-2-4`, `4-3-1-2`, `4-3-2-1`, `4-3-3 Flat/Holding/Defend/Attack/False 9`, `4-4-1-1 Midfield/Attack`, `4-4-2 Flat/Holding`, `4-5-1 Attack/Flat`, `5-2-1-2`, `5-2-2-1`, `5-2-3`, `5-3-2`, `5-4-1 Diamond/Flat`).

## Live App

- **GitHub Pages URL**: [https://ethanpugh.github.io/Eleven/](https://ethanpugh.github.io/Eleven/)

## Local Development

```bash
npm install
npm run dev
```

## Hosting on GitHub Pages

This project is configured to deploy automatically to `https://ethanpugh.github.io/Eleven/` via the included `.github/workflows/deploy.yml` GitHub Actions workflow whenever changes are pushed to `main`.

