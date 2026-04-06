// import React from 'react'
// import Lottie from "lottie-react";
// import loader from "../../Assets/Animation/loader.json"
// import styled from 'styled-components';

// const Loader = () => {
//     return (
//         <Wrapper>
//             <div className='loading_layout'>
//                 <div className='childView'>
//                     <Lottie className='lottieStyle' animationData={loader} loop={true} />
//                 </div>
//             </div>
//         </Wrapper>
//     )
// }

// const Wrapper = styled.section`
// .childView{
//     width: 250px;
//     height : 250px;
//     margin-top: 200px;
//     position: relative;
//     z-index: 999;
    
// }
// .loading_layout{
//    width : 100%;
//    height: 100%;
//    position: absolute;
//    z-index: 9999;
//    background-color: black;
//    opacity: 0.8;
//    display: flex;
//    justify-content: center;
// }
// `;

// export default Loader
import React from "react";
import styled, { keyframes } from "styled-components";

const Loader = () => {
  return (
    <Wrapper>
      <div className="loading_layout">
        <div className="childView">
          <div className="pulseRings">
            <div className="ring ring1" />
            <div className="ring ring2" />
            <div className="ring ring3" />
            <div className="centerDot" />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Loader;
/* ================= Animations ================= */

const pulse = keyframes`
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
`;

const glow = keyframes`
  0%,100% {
    box-shadow: 0 0 20px rgba(57,213,255,0.8);
  }
  50% {
    box-shadow: 0 0 40px rgba(155,89,182,0.8);
  }
`;

/* ================= Wrapper ================= */

const Wrapper = styled.section`
  .loading_layout {
    width: 100%;
    height: 100%;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .childView {
    width: 250px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulseRings {
    position: relative;
    width: 200px;
    height: 200px;
  }

  .ring {
    position: absolute;
    border-radius: 50%;
    border: 4px solid;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ${pulse} 2s ease-out infinite;
  }

  .ring1 {
    border-color: #39d5ff;
    animation-delay: 0s;
  }

  .ring2 {
    border-color: #9b59b6;
    animation-delay: 0.5s;
  }

  .ring3 {
    border-color: #e74c3c;
    animation-delay: 1s;
  }

  .centerDot {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #39d5ff, #9b59b6);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ${glow} 1.5s infinite;
  }
`;



// import React, { useState } from 'react';

// const LoaderShowcase = () => {
//   const [activeLoader, setActiveLoader] = useState(1);

//   return (
//     <div style={styles.container}>
//       <div style={styles.controls}>
//         <button 
//           onClick={() => setActiveLoader(1)} 
//           style={{...styles.button, ...(activeLoader === 1 ? styles.buttonActive : {})}}
//         >
//           Pulse Rings
//         </button>
//         <button 
//           onClick={() => setActiveLoader(2)} 
//           style={{...styles.button, ...(activeLoader === 2 ? styles.buttonActive : {})}}
//         >
//           Spinning Orbit
//         </button>
//         <button 
//           onClick={() => setActiveLoader(3)} 
//           style={{...styles.button, ...(activeLoader === 3 ? styles.buttonActive : {})}}
//         >
//           Wave Dots
//         </button>
//       </div>

//       {activeLoader === 1 && <PulseRingsLoader />}
//       {activeLoader === 2 && <SpinningOrbitLoader />}
//       {activeLoader === 3 && <WaveDotsLoader />}
//     </div>
//   );
// };

// // Loader 1: Pulse Rings
// const PulseRingsLoader = () => {
//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.loadingLayout}>
//         <div style={styles.childView}>
//           <div style={styles.pulseRings}>
//             <style>{pulseRingsKeyframes}</style>
//             <div style={{...styles.ring, ...styles.ring1}}></div>
//             <div style={{...styles.ring, ...styles.ring2}}></div>
//             <div style={{...styles.ring, ...styles.ring3}}></div>
//             <div style={styles.centerDot}></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Loader 2: Spinning Orbit
// const SpinningOrbitLoader = () => {
//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.loadingLayout}>
//         <div style={styles.childView}>
//           <div style={styles.spinningOrbit}>
//             <style>{spinningOrbitKeyframes}</style>
//             <div style={{...styles.orbit, ...styles.orbit1}}>
//               <div style={{...styles.planet, ...styles.planet1}}></div>
//             </div>
//             <div style={{...styles.orbit, ...styles.orbit2}}>
//               <div style={{...styles.planet, ...styles.planet2}}></div>
//             </div>
//             <div style={{...styles.orbit, ...styles.orbit3}}>
//               <div style={{...styles.planet, ...styles.planet3}}></div>
//             </div>
//             <div style={styles.core}></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Loader 3: Wave Dots
// const WaveDotsLoader = () => {
//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.loadingLayout}>
//         <div style={styles.childView}>
//           <div style={styles.waveDots}>
//             <style>{waveDotsKeyframes}</style>
//             <div style={{...styles.dot, animationDelay: '0s'}}></div>
//             <div style={{...styles.dot, animationDelay: '0.1s'}}></div>
//             <div style={{...styles.dot, animationDelay: '0.2s'}}></div>
//             <div style={{...styles.dot, animationDelay: '0.3s'}}></div>
//             <div style={{...styles.dot, animationDelay: '0.4s'}}></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Keyframes
// const pulseRingsKeyframes = `
//   @keyframes pulse {
//     0% {
//       width: 20px;
//       height: 20px;
//       opacity: 1;
//     }
//     100% {
//       width: 200px;
//       height: 200px;
//       opacity: 0;
//     }
//   }
//   @keyframes glow {
//     0%, 100% {
//       box-shadow: 0 0 20px rgba(57, 213, 255, 0.8);
//     }
//     50% {
//       box-shadow: 0 0 40px rgba(155, 89, 182, 0.8);
//     }
//   }
// `;

// const spinningOrbitKeyframes = `
//   @keyframes rotate {
//     from {
//       transform: translate(-50%, -50%) rotate(0deg);
//     }
//     to {
//       transform: translate(-50%, -50%) rotate(360deg);
//     }
//   }
//   @keyframes rotateReverse {
//     from {
//       transform: translate(-50%, -50%) rotate(360deg);
//     }
//     to {
//       transform: translate(-50%, -50%) rotate(0deg);
//     }
//   }
//   @keyframes coreGlow {
//     0%, 100% {
//       box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
//     }
//     50% {
//       box-shadow: 0 0 50px rgba(118, 75, 162, 1);
//     }
//   }
// `;

// const waveDotsKeyframes = `
//   @keyframes wave {
//     0%, 100% {
//       transform: translateY(0) scale(1);
//       background: linear-gradient(135deg, #39d5ff, #9b59b6);
//     }
//     50% {
//       transform: translateY(-30px) scale(1.3);
//       background: linear-gradient(135deg, #e74c3c, #f39c12);
//       box-shadow: 0 0 30px rgba(231, 76, 60, 0.8);
//     }
//   }
// `;

// // Styles
// const styles = {
//   container: {
//     width: '100%',
//     height: '100vh',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   controls: {
//     position: 'absolute',
//     top: '40px',
//     display: 'flex',
//     gap: '15px',
//     zIndex: 10000,
//   },
//   button: {
//     padding: '12px 24px',
//     background: 'rgba(255, 255, 255, 0.1)',
//     border: '2px solid rgba(255, 255, 255, 0.3)',
//     color: 'white',
//     borderRadius: '25px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     fontWeight: '600',
//     transition: 'all 0.3s ease',
//     backdropFilter: 'blur(10px)',
//   },
//   buttonActive: {
//     background: 'white',
//     color: '#667eea',
//     borderColor: 'white',
//   },
//   wrapper: {
//     width: '100%',
//     height: '100%',
//   },
//   childView: {
//     width: '250px',
//     height: '250px',
//     position: 'relative',
//     zIndex: 999,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingLayout: {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     zIndex: 9999,
//     background: 'rgba(0, 0, 0, 0.85)',
//     backdropFilter: 'blur(8px)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // Pulse Rings Styles
//   pulseRings: {
//     position: 'relative',
//     width: '200px',
//     height: '200px',
//   },
//   ring: {
//     position: 'absolute',
//     borderRadius: '50%',
//     border: '4px solid',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     animation: 'pulse 2s ease-out infinite',
//   },
//   ring1: {
//     borderColor: '#39d5ff',
//     animationDelay: '0s',
//   },
//   ring2: {
//     borderColor: '#9b59b6',
//     animationDelay: '0.5s',
//   },
//   ring3: {
//     borderColor: '#e74c3c',
//     animationDelay: '1s',
//   },
//   centerDot: {
//     position: 'absolute',
//     width: '20px',
//     height: '20px',
//     background: 'linear-gradient(135deg, #39d5ff, #9b59b6)',
//     borderRadius: '50%',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     boxShadow: '0 0 20px rgba(57, 213, 255, 0.8)',
//     animation: 'glow 1.5s ease-in-out infinite',
//   },
//   // Spinning Orbit Styles
//   spinningOrbit: {
//     position: 'relative',
//     width: '200px',
//     height: '200px',
//   },
//   orbit: {
//     position: 'absolute',
//     border: '2px solid rgba(255, 255, 255, 0.2)',
//     borderRadius: '50%',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//   },
//   orbit1: {
//     width: '180px',
//     height: '180px',
//     animation: 'rotate 3s linear infinite',
//   },
//   orbit2: {
//     width: '130px',
//     height: '130px',
//     animation: 'rotateReverse 2s linear infinite',
//   },
//   orbit3: {
//     width: '80px',
//     height: '80px',
//     animation: 'rotate 1.5s linear infinite',
//   },
//   planet: {
//     position: 'absolute',
//     width: '16px',
//     height: '16px',
//     borderRadius: '50%',
//     top: '0',
//     left: '50%',
//     transform: 'translateX(-50%)',
//   },
//   planet1: {
//     background: 'linear-gradient(135deg, #39d5ff, #2575fc)',
//     boxShadow: '0 0 15px rgba(57, 213, 255, 0.8)',
//   },
//   planet2: {
//     background: 'linear-gradient(135deg, #f093fb, #f5576c)',
//     boxShadow: '0 0 15px rgba(245, 87, 108, 0.8)',
//   },
//   planet3: {
//     background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
//     boxShadow: '0 0 15px rgba(0, 242, 254, 0.8)',
//   },
//   core: {
//     position: 'absolute',
//     width: '30px',
//     height: '30px',
//     background: 'linear-gradient(135deg, #667eea, #764ba2)',
//     borderRadius: '50%',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     boxShadow: '0 0 30px rgba(102, 126, 234, 0.8)',
//     animation: 'coreGlow 2s ease-in-out infinite',
//   },
//   // Wave Dots Styles
//   waveDots: {
//     display: 'flex',
//     gap: '15px',
//     alignItems: 'center',
//   },
//   dot: {
//     width: '20px',
//     height: '20px',
//     borderRadius: '50%',
//     background: 'linear-gradient(135deg, #39d5ff, #9b59b6)',
//     animation: 'wave 1.2s ease-in-out infinite',
//     boxShadow: '0 0 20px rgba(57, 213, 255, 0.6)',
//   },
// };

// export default LoaderShowcase;