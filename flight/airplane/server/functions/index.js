const functions = require("firebase-functions");
const axios = require("axios");
require("dotenv").config();

// This single function will handle all requests to external travel APIs.
exports.travelApiGateway = functions.https.onCall(async (data, context) => {
  // The "action" parameter determines which API to call.
  // The "params" object contains the necessary query parameters.
  const {action, params} = data;

  if (!action) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "An 'action' must be provided to the gateway.",
    );
  }

  // Securely retrieve the API key from server-side environment variables.
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    throw new functions.https.HttpsError(
        "internal",
        "The RapidAPI key is not configured on the server.",
    );
  }

  const googleFlightsApiKey = process.env.GOOGLE_FLIGHTS_API_KEY;

  let options;

  // A switch statement routes the request to the appropriate API configuration.
  switch (action) {
    case "getAirportInfo":
      if (!params || !params.iata) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "An 'iata' code is required for getAirportInfo.",
        );
      }
      options = {
        method: "GET",
        url: "https://airport-info.p.rapidapi.com/airport",
        params: {iata: params.iata},
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "airport-info.p.rapidapi.com",
        },
      };
      break;

    case "getFlightPrices":
      if (!params || !params.departId || !params.arrivalId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Both 'departId' and 'arrivalId' are required for getFlightPrices.",
        );
      }
      options = {
        method: "GET",
        url: "https://booking-com18.p.rapidapi.com/flights/v2/min-price-oneway",
        params: {departId: params.departId, arrivalId: params.arrivalId},
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "booking-com18.p.rapidapi.com",
        },
      };
      break;

    case "getRoutesFromAirport":
      if (!params || !params.iata) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "An 'iata' code is required for getRoutesFromAirport.",
        );
      }
      options = {
        method: "GET",
        // Example using TimeTable Lookup API.
        // The actual URL must be verified from RapidAPI documentation.
        url: `https://timetable-lookup.p.rapidapi.com/airports/${params.iata}/routes/`,
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "timetable-lookup.p.rapidapi.com",
        },
      };
      break;

    case "searchGoogleFlights":
      if (!params || !params.departure_id || !params.arrival_id ||
        !params.outbound_date) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "'departure_id', 'arrival_id', and 'outbound_date' are required " +
          "for searchGoogleFlights.",
        );
      }
      if (!googleFlightsApiKey) {
        throw new functions.https.HttpsError(
            "internal",
            "The Google Flights API key is not configured on the server.",
        );
      }
      options = {
        method: "GET",
        url: "https://serpapi.com/search.json",
        params: {
          engine: "google_flights",
          departure_id: params.departure_id,
          arrival_id: params.arrival_id,
          outbound_date: params.outbound_date,
          return_date: params.return_date,
          currency: params.currency || "USD",
          adults: params.adults || 1,
          api_key: googleFlightsApiKey,
        },
      };
      break;

    default:
      throw new functions.https.HttpsError(
          "not-found",
          `The action '${action}' is not a valid gateway action.`,
      );
  }

  // Execute the request and handle potential errors.
  try {
    const response = await axios.request(options);
    return response.data; // Return the data from the external API.
  } catch (error) {
    console.error(
        `Gateway Error for action '${action}':`,
        (error.response && error.response.data) || error.message,
    );
    throw new functions.https.HttpsError(
        "internal",
        `The external API call failed for action '${action}'.`,
    );
  }
});
