# TravelAir Charter Booking Server

This is the server component for the TravelAir helicopter charter booking platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
- Set up your SMTP server details
- Configure email addresses
- Set security keys
- Adjust server port if needed

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Charter Requests

#### Submit Charter Request
- **POST** `/api/charter/request`
- Body:
  ```json
  {
    "charterType": "private|business|tour|event",
    "charterDate": "2025-10-01",
    "charterTime": "14:30",
    "departureLocation": "string",
    "destination": "string",
    "passengers": "number",
    "helicopterType": "h125|aw139|bell429",
    "specialRequirements": "string"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Charter request received successfully",
    "requestId": "uuid",
    "status": "pending"
  }
  ```

#### Get Charter Request Status
- **GET** `/api/charter/request/:id`
- Response:
  ```json
  {
    "success": true,
    "request": {
      "id": "uuid",
      "timestamp": "date",
      "status": "pending|confirmed|cancelled",
      "charterType": "string",
      ...
    }
  }
  ```

## Email Notifications

The server sends email notifications for:
1. New charter requests (to staff)
2. Confirmation emails (to customers)

Configure the SMTP settings in the `.env` file to enable email notifications.

## Security

The server implements several security measures:
- CORS protection
- Helmet security headers
- Input validation
- Rate limiting (TODO)
- Request sanitization

## Error Handling

All endpoints include proper error handling and validation:
- Invalid requests return 400 status
- Server errors return 500 status
- Detailed error messages in development
- Sanitized error messages in production

## Development

1. Install development dependencies:
```bash
npm install -D
```

2. Run in development mode:
```bash
npm run dev
```

This will start the server with nodemon for auto-reloading during development.

## Production Deployment

For production deployment:
1. Set NODE_ENV=production in .env
2. Configure proper SMTP settings
3. Set up proper security measures
4. Use a process manager (e.g., PM2)
5. Set up SSL/TLS
6. Configure proper logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request