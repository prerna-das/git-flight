const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'server',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createBookingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBooking', inputVars);
}
createBookingRef.operationName = 'CreateBooking';
exports.createBookingRef = createBookingRef;

exports.createBooking = function createBooking(dcOrVars, vars) {
  return executeMutation(createBookingRef(dcOrVars, vars));
};

const getFlightSearchesByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFlightSearchesByUser', inputVars);
}
getFlightSearchesByUserRef.operationName = 'GetFlightSearchesByUser';
exports.getFlightSearchesByUserRef = getFlightSearchesByUserRef;

exports.getFlightSearchesByUser = function getFlightSearchesByUser(dcOrVars, vars) {
  return executeQuery(getFlightSearchesByUserRef(dcOrVars, vars));
};

const updateFlightSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFlightSearch', inputVars);
}
updateFlightSearchRef.operationName = 'UpdateFlightSearch';
exports.updateFlightSearchRef = updateFlightSearchRef;

exports.updateFlightSearch = function updateFlightSearch(dcOrVars, vars) {
  return executeMutation(updateFlightSearchRef(dcOrVars, vars));
};

const listAirportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAirports');
}
listAirportsRef.operationName = 'ListAirports';
exports.listAirportsRef = listAirportsRef;

exports.listAirports = function listAirports(dc) {
  return executeQuery(listAirportsRef(dc));
};
