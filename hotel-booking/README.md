# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.



    ├── pages/
│   │   ├── Home.jsx
│   │   ├── Hotels.jsx
│   │   ├── HotelDetails.jsx
│   │   ├── Booking.jsx
│   │   ├── MyBookings.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── NotFound.jsx
│   │   └── About.jsx
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── BookingContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useHotels.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── hotelService.js
│   │   ├── authService.js
│   │   └── bookingService.js
│   │
│   ├── data/
│   │   └── hotels.js
│   │
│   ├── utils/
│   │   ├── formatPrice.js
│   │   ├── formatDate.js
│   │   └── validation.js
│   │
│   ├── styles/
│   │   ├── variables.css
│   │   ├── Navbar.css
│   │   ├── Footer.css
│   │   ├── Home.css
│   │   ├── Hotels.css
│   │   ├── HotelDetails.css
│   │   ├── Booking.css
│   │   ├── Auth.css
│   │   └── Responsive.css
│   │