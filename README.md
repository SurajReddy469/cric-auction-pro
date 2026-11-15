# 🏏 Cric-Auction Pro — IPL Mega Auction & Championship Simulator

[![Live Game](https://img.shields.io/badge/Play%20Now-Vercel%20Live-emerald?style=for-the-badge&logo=vercel)](https://cricket-auction-pro-five.vercel.app)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)

An authentic, broadcast-grade cricket franchise management simulator. Take the hot seat of an Indian Premier League (IPL) franchise with a ₹120.00 Cr purse, battle 9 aggressive AI team bosses in real-time gavel wars or compete head-to-head in human-only multiplayer rooms with friends, assemble a balanced 18–25 player squad, and lead your franchise through a 90-match round-robin season and 4-match playoff bracket to lift the championship trophy!

🎮 **Play Live in Browser**: [https://cricket-auction-pro-five.vercel.app](https://cricket-auction-pro-five.vercel.app)

---

## 🌟 Key Features

### 1. 🔨 Authentic IPL Mega Auction Engine
- **Broadcast-Grade Gavel Bidding War**: 10-second countdown timer per player lot with "Going Once", "Going Twice", and official "SOLD!" hammer drops and confetti animations.
- **Official Unsold Protocol**: Players receiving zero bids are stamped as **UNSOLD** and re-enter in the accelerated auction rounds.
- **₹120.00 Cr Salary Cap & Squad Constraints**: Strict enforcement of maximum 25 players, minimum 18 players, and at most 8 overseas stars.
- **Dynamic Bid Increments**: Tiered increments matching BCCI guidelines (+₹0.10 Cr, +₹0.20 Cr, +₹0.25 Cr, +₹0.50 Cr, +₹1.00 Cr), plus a rapid **Power Jump Bid** button.
- **Live Bidding Board & Broadcast Ticker**: Real-time purse tracking, remaining budgets, squad counts, and commentary for every bid.
- **Player Scouting Lab**: Spend scout tokens to reveal hidden form multipliers, clutch ratings, death bowling proficiency, and injury resistance.
- **Free Screen Navigation**: Browse your squad, check remaining team budgets, and view league rosters during the auction without timer interruption or page snapping.

---

### 2. 👥 Human-Only Multiplayer Auction Rooms
- **Real-Time WebSocket Engine**: Play live auctions with your friends powered by low-latency WebSockets.
- **6-Character Room Codes**: Instant room creation, join via code or direct shareable URL.
- **Team Claiming & Conflict Resolution**: Choose your preferred franchise; if another manager selects it first, smoothly pick another team or negotiate in lobby.
- **Strictly Human-Only (Zero Bot Substitution)**: True multiplayer integrity where only real humans bid.
- **Disconnect Pause Protection**: If a manager temporarily loses connection, the room automatically pauses with an active grace timer, ensuring fair play for everyone.

---

### 3. 🏢 10 Official Franchises with Distinct Tactical AI
Each IPL franchise operates with authentic tactical philosophies and spending priorities:
- **Mumbai Indians (MI)**: Aggressive superstar hoarders targeting proven match-winners.
- **Chennai Super Kings (CSK)**: Experienced veterans, high-clutch finishers, and calculated bids.
- **Royal Challengers Bengaluru (RCB)**: Explosive marquee top-order batters and crowd favorites.
- **Kolkata Knight Riders (KKR)**: Premium overseas all-rounders and mystery spinners.
- **Gujarat Titans (GT)**: Disciplined value hunters with clutch match-winners.
- **Rajasthan Royals (RR)**: High-ceiling youthful prodigies and elite pace spearheads.
- **Delhi Capitals (DC)**: Balanced aggressive young Indian core with dynamic stroke-makers.
- **Sunrisers Hyderabad (SRH)**: Record-shattering boundary hitters and swing bowlers.
- **Lucknow Super Giants (LSG)**: Anchor-heavy tactical stabilizers and all-round depth.
- **Punjab Kings (PBKS)**: Wildcard chaos bidders willing to inflate rival prices.

---

### 4. 🎨 Franchise Customization & Custom Logos
- **Custom Logo Upload**: Upload any custom franchise logo directly from your device (PNG, SVG, JPG, WebP) or paste an image URL.
- **Instant Crest Updates**: Custom logos immediately render across all screens (Live Auction Board, Squad Lab, Points Table, Match Arena, Scorecards, and Lobby).
- **Reset to Default**: Easily revert to authentic handcrafted vector team crests with a single click.

---

### 5. 📊 Dual Datasets: Real IPL Stars & Fictional League
- **Real IPL 2025 Dataset**: 112 authenticated cricket superstars (Virat Kohli, Rohit Sharma, MS Dhoni, Jasprit Bumrah, Heinrich Klaasen, Pat Cummins, Mitchell Starc, Travis Head, Rashid Khan, Shubman Gill, Hardik Pandya, etc.) with verified base prices, overseas status, batting hands, and bowling styles.
- **Fictional League Dataset**: Alternate roster for competitive fantasy drafts.
- Seamlessly toggle datasets in the **Game Settings** modal.

---

### 6. 🏏 Squad Management & 22-Yard Pitch Lineup
- **Starting Playing XI Builder**: Interactive visual formation on an emerald pitch oval with 22-yard crease.
- **Team Chemistry & Balance Checks**: Real-time validation of the 4 overseas limit, wicketkeeper presence, minimum 5 bowling options, and batting depth.
- **Captains & Roles**: Assign team captains and designated wicketkeepers to boost on-field morale and tactical efficiency.

---

### 7. 🏆 90-Match Tournament & Live Match Arena
- **Comprehensive Season Simulator**: Authentic ball-by-ball probability engine with realistic boundaries, dot-ball pressure, wickets, extras, and strike rotations.
- **Interactive Live Match Arena**: Play ball-by-ball or over-by-over with real-time target chasing, partnership trackers, run-rate indicators, and game-changing sixes.
- **Live Net Run Rate (NRR) Table**: Fractional over calculation ($\text{balls} / 6$) with standard ICC tie-breakers.
- **IPL Page Playoffs Bracket**: Realistic 4-match playoff format (Qualifier 1, Eliminator, Qualifier 2, and the Grand Final).
- **Season Awards**: Real-time aggregation of the Orange Cap (most runs), Purple Cap (most wickets), and Most Valuable Player (MVP).

---

### 8. 🎖️ Career Mode & Achievement Cabinet
- **Manager Career Tracking**: Track manager reputation tiers (*Rookie*, *Pro*, *Legend*, *Hall of Fame*), total seasons, silverware tally, and match win rates.
- **10+ Unlockable Achievements**: Complete auction milestones, build dream squads, achieve tournament sweeps, and earn scout tokens.
- **Universal Day / Night Theme**: Instant high-contrast theme toggle across all pages for comfortable day and night gaming.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/SurajReddy469/cric-auction-pro.git

# Enter project directory
cd cric-auction-pro

# Install dependencies
npm install
```

### Development Server
```bash
# Start frontend client (Vite)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Local Multiplayer Server (Optional)
```bash
# Start the WebSocket multiplayer server locally
npm run dev:multiplayer
```
Runs on `ws://localhost:5175`. By default, the production app connects to the hosted multiplayer server on Render.

### Automated Testing
```bash
# Run Vitest test suite
npm test
```
Executes all unit and integration tests covering the auction engine, season simulation, points tables, and multiplayer synchronization.

### Production Build
```bash
# Compile and optimize production bundle
npm run build
```

---

## 🕹️ How to Play

1. **Pick Your Franchise**: Choose your team on the Start screen, review starting purse (₹120.00 Cr), and inspect franchise strengths.
2. **Master the Mega Auction**:
   - Hit **Raise Paddle** to increase the current bid by the minimum increment.
   - Use **Jump Bid** to skip price tiers and intimidate rival franchise managers.
   - Click **Pass** if the price exceeds your valuation.
   - Spend **Scout Tokens** to uncover hidden player ratings before committing funds.
3. **Assemble Your Playing XI**: Open **Squad Management** to set your optimal Starting XI (ensure exactly 1 Wicketkeeper, at least 5 Bowlers, and at most 4 Overseas players).
4. **Conquer the Tournament**: Navigate to the **Tournament Arena** to play matches live ball-by-ball or fast-simulate the season. Finish in the Top 4 to qualify for the IPL Playoffs and lift the trophy!

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build & Bundler** | [Vite 8](https://vitejs.dev/) with Rollup code-splitting |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with localStorage campaign persistence |
| **Styling & UI** | [Tailwind CSS v3/v4](https://tailwindcss.com/) with responsive mobile layouts |
| **Motion & FX** | [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Iconography** | [Lucide React](https://lucide.dev/) |
| **Multiplayer Backend** | [Node.js](https://nodejs.org/) + [ws (WebSocket)](https://github.com/websockets/ws) |
| **Testing** | [Vitest](https://vitest.dev/) automated test runner |
| **Hosting** | [Vercel](https://vercel.com/) (Frontend) + [Render](https://render.com/) (WebSocket Server) |

---

## 📄 License
Distributed under the **MIT License**. Free to play, modify, and distribute for personal and educational projects.
