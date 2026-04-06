// // 
// /* ============================================
//    SOLAR DASHBOARD - MODERN ECO-TECH THEME
//    ============================================ */

// /* Root Variables */
// :root {
//   /* Primary Colors - Nature & Tech Fusion */
//   --color-primary: #10b981;
//   --color-primary-dark: #059669;
//   --color-primary-light: #6ee7b7;
  
//   /* Secondary Colors */
//   --color-secondary: #3b82f6;
//   --color-secondary-light: #93c5fd;
//   --color-eco: #06b6d4;
//   --color-eco-light: #67e8f9;
  
//   /* Neutral Colors */
//   --color-dark-bg: #0f172a;
//   --color-darker-bg: #020617;
//   --color-card-bg: #1e293b;
//   --color-card-border: #334155;
//   --color-text-primary: #f1f5f9;
//   --color-text-secondary: #cbd5e1;
//   --color-text-muted: #94a3b8;
  
//   /* Accent Colors */
//   --color-accent-yellow: #fbbf24;
//   --color-accent-orange: #f97316;
//   --color-accent-red: #ef4444;
  
//   /* Gradients */
//   --gradient-primary: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
//   --gradient-secondary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
//   --gradient-eco: linear-gradient(135deg, #059669 0%, #047857 100%);
//   --gradient-dark: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  
//   /* Spacing */
//   --spacing-xs: 0.25rem;
//   --spacing-sm: 0.5rem;
//   --spacing-md: 1rem;
//   --spacing-lg: 1.5rem;
//   --spacing-xl: 2rem;
//   --spacing-2xl: 3rem;
//   --spacing-3xl: 4rem;
  
//   /* Border Radius */
//   --radius-sm: 0.375rem;
//   --radius-md: 0.5rem;
//   --radius-lg: 0.75rem;
//   --radius-xl: 1rem;
//   --radius-2xl: 1.5rem;
  
//   /* Shadows */
//   --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
//   --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
//   --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
//   --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
//   --shadow-glow: 0 0 30px rgba(16, 185, 129, 0.2);
  
//   /* Transitions */
//   --transition-fast: 150ms ease-in-out;
//   --transition-normal: 300ms ease-in-out;
//   --transition-slow: 500ms ease-in-out;
// }

// /* ============================================
//    GLOBAL STYLES
//    ============================================ */

// * {
//   margin: 0;
//   padding: 0;
//   box-sizing: border-box;
// }

// html {
//   scroll-behavior: smooth;
// }

// body {
//   background: var(--color-dark-bg);
//   color: var(--color-text-primary);
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
//     'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
//     sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   overflow-x: hidden;
// }

// /* ============================================
//    DASHBOARD CONTAINER
//    ============================================ */

// .solar-dashboard {
//   min-height: 100vh;
//   background: linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%);
//   position: relative;
// }

// /* Animated background grid effect */
// .solar-dashboard::before {
//   content: '';
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-image:
//     linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
//     linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
//   background-size: 40px 40px;
//   pointer-events: none;
//   z-index: 0;
// }

// /* ============================================
//    DASHBOARD HEADER
//    ============================================ */

// .dashboard-header {
//   position: relative;
//   z-index: 10;
//   background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);
//   border-bottom: 1px solid rgba(16, 185, 129, 0.2);
//   padding: 2rem;
//   backdrop-filter: blur(10px);
//   -webkit-backdrop-filter: blur(10px);
// }

// .header-content {
//   max-width: 1600px;
//   margin: 0 auto;
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   gap: 2rem;
//   flex-wrap: wrap;
// }

// .logo-section {
//   display: flex;
//   align-items: center;
//   gap: 1.5rem;
// }

// .logo-icon {
//   width: 60px;
//   height: 60px;
//   background: var(--gradient-primary);
//   border-radius: var(--radius-xl);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 2rem;
//   color: white;
//   box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
//   animation: float 3s ease-in-out infinite;
// }

// @keyframes float {
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-10px); }
// }

// .header-info h1 {
//   font-size: 2rem;
//   font-weight: 700;
//   margin-bottom: 0.5rem;
//   background: linear-gradient(135deg, #10b981, #06b6d4);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
// }

// .tagline {
//   font-size: 0.95rem;
//   color: var(--color-text-secondary);
// }

// .header-meta {
//   display: flex;
//   gap: 1.5rem;
//   align-items: center;
// }

