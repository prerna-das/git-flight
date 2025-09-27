import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Airport_Key {
  id: UUIDString;
  __typename?: 'Airport_Key';
}

export interface Booking_Key {
  id: UUIDString;
  __typename?: 'Booking_Key';
}

export interface CreateBookingData {
  booking_insert: Booking_Key;
}

export interface CreateBookingVariables {
  userId: UUIDString;
  bookingDate: TimestampString;
  bookingReference: string;
  currency?: string | null;
  totalPrice: number;
}

export interface FlightSearch_Key {
  id: UUIDString;
  __typename?: 'FlightSearch_Key';
}

export interface FlightSegment_Key {
  id: UUIDString;
  __typename?: 'FlightSegment_Key';
}

export interface GetFlightSearchesByUserData {
  flightSearches: ({
    id: UUIDString;
    arrivalAirportCode: string;
    departureAirportCode: string;
    departureDate: DateString;
    returnDate?: DateString | null;
    passengers: number;
  } & FlightSearch_Key)[];
}

export interface GetFlightSearchesByUserVariables {
  userId: UUIDString;
}

export interface ListAirportsData {
  airports: ({
    id: UUIDString;
    name: string;
    iataCode: string;
    city: string;
    country: string;
  } & Airport_Key)[];
}

export interface UpdateFlightSearchData {
  flightSearch_update?: FlightSearch_Key | null;
}

export interface UpdateFlightSearchVariables {
  id: UUIDString;
  passengers?: number | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateBookingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBookingVariables): MutationRef<CreateBookingData, CreateBookingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBookingVariables): MutationRef<CreateBookingData, CreateBookingVariables>;
  operationName: string;
}
export const createBookingRef: CreateBookingRef;

export function createBooking(vars: CreateBookingVariables): MutationPromise<CreateBookingData, CreateBookingVariables>;
export function createBooking(dc: DataConnect, vars: CreateBookingVariables): MutationPromise<CreateBookingData, CreateBookingVariables>;

interface GetFlightSearchesByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFlightSearchesByUserVariables): QueryRef<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFlightSearchesByUserVariables): QueryRef<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;
  operationName: string;
}
export const getFlightSearchesByUserRef: GetFlightSearchesByUserRef;

export function getFlightSearchesByUser(vars: GetFlightSearchesByUserVariables): QueryPromise<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;
export function getFlightSearchesByUser(dc: DataConnect, vars: GetFlightSearchesByUserVariables): QueryPromise<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;

interface UpdateFlightSearchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFlightSearchVariables): MutationRef<UpdateFlightSearchData, UpdateFlightSearchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFlightSearchVariables): MutationRef<UpdateFlightSearchData, UpdateFlightSearchVariables>;
  operationName: string;
}
export const updateFlightSearchRef: UpdateFlightSearchRef;

export function updateFlightSearch(vars: UpdateFlightSearchVariables): MutationPromise<UpdateFlightSearchData, UpdateFlightSearchVariables>;
export function updateFlightSearch(dc: DataConnect, vars: UpdateFlightSearchVariables): MutationPromise<UpdateFlightSearchData, UpdateFlightSearchVariables>;

interface ListAirportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAirportsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAirportsData, undefined>;
  operationName: string;
}
export const listAirportsRef: ListAirportsRef;

export function listAirports(): QueryPromise<ListAirportsData, undefined>;
export function listAirports(dc: DataConnect): QueryPromise<ListAirportsData, undefined>;

