# Reaction Client⚡️ 
> Architected a reactive Vue 3 frontend utilizing Pinia for modular state management and GSAP for high-fidelity timeline animations, significantly enhancing user engagement through intuitive visual feedback.

[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/) [![Pinia](https://img.shields.io/badge/Pinia-F1C40F?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/) [![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/) [![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
***
## 🔗 Quick Links
- **🚀 [Live Site](https://trainreaction.gg)** 
- **🎥 [Demo Video](https://michaelgreenl.net/#projects?slug=reaction&autoplay=true)** 
- **⚙ [Backend Repository](https://github.com/michaelgreenl/reaction-api)** 
- **💼 [Portfolio Link](https://michaelgreenl.net/#projects?slug=reaction&autoplay=false)** 

---
## 📖 Overview
> A precision-focused cognitive training application that gamifies reaction time improvement through a high-performance, GSAP-animated interface and detailed statistical tracking.  

Constructed with Vue 3 and Vite for a reactive, high-performance frontend, leveraging Pinia for intricate state management across game loops and user profiles. The application utilizes GreenSock (GSAP) to drive frame-perfect animations, ensuring the visual feedback loop is tightly coupled with the underlying reliable 10ms timing engine.

---
## ⚡ Technical Highlights
#### GSAP-Powered Animation Orchestration
Complex UI transitions and game state changes are managed via GreenSock (GSAP) timelines, decoupled into reusable composables (`useGameAnimations`) to ensure 60fps performance without cluttering Vue components.
#### Unified API Service
A centralized `api.js` module abstracts fetch complexities, automatically handling credential inclusion (`credentials: 'include'`), JSON headers, and standardized error parsing across the entire application.
#### Adaptive Responsive Logic
Implemented a custom `useBreakpoints` composable to programmatically handle UI collisions, such as auto-collapsing the "Recent Games" panel when entering settings on mobile devices.

---
## 🏗️ Architecture & Design Decisions 
#### Decoupled Animation Logic
Animation logic was extracted from View components into specialized composables (e.g., `useUtilAnimations`). This keeps the View components declarative—focused on structure and state, while the imperative animation logic remains reusable and testable.
#### Centralized Authentication State
Session state is managed purely through `authStore` which serves as the single source of truth for the entire app, leveraging Vue's reactivity system to instantly update UI elements (like Navbars and Loaders) based on login status.

---
### 🛠️ Tech Stack
- **Framework:** Vue 3 (Composition API)
- **State:** Pinia
- **Styling:** Sass (SCSS)
- **Animation:** GSAP (GreenStock)
- **Infrastructure:** Github Pages

---