// .location-badge,
// .status-badge {
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   padding: 0.75rem 1.5rem;
//   background: rgba(16, 185, 129, 0.1);
//   border: 1px solid rgba(16, 185, 129, 0.3);
//   border-radius: var(--radius-xl);
//   font-size: 0.9rem;
//   color: var(--color-text-secondary);
//   transition: all var(--transition-normal);
// }

// .location-badge:hover {
//   background: rgba(16, 185, 129, 0.15);
//   border-color: rgba(16, 185, 129, 0.5);
// }

// .status-badge.active {
//   background: rgba(16, 185, 129, 0.15);
//   border-color: var(--color-primary);
//   color: var(--color-primary);
// }

// .pulse {
//   display: inline-block;
//   width: 8px;
//   height: 8px;
//   background: var(--color-primary);
//   border-radius: 50%;
//   animation: pulse-animation 2s infinite;
// }

// @keyframes pulse-animation {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.5; }
// }

// /* ============================================
//    MAIN CONTENT
//    ============================================ */

// .dashboard-main {
//   max-width: 1600px;
//   margin: 0 auto;
//   padding: 2rem;
//   position: relative;
//   z-index: 5;
// }

// /* ============================================
//    METRICS GRID
//    ============================================ */

// .metrics-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
//   gap: 1.5rem;
//   margin-bottom: 3rem;
// }

// .metric-card {
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
//   border: 1px solid rgba(16, 185, 129, 0.2);
//   border-radius: var(--radius-2xl);
//   padding: 1.75rem;
//   transition: all var(--transition-normal);
//   position: relative;
//   overflow: hidden;
//   backdrop-filter: blur(10px);
//   -webkit-backdrop-filter: blur(10px);
// }

// .metric-card::before {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   height: 2px;
//   background: linear-gradient(90deg, transparent, currentColor, transparent);
//   opacity: 0;
//   transition: opacity var(--transition-normal);
// }

// .metric-card:hover {
//   transform: translateY(-8px);
//   border-color: rgba(16, 185, 129, 0.5);
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
//   box-shadow: var(--shadow-glow);
// }

// .metric-card.metric-primary {
//   --card-color: var(--color-primary);
// }

// .metric-card.metric-success {
//   --card-color: var(--color-eco);
// }

// .metric-card.metric-eco {
//   --card-color: var(--color-primary-light);
// }

// .metric-card.metric-secondary {
//   --card-color: var(--color-secondary);
// }

// .metric-icon {
//   width: 50px;
//   height: 50px;
//   background: rgba(16, 185, 129, 0.15);
//   border-radius: var(--radius-lg);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 1.5rem;
//   color: var(--color-primary);
//   margin-bottom: 1rem;
//   transition: all var(--transition-normal);
// }

// .metric-card:hover .metric-icon {
//   background: rgba(16, 185, 129, 0.25);
//   transform: scale(1.1) rotate(-10deg);
// }

// .metric-content h3 {
//   font-size: 0.9rem;
//   color: var(--color-text-secondary);
//   font-weight: 600;
//   margin-bottom: 0.75rem;
//   text-transform: uppercase;
//   letter-spacing: 0.5px;
// }

// .metric-value {
//   font-size: 1.75rem;
//   font-weight: 700;
//   color: var(--color-text-primary);
//   margin-bottom: 0.75rem;
//   background: linear-gradient(135deg, #10b981, #06b6d4);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
// }

// .metric-footer {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   font-size: 0.85rem;
// }

// .metric-subtitle {
//   color: var(--color-text-muted);
// }

// .metric-trend {
//   color: var(--color-primary);
//   font-weight: 600;
// }

// /* ============================================
//    CHARTS SECTION
//    ============================================ */

// .charts-section {
//   display: grid;
//   grid-template-columns: 2fr 1fr;
//   gap: 2rem;
//   margin-bottom: 3rem;
// }

// .chart-container {
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
//   border: 1px solid rgba(16, 185, 129, 0.2);
//   border-radius: var(--radius-2xl);
//   padding: 2rem;
//   backdrop-filter: blur(10px);
//   -webkit-backdrop-filter: blur(10px);
//   transition: all var(--transition-normal);
// }

// .chart-container:hover {
//   border-color: rgba(16, 185, 129, 0.4);
//   box-shadow: 0 0 40px rgba(16, 185, 129, 0.1);
// }

// .chart-container.large {
//   grid-column: 1 / -1;
// }

// .chart-header {
//   margin-bottom: 2rem;
// }

// .chart-header h2 {
//   font-size: 1.5rem;
//   font-weight: 700;
//   margin-bottom: 0.5rem;
//   color: var(--color-text-primary);
// }

