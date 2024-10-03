# Shopify Customer Management App

This is a full-stack Shopify customer management application built with React (frontend) and Node.js (backend). The app allows you to perform CRUD operations (Create, Read, Update, Delete) on Shopify customers using the Shopify Admin API.

## Table of Contents

- Installation
- Environment Variables
- Features
- Technologies Used
- Running the App
- Endpoints
- Notes

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/arjunpathy/teifi_shopify.git
   cd teifi_shopify
   ```

2. Install the dependencies for both frontend and backend:

   **Frontend (React)**

   ```
   cd app/client
   npm install
   ```

   **Backend (Node.js)**

   ```
   cd app/server
   npm install
   ```

## Environment Variables

Create `.env.local` files for both the frontend and backend to store the necessary environment variables.

**Frontend (app/client/.env.local)**

```
REACT_APP_SHOPIFY_SERVER_URL=http://localhost:5000
```

**Backend (app/server/.env.local)**

```
SHOPIFY_API_URL=https://<your-shopify-domain>/admin/api/2024-07/graphql.json
ACCESS_TOKEN=<your-shopify-access-token>
SHOPIFY_SERVER_PORT=5000
```

Note: Replace `<your-shopify-domain>` and `<your-shopify-access-token>` with your actual store domain and access token.

## Features

- Add, edit, delete, and list customers from your Shopify store.
- Pagination for customer list.
- Input validation for customer details.
- Error handling and user feedback.

## Technologies Used

- **Frontend:** React, Shopify Polaris
- **Backend:** Node.js, Express
- **Database:** Not applicable (uses Shopify API)
- **Others:** CORS, dotenv, libphonenumber-js

## Running the App

1. Start the backend server:

   ```
   cd app/server
   node index.js
   ```

2. Start the frontend:
   ```
   cd app/client
   npm start
   ```

## Endpoints

- **Create Customer:** `POST /customers`
    - Creates a new customer in the Shopify store. The customer is automatically tagged with "42".
    - Body parameters:
        - firstName: Customer's first name
        - lastName: Customer's last name
        - email: Customer's email
        - tags: (Optional) Array of tags
        - phone: (Optional) Customer's phone number

- **Get Customers:** `GET /customers?cursor={cursor}&direction={direction}&limit={limit}`
    - Fetches a paginated list of customers. Supports forward and backward pagination.
    - Query parameters:
        - limit: (Optional) The number of customers to fetch per page (default is PAGINATION_LIMIT from .env.local).
        - direction: (Optional) Defines the pagination direction:
            - forward (default): Fetches the next set of results.
            - backward: Fetches the previous set of results.
        - cursor: (Optional) Cursor for pagination to fetch the next or previous set of customers.

- **Update Customer:** `PUT /customers/:id`
    - Updates customer details in the Shopify store. The customer is automatically tagged with "42" if not already tagged.
    - Body parameters:
        - firstName: Customer's first name
        - lastName: Customer's last name
        - email: Customer's email
        - tags: (Optional) Array of tags
        - phone: (Optional) Customer's phone number

- **Delete Customer:** `DELETE /customers/:id`
    - Deletes a customer from the Shopify store by ID.


## Notes

- Ensure you have the necessary permissions and access tokens to interact with the Shopify API.
- The app uses cursor-based pagination to efficiently navigate through customer lists.
