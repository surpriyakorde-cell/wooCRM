# WooCRM — WooCommerce CRM Dashboard

WooCRM is a customer relationship management dashboard designed to help WooCommerce store owners manage customer information, track orders, organize customer reviews, and access useful business insights from one place.

The project includes a web-based dashboard, an Express.js backend, and a WooCommerce REST API integration. It also supports demo data so the application can be explored without connecting a live store.

## Features

- **Customer Management:** View customer information, order counts, spending, and customer status.
- **Order Management:** View order details, customer associations, dates, and order status.
- **Customer Notes and Status:** Maintain customer notes and update customer statuses.
- **Review Management:** Add customer reviews, view ratings, and manage review statuses.
- **Dashboard Statistics:** View customer totals, order summaries, revenue estimates, follow-ups, and average review ratings.
- **WooCommerce Integration:** Connect a WooCommerce store using its store URL and REST API credentials.
- **AI-Powered Insights:** Generate summaries of customer reviews when AI service credentials are configured.
- **Demo Mode:** Explore the dashboard with sample data when a live store is not connected.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Integration:** WooCommerce REST API
- **Data Handling:** JavaScript and JSON
- **AI Integration:** Configurable AI service for review insights
- **Version Control:** Git and GitHub

## Project Structure

```text
WooCRM/
├── server/
│   ├── app.js
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   ├── domain/
│   ├── data/
│   └── services/
├── src/                  # Frontend source, if using src/
├── package.json
├── .gitignore
└── README.md
```

The exact frontend folder structure may vary depending on the project setup.

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- A WooCommerce store with REST API credentials for live integration
- An AI API key if AI-powered review insights are required

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/WooCRM.git
cd WooCRM
```

Replace `YOUR-GITHUB-USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

If the backend has a separate `package.json`, install its dependencies from the appropriate backend directory as well.

### 3. Configure environment variables

Create a local `.env` file in the location expected by the backend. Use the variable names supported by the project.

Example:

```env
PORT=4000
WOOCOMMERCE_STORE_URL=
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=
```

Keep all real API credentials private. Do not commit your `.env` file or publish your Consumer Secret or AI API key.

### 4. Start the application

Run the frontend and backend using the scripts configured in `package.json`.

For the backend, if its dependencies are installed and the package configuration supports ES modules, the server entry point is:

```bash
node server/index.js
```

The API server defaults to:

```text
http://localhost:4000
```

The health endpoint is:

```text
http://localhost:4000/api/health
```

Use the frontend development command configured in your `package.json` (commonly `npm run dev`) to launch the dashboard.

### 5. Connect WooCommerce

For a live connection, provide the store's public HTTPS URL and valid WooCommerce REST API Consumer Key and Consumer Secret through the application's connection flow.

The WooCommerce REST API credentials must have the permissions needed for the endpoints being accessed. Demo mode can be used when live integration is not configured.

**Note:** A WordPress Playground URL may not be reachable from a locally running backend. Live integration requires an accessible WooCommerce REST API endpoint.

## API Overview

The backend exposes endpoints for the application's core functionality.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status and configuration |
| GET | `/api/customers` | Retrieve customers |
| PATCH | `/api/customers/:id` | Update customer status or notes |
| GET | `/api/orders` | Retrieve orders |
| GET | `/api/reviews` | Retrieve reviews |
| POST | `/api/reviews` | Add a review |
| PATCH | `/api/reviews/:id` | Update review status |
| GET | `/api/dashboard/stats` | Retrieve dashboard statistics |
| POST | `/api/insights` | Generate review insights when configured |
| POST | `/api/connect` | Validate and connect a WooCommerce store |

## Security Notes

- Never commit `.env` files or API credentials.
- Use a private repository while the project is under development.
- Restrict access to your WooCommerce API keys and rotate them if exposed.
- Before production deployment, add appropriate authentication and authorization, secure credential storage, request validation, and protection against unauthorized connection attempts.

## Project Status

This project is under development. Features and integrations may change as the application evolves.

## License

No license has been added yet. All rights remain with the repository owner unless a license is explicitly added.