// .chart-subtitle {
//   color: var(--color-text-muted);
//   font-size: 0.9rem;
// }

// /* ============================================
//    STATUS SECTION
//    ============================================ */

// .status-section {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 2rem;
//   margin-bottom: 3rem;
// }

// .status-card,
// .impact-card {
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
//   border: 1px solid rgba(16, 185, 129, 0.2);
//   border-radius: var(--radius-2xl);
//   padding: 2rem;
//   backdrop-filter: blur(10px);
//   -webkit-backdrop-filter: blur(10px);
//   transition: all var(--transition-normal);
// }

// .status-card:hover,
// .impact-card:hover {
//   border-color: rgba(16, 185, 129, 0.4);
//   box-shadow: 0 0 40px rgba(16, 185, 129, 0.1);
// }

// .status-header,
// .impact-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 1.5rem;
// }

// .status-header h3,
// .impact-header h3 {
//   font-size: 1.3rem;
//   font-weight: 700;
//   color: var(--color-text-primary);
// }

// .status-indicator {
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   padding: 0.5rem 1rem;
//   background: rgba(16, 185, 129, 0.1);
//   border: 1px solid rgba(16, 185, 129, 0.3);
//   border-radius: var(--radius-lg);
//   font-size: 0.85rem;
//   color: var(--color-primary);
// }

// .pulse-dot {
//   display: inline-block;
//   width: 6px;
//   height: 6px;
//   background: var(--color-primary);
//   border-radius: 50%;
//   animation: pulse-animation 2s infinite;
// }

// .status-grid {
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   gap: 1.5rem;
// }

// .status-item {
//   background: rgba(0, 0, 0, 0.2);
//   border: 1px solid rgba(16, 185, 129, 0.2);
//   border-radius: var(--radius-lg);
//   padding: 1.25rem;
//   display: flex;
//   align-items: center;
//   gap: 1rem;
//   transition: all var(--transition-normal);
// }

// .status-item:hover {
//   background: rgba(16, 185, 129, 0.05);
//   border-color: rgba(16, 185, 129, 0.4);
//   transform: translateY(-4px);
// }

// .status-item.status-primary .status-icon {
//   color: var(--color-primary);
//   background: rgba(16, 185, 129, 0.15);
// }

// .status-item.status-success .status-icon {
//   color: var(--color-eco);
//   background: rgba(6, 182, 212, 0.15);
// }

// .status-item.status-secondary .status-icon {
//   color: var(--color-secondary);
//   background: rgba(59, 130, 246, 0.15);
// }

// .status-item.status-eco .status-icon {
//   color: var(--color-primary-light);
//   background: rgba(110, 231, 183, 0.15);
// }

// .status-icon {
//   width: 40px;
//   height: 40px;
//   border-radius: var(--radius-md);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 1.25rem;
//   flex-shrink: 0;
//   transition: all var(--transition-normal);
// }

// .status-item:hover .status-icon {
//   transform: scale(1.1);
// }

// .status-text {
//   display: flex;
//   flex-direction: column;
// }

// .status-label {
//   font-size: 0.8rem;
//   color: var(--color-text-muted);
//   text-transform: uppercase;
//   letter-spacing: 0.3px;
//   font-weight: 600;
// }

// .status-value {
//   font-size: 1.1rem;
//   font-weight: 700;
//   color: var(--color-text-primary);
// }

// /* ============================================
//    IMPACT CARD
//    ============================================ */

// .impact-icon {
//   font-size: 2rem;
//   color: var(--color-primary);
// }

// .impact-stats {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
//   gap: 1.5rem;
// }

// .impact-stat {
//   display: flex;
//   align-items: center;
//   gap: 1rem;
//   padding: 1rem;
//   background: rgba(16, 185, 129, 0.05);
//   border-radius: var(--radius-lg);
//   transition: all var(--transition-normal);
// }

// .impact-stat:hover {
//   background: rgba(16, 185, 129, 0.15);
//   transform: translateY(-4px);
// }

// .impact-stat-icon {
//   font-size: 1.75rem;
//   color: var(--color-primary);
// }

// .impact-stat-value {
//   font-size: 1.4rem;
//   font-weight: 700;
//   color: var(--color-text-primary);
// }

// .impact-stat-label {
//   font-size: 0.75rem;
//   color: var(--color-text-muted);
// }

// /* ============================================
//    INSTALLATION SECTION
//    ============================================ */

// .installation-section {
//   margin-bottom: 3rem;
// }

// .section-title {
//   margin-bottom: 2rem;
// }

