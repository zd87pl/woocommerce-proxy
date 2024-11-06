# WooCommerce API Proxy Manager

A proxy service that allows you to intercept and route WooCommerce.com API traffic to internal endpoints while maintaining pass-through functionality for non-intercepted routes.

## Features

- Proxy WooCommerce.com API traffic
- Configure custom routes for internal API endpoints
- Enable/disable routes on the fly
- User-friendly web interface for route management
- Automatic route configuration refresh
- MongoDB storage for route persistence

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd woocommerce-proxy
```

2. Start the services:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

## Usage

1. Access the web interface at http://localhost

2. Managing Routes:
   - Click "Add New Route" to create a new route
   - Specify the path (e.g., `/v1/products`)
   - Set the target URL for internal routing
   - Add an optional description
   - Enable/disable routes using the toggle switch

3. Route Configuration:
   - Path: The WooCommerce API path to intercept (e.g., `/v1/products`)
   - Target URL: Your internal API endpoint (e.g., `http://internal-api.local/products`)
   - Description: Optional note about the route's purpose
   - Enabled: Toggle to activate/deactivate the route

4. Pass-through Mode:
   - Any routes not configured or disabled will automatically pass through to WooCommerce.com
   - This ensures minimal disruption to existing functionality

## Architecture

- Frontend: React with Material-UI
- Backend: Node.js/Express proxy server
- Database: MongoDB for route storage
- Docker: Containerized deployment

## Configuration

The proxy server automatically refreshes route configurations every 5 minutes. You can modify this interval in the backend/server.js file.

## Security Considerations

- This proxy is designed for development and testing purposes
- Implement appropriate security measures before using in production
- Consider adding authentication for the management interface
- Review and monitor proxy logs regularly

## Troubleshooting

1. If routes aren't being intercepted:
   - Check if the route is enabled in the web interface
   - Verify the path matches exactly
   - Check the target URL is accessible

2. If the web interface is unavailable:
   - Ensure all containers are running: `docker-compose ps`
   - Check container logs: `docker-compose logs`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
