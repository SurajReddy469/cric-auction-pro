# Cric-Auction Pro — IPL Mega Auction & Championship Simulator

An interactive, broadcast-grade cricket franchise management game built with React 19, TypeScript, Vite, Tailwind CSS, and Zustand. Take the hot seat of an Indian Premier League (IPL) franchise with a ₹120.00 Cr purse, battle 9 aggressive AI team bosses in real-time gavel wars, assemble a balanced 18–25 player squad, and lead them through a 56-match round-robin tournament and 4-match playoff bracket to lift the championship trophy!

---

## 🎮 Key Features

### 1. Authentic IPL Mega Auction Engine
- **Real-Time Gavel Bidding War**: 10-second countdown timer per player lot, with "Going Once", "Going Twice", and "SOLD!" hammer drops.
- **₹120.00 Cr Salary Cap & Squad Constraints**: Strict enforcement of maximum 25 players, minimum 18 players, and at most 8 overseas stars.
- **Dynamic Bid Increments**: Accurate tiered increments (+₹0.10 Cr, +₹0.20 Cr, +₹0.25 Cr, +₹0.50 Cr, +₹1.00 Cr) matching BCCI auction guidelines, plus a quick **Power Jump Bid** button.
- **Live Bidding Board & Broadcast Ticker**: Track live purse deductions, remaining budgets, squad counts, and real-time commentary for every bid.
- **Player Scouting Lab**: Spend scout tokens to reveal hidden form multipliers, clutch ratings, death bowling proficiency, and injury resistance before bidding.

### 2. 10 Official Franchises & Distinct AI Personalities
Each franchise operates with unique tactical strategies and spending priorities:
- **Mumbai Indians (MI)**: Aggressive superstar hoarders with deep purses.
- **Chennai Super Kings (CSK)**: Experienced veterans and calculated calm bids.
- **Royal Challengers Bengaluru (RCB)**: Explosive marquee top-order batters.
- **Kolkata Knight Riders (KKR)**: Premium overseas all-rounders and mystery spinners.
- **Gujarat Titans (GT)**: Disciplined value hunters with clutch match-winners.
- **Rajasthan Royals (RR)**: High-ceiling youthful prodigies and elite pacers.
- **Delhi Capitals (DC)**: Balanced aggressive young Indian core.
- **Sunrisers Hyderabad (SRH)**: Record-shattering boundary hitters and swing bowlers.
- **Lucknow Super Giants (LSG)**: Anchor-heavy tactical stabilizers.
- **Punjab Kings (PBKS)**: Wildcard chaos bidders willing to inflate rival prices.

### 3. Dual Datasets: Real IPL Stars & Fictional League
- **Real IPL 2025 Dataset**: 112 authenticated cricket superstars (Virat Kohli, Rohit Sharma, MS Dhoni, Jasprit Bumrah, Heinrich Klaasen, Pat Cummins, Mitchell Starc, Travis Head, Rashid Khan, Shubman Gill, Hardik Pandya, etc.) with verified base prices, overseas status, batting hands, and bowling styles.
- **Fictional League Dataset**: Alternate roster for competitive fantasy drafts.
- Seamlessly toggle datasets in the **Game Settings** modal.

### 4. Squad Management & 22-Yard Pitch Lineup
- **Starting Playing XI Builder**: Interactive visual formation on an emerald pitch oval with 22-yard crease.
- **Team Chemistry & Balance Checks**: Real-time validation of the 4 overseas limit, wicketkeeper presence, minimum 5 bowling options, and batting depth.
- Bench and activate players with single-click/keyboard controls.

### 5. 56-Match Tournament & Live Match Arena
- **Comprehensive Season Simulator**: Authentic ball-by-ball probability engine with realistic boundaries, dot-ball pressure, wickets, extras, and strike rotations.
- **Interactive Live Match Arena**: Play ball-by-ball or over-by-over with real-time target chasing, partnership trackers, run-rate indicators, and game-changing sixes.
- **Live Net Run Rate (NRR) Table**: Fractional over calculation ($\text{balls} / 6$) with standard ICC tie-breakers.
- **IPL Playoffs Bracket**: Page playoff format (Qualifier 1, Eliminator, Qualifier 2, and the Grand Final).
- **Season Awards**: Real-time aggregation of the Orange Cap (most runs), Purple Cap (most wickets), and Most Valuable Player (MVP).

### 6. Arcade Audio & Day Mode Accessibility
- **Broadcast Audio**: Sound effects for gavel strikes, bid paddles, outbid alerts, crowd roars, and trophy fanfare powered by Web Audio API synthesizers (no external asset dependencies).
- **Clean Day Mode UI**: Polished golden-amber arcade theme with high-contrast text, smooth Framer Motion transitions, responsive mobile/tablet layouts, and full keyboard navigation.
- **Persistent Campaign Storage**: Automatically saves active auctions, team rosters, and season progress to `localStorage`.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
git clone https://github.com/your-username/cric-auction-pro.git
cd cric-auction-pro
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Code-Splitting
```bash
npm run build
```
Optimized output with chunk-split bundles (`vendor-react`, `vendor-motion`, `vendor-icons`, `vendor-state`, `vendor-confetti`), all well under the 500 KB limit.

### Linting
```bash
npm run lint
```
Runs Oxlint checks with zero errors and zero warnings.

---

## 🕹️ How to Play

1. **Select Franchise**: Choose your favorite franchise on the Franchise Select screen and review its starting purse and tactical strengths.
2. **Mega Auction**: 
   - Raise your paddle with **Raise Paddle** to increase the bid by the minimum increment.
   - Use **Jump Bid** to skip increments and intimidate rival bidders.
   - Click **Pass** if the price exceeds your valuation.
   - Use **Scout** tokens to reveal detailed player ratings before bidding.
3. **Assemble Lineup**: Open the **Squad Lab** to select your optimal Starting XI (ensure exactly 1 Wicketkeeper, at least 5 Bowlers, and at most 4 Overseas players).
4. **Championship Campaign**: Enter the **Tournament Arena** to play matches live or fast-sim your fixtures. Finish in the Top 4 to qualify for the IPL Playoffs!

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 7](https://vitejs.dev/) with Rollup chunk splitting
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with custom campaign persistence
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Celebration Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio Engine**: Native HTML5 Web Audio API Synthesizers

---

## 📄 License
MIT License. Free to use, modify, and distribute for personal and educational projects.