// .section-title h2 {
//   font-size: 1.5rem;
//   font-weight: 700;
//   color: var(--color-text-primary);
//   margin-bottom: 0.5rem;
// }

// .section-title p {
//   color: var(--color-text-muted);
// }

// .installation-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
//   gap: 1.5rem;
// }

// .installation-card {
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
//   border: 1px solid rgba(16, 185, 129, 0.2);
//   border-radius: var(--radius-2xl);
//   padding: 1.75rem;
//   text-align: center;
//   transition: all var(--transition-normal);
//   position: relative;
//   overflow: hidden;
// }

// .installation-card::before {
//   content: '';
//   position: absolute;
//   top: -50%;
//   right: -50%;
//   width: 200%;
//   height: 200%;
//   background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
//   opacity: 0;
//   transition: opacity var(--transition-normal);
// }

// .installation-card:hover {
//   transform: translateY(-12px);
//   border-color: rgba(16, 185, 129, 0.4);
//   box-shadow: 0 0 40px rgba(16, 185, 129, 0.2);
// }

// .installation-card:hover::before {
//   opacity: 1;
// }

// .installation-icon {
//   width: 60px;
//   height: 60px;
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
//   border-radius: var(--radius-lg);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 1.75rem;
//   color: var(--color-primary);
//   margin: 0 auto 1rem;
//   transition: all var(--transition-normal);
// }

// .installation-card:hover .installation-icon {
//   transform: scale(1.15) rotate(-10deg);
//   background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3));
// }

// .installation-card h3 {
//   font-size: 1.1rem;
//   font-weight: 700;
//   color: var(--color-text-primary);
//   margin-bottom: 1rem;
// }

// .specs-list {
//   list-style: none;
//   text-align: left;
// }

// .specs-list li {
//   font-size: 0.85rem;
//   color: var(--color-text-secondary);
//   padding: 0.5rem 0;
//   border-bottom: 1px solid rgba(16, 185, 129, 0.1);
//   transition: all var(--transition-normal);
// }

// .specs-list li:last-child {
//   border-bottom: none;
// }

// .installation-card:hover .specs-list li {
//   color: var(--color-text-primary);
//   padding-left: 0.5rem;
// }

// /* ============================================
//    RESPONSIVE DESIGN
//    ============================================ */

// @media (max-width: 1024px) {
//   .charts-section {
//     grid-template-columns: 1fr;
//   }

//   .chart-container.large {
//     grid-column: 1;
//   }

//   .status-section {
//     grid-template-columns: 1fr;
//   }

//   .header-content {
//     flex-direction: column;
//     align-items: flex-start;
//   }
// }

// @media (max-width: 768px) {
//   .dashboard-header {
//     padding: 1.5rem;
//   }

//   .header-info h1 {
//     font-size: 1.5rem;
//   }

//   .dashboard-main {
//     padding: 1rem;
//   }

//   .metrics-grid {
//     grid-template-columns: 1fr;
//     gap: 1rem;
//   }

//   .status-grid {
//     grid-template-columns: 1fr;
//   }

//   .impact-stats {
//     grid-template-columns: 1fr;
//   }

//   .installation-grid {
//     grid-template-columns: 1fr;
//   }

//   .section-title h2 {
//     font-size: 1.25rem;
//   }
// }

// @media (max-width: 480px) {
//   .header-meta {
//     flex-direction: column;
//     width: 100%;
//   }

//   .location-badge,
//   .status-badge {
//     width: 100%;
//     justify-content: center;
//   }

//   .metric-card {
//     padding: 1.25rem;
//   }

//   .metric-value {
//     font-size: 1.4rem;
//   }

//   .metric-icon {
//     width: 40px;
//     height: 40px;
//     font-size: 1.25rem;
//   }
// }

// /* ============================================
//    ACCESSIBILITY & UTILITIES
//    ============================================ */

// @media (prefers-reduced-motion: reduce) {
//   * {
//     animation: none !important;
//     transition: none !important;
//   }
// }

// /* Scrollbar Styling */
// ::-webkit-scrollbar {
//   width: 8px;
//   height: 8px;
// }

// ::-webkit-scrollbar-track {
//   background: rgba(16, 185, 129, 0.05);
// }

// ::-webkit-scrollbar-thumb {
//   background: rgba(16, 185, 129, 0.3);
//   border-radius: 4px;
// }

// ::-webkit-scrollbar-thumb:hover {
//   background: rgba(16, 185, 129, 0.5);
// }

// /* Selection styling */
// ::selection {
//   background: rgba(16, 185, 129, 0.3);
//   color: var(--color-text-primary);
// }