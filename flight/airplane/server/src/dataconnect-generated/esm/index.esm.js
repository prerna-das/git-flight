import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'server',
  location: 'us-central1'
};

export const createBookingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBooking', inputVars);
}
createBookingRef.operationName = 'CreateBooking';

export function createBooking(dcOrVars, vars) {
  return executeMutation(createBookingRef(dcOrVars, vars));
}

export const getFlightSearchesByUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFlightSearchesByUser', inputVars);
}
getFlightSearchesByUserRef.operationName = 'GetFlightSearchesByUser';

export function getFlightSearchesByUser(dcOrVars, vars) {
  return executeQuery(getFlightSearchesByUserRef(dcOrVars, vars));
}

export const updateFlightSearchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFlightSearch', inputVars);
}
updateFlightSearchRef.operationName = 'UpdateFlightSearch';

export function updateFlightSearch(dcOrVars, vars) {
  return executeMutation(updateFlightSearchRef(dcOrVars, vars));
}

export const listAirportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAirports');
}
listAirportsRef.operationName = 'ListAirports';

export function listAirports(dc) {
  return executeQuery(listAirportsRef(dc));
}

