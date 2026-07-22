# Jack's Smart Reservation System

## Project structure

- `index.html` is the restaurant discovery home page.
- `assets/` contains only runtime images and videos used by the application.
- `data/factories/` contains constant default data only.
- `data/seeders/seeders.js` is the only file that inserts factory data into localStorage.
- `pages/` contains separate Booking, Profile, Login, Signup, Concierge, and Contact pages.
- `pages/admin/` contains the separate admin login and dashboard pages.
- `styles/` contains small stylesheets grouped by feature.
- `scripts/pages/` contains customer page logic and the shared storage helper.
- `scripts/pages/admin/` contains admin management logic.
- `scripts/3d-booking/` contains the Three.js booking-floor modules.
- `scripts/vendor/` contains third-party source code.

The customer pages share the same navigation and feature scripts. Each page declares
its purpose with `data-customer-page`, and `scripts/pages/app.js` starts only the view
that belongs to that page.

## Local data flow

1. Restaurant, booking, user, and local-storage factories define constants only.
2. Factory files never read from or write to localStorage.
3. `seedLocalStorage()` has one call site in `data/seeders/seeders.js`.
4. A saved seed version ensures that seeding runs only once for that data version.
5. The seeder writes only missing collections, so existing user data is preserved.
6. Customer and admin features read and update those shared collections.
7. A temporary booking draft preserves the booking form when the browser moves
   between Login, Restaurant Discovery, and Booking pages.

Every HTML document loads the same seeder so that a direct visit to any page works.
After the first load, the saved version prevents the seeding function from running again.

## Running the project

Run the project through a local web server so browser modules and the 3D floor load correctly.
