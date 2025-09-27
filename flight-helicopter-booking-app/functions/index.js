const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getJson } = require("serpapi");
require("dotenv").config();

admin.initializeApp();

// Use GOOGLE_FLIGHTS_API_KEY from .env.local
const GOOGLE_FLIGHTS_API_KEY = process.env.GOOGLE_FLIGHTS_API_KEY;

exports.searchFlights = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { departure_id, arrival_id, outbound_date, return_date, currency, adults } = data;

    if (!departure_id || !arrival_id || !outbound_date) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with the arguments "departure_id", "arrival_id", and "outbound_date".');
    }

    const params = {
        engine: "google_flights",
        departure_id: departure_id,
        arrival_id: arrival_id,
        outbound_date: outbound_date,
        return_date: return_date,
        currency: currency || "USD",
        adults: adults || 1,
        api_key: GOOGLE_FLIGHTS_API_KEY
    };

    try {
        const json = await getJson(params);
        return json;
    } catch (error) {
        console.error("Error fetching flights from SerpApi:", error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch flight data.');
    }
});