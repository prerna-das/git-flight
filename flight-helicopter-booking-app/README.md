# Flight and Helicopter Booking Application

## Overview
This project is a flight and helicopter booking application built using Node.js, Express, and Firebase. It utilizes Tailwind CSS for styling and provides a responsive user interface for booking flights and helicopters.

## Project Structure
```
flight-helicopter-booking-app
├── public
│   ├── css
│   │   ├── styles.css
│   │   └── tailwind.css
│   ├── js
│   │   └── app.js
│   ├── images
│   └── index.html
├── src
│   ├── routes
│   │   └── index.js
│   ├── controllers
│   │   └── bookingController.js
│   ├── services
│   │   └── firebaseService.js
│   └── app.js
├── firebase
│   └── firebaseConfig.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── .gitignore
```

## Features
- User-friendly interface for searching and booking flights and helicopters.
- Integration with Firebase for real-time data storage and retrieval.
- Responsive design using Tailwind CSS.
- Custom styling options available in `styles.css`.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd flight-helicopter-booking-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration
- Update the Firebase configuration in `firebase/firebaseConfig.js` with your Firebase project credentials.

## Running the Application
To start the server, run:
```
npm start
```
The application will be available at `http://localhost:3000`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.