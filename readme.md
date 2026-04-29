Build a full-stack MERN web application named **Employee QR Management System** with a modern admin dashboard UI.

## Core Features:

1. Admin can add new employees/members with fields:

* Employee ID (unique)
* Name
* Email
* Phone
* Department
* Designation
* Joining Date
* Photo (optional)

2. When an employee is added:

* Generate a unique QR code automatically.
* QR code should store only the Employee ID, not full details.
* Save employee data in MongoDB.
* Save QR reference in browser localStorage.

3. QR Scan Feature:

* Add camera-based QR scanner page.
* When QR is scanned, fetch employee details from backend using Employee ID.
* Show latest employee data in a clean profile card.

4. Admin Edit Feature:

* Admin can edit employee details.
* QR code must remain the same after update.
* When scanned again, updated data should appear.

5. Employee List Page:

* Show all employees in table format.
* Search by name / ID / department.
* Edit and delete buttons.
* Pagination if many records.

6. Dashboard:

* Total employees count
* Recently added employees
* Quick actions

## Tech Stack:

Frontend:

* React.js
* Tailwind CSS
* Axios
* React Router

Backend:

* Node.js
* Express.js

Database:

* MongoDB with Mongoose

Libraries:

* qrcode.react for QR generation
* html5-qrcode for scanning
* JWT for admin login authentication

## UI Requirements:

* Professional responsive design
* Sidebar navigation
* Navbar
* Cards, tables, modals
* Mobile friendly
* Clean color theme

## Folder Structure:

* client/
* server/

## API Routes:

* POST /api/employees/add
* GET /api/employees
* GET /api/employees/:empId
* PUT /api/employees/update/:id
* DELETE /api/employees/:id
* POST /api/auth/login

## Important Logic:

* QR stores only Employee ID.
* Same QR must work forever.
* Data updates should reflect instantly after edit.
* Use localStorage to store generated QR references.

## Bonus Features:

* Download QR as PNG
* Print employee ID card with QR
* Dark mode
* CSV export
* Role-based access

Generate clean production-ready code with comments and best practices.
