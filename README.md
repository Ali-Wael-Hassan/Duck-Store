# Duck Store 🦆📚

> **"A book is more than paper and ink; it is a spark that ignites the human spirit."**

Duck Store is a comprehensive web application originally conceived by students at FCAI. What started as a simple script to automate book tracking has grown into a sophisticated ecosystem for global information retrieval, bookstore commerce, and library inventory management. 

## ✨ Key Features

- **Store & Community:** Browse books (`store.html`), view individual details (`book-view.html`), and interact with the community (`community.html`).
- **Inventory Management:** Full administrative control to add, edit, and remove books from the library (`Book-&-inventory.html`).
- **Admin Dashboard:** A responsive administrative dashboard featuring dynamic charts, number counters, and CSV download functionalities to track transactions and metrics (`dashboard.html`).
- **Authentication System:** Sign in, sign up, and password reset workflows.
- **Gamification & Rewards:** Engage users with a rewards system and gamification admin panel (`reward.html`, `Gamification_Admen.html`).
- **User & Roles Management:** Manage different user roles and profiles efficiently (`users_roles.html`, `user_profile.html`).

## 📁 Project Structure

The project follows a clean, vanilla architecture without relying on heavy frameworks:

- **Root:** 
  - `index.html`: The landing page introducing the philosophy and history of Duck Store.
- **`/html`**: Contains all modular pages of the application (e.g., dashboard, store, community, inventory, login).
- **`/css`**: 
  - `component.css` & `classes.css`: Global design system and reusable components.
  - `/Pages`: Page-specific styling (e.g., `dashboard.css`, `about-us.css`).
- **`/JS`**: 
  - `/core/StorageManager.js`: The heart of data management, handling local storage interactions and data flow.
  - `/pages/`: Scripts specific to individual views (e.g., `dashboard-page.js`, `Book-&-inventory.js`).
  - `/modules/` & `main.js`: Global utilities and shared JavaScript logic.
- **`/assets`**: Images and static files used throughout the application.

## 🛠️ Technologies Used

- **HTML5:** Semantic HTML for structure and accessibility.
- **CSS3:** Custom responsive styling utilizing Flexbox/Grid, with a modular approach (`component.css` / `classes.css`).
- **JavaScript (ES6+):** Vanilla JavaScript for DOM manipulation, dynamic chart rendering, state management (via `StorageManager`), and dynamic pagination.

## 🚀 Getting Started

Since Duck Store is built entirely on vanilla web technologies, getting started is extremely simple:

1. Clone or download the repository.
2. Open `index.html` in your favorite modern web browser.
3. No Node.js, npm/yarn, or build steps are required to run the application locally!

## 👥 The Duck Collective
A community of editors, artists, and dreamers dedicated to digitizing knowledge with modern metadata structures.
