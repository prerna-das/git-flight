class BookingController {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }

    async searchFlights(req, res) {
        try {
            const { origin, destination, date } = req.query;
            const flights = await this.firebaseService.getFlights(origin, destination, date);
            res.status(200).json(flights);
        } catch (error) {
            res.status(500).json({ message: 'Error searching for flights', error });
        }
    }

    async bookFlight(req, res) {
        try {
            const bookingData = req.body;
            const result = await this.firebaseService.bookFlight(bookingData);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error booking flight', error });
        }
    }

    async getUserProfile(req, res) {
        try {
            const userId = req.params.id;
            const userProfile = await this.firebaseService.getUserProfile(userId);
            res.status(200).json(userProfile);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user profile', error });
        }
    }
}

export default BookingController;