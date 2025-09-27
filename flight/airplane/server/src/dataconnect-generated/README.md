# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetFlightSearchesByUser*](#getflightsearchesbyuser)
  - [*ListAirports*](#listairports)
- [**Mutations**](#mutations)
  - [*CreateBooking*](#createbooking)
  - [*UpdateFlightSearch*](#updateflightsearch)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetFlightSearchesByUser
You can execute the `GetFlightSearchesByUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFlightSearchesByUser(vars: GetFlightSearchesByUserVariables): QueryPromise<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;

interface GetFlightSearchesByUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFlightSearchesByUserVariables): QueryRef<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;
}
export const getFlightSearchesByUserRef: GetFlightSearchesByUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFlightSearchesByUser(dc: DataConnect, vars: GetFlightSearchesByUserVariables): QueryPromise<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;

interface GetFlightSearchesByUserRef {
  ...
  (dc: DataConnect, vars: GetFlightSearchesByUserVariables): QueryRef<GetFlightSearchesByUserData, GetFlightSearchesByUserVariables>;
}
export const getFlightSearchesByUserRef: GetFlightSearchesByUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFlightSearchesByUserRef:
```typescript
const name = getFlightSearchesByUserRef.operationName;
console.log(name);
```

### Variables
The `GetFlightSearchesByUser` query requires an argument of type `GetFlightSearchesByUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFlightSearchesByUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetFlightSearchesByUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFlightSearchesByUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetFlightSearchesByUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFlightSearchesByUser, GetFlightSearchesByUserVariables } from '@dataconnect/generated';

// The `GetFlightSearchesByUser` query requires an argument of type `GetFlightSearchesByUserVariables`:
const getFlightSearchesByUserVars: GetFlightSearchesByUserVariables = {
  userId: ..., 
};

// Call the `getFlightSearchesByUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFlightSearchesByUser(getFlightSearchesByUserVars);
// Variables can be defined inline as well.
const { data } = await getFlightSearchesByUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFlightSearchesByUser(dataConnect, getFlightSearchesByUserVars);

console.log(data.flightSearches);

// Or, you can use the `Promise` API.
getFlightSearchesByUser(getFlightSearchesByUserVars).then((response) => {
  const data = response.data;
  console.log(data.flightSearches);
});
```

### Using `GetFlightSearchesByUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFlightSearchesByUserRef, GetFlightSearchesByUserVariables } from '@dataconnect/generated';

// The `GetFlightSearchesByUser` query requires an argument of type `GetFlightSearchesByUserVariables`:
const getFlightSearchesByUserVars: GetFlightSearchesByUserVariables = {
  userId: ..., 
};

// Call the `getFlightSearchesByUserRef()` function to get a reference to the query.
const ref = getFlightSearchesByUserRef(getFlightSearchesByUserVars);
// Variables can be defined inline as well.
const ref = getFlightSearchesByUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFlightSearchesByUserRef(dataConnect, getFlightSearchesByUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.flightSearches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.flightSearches);
});
```

## ListAirports
You can execute the `ListAirports` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAirports(): QueryPromise<ListAirportsData, undefined>;

interface ListAirportsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAirportsData, undefined>;
}
export const listAirportsRef: ListAirportsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAirports(dc: DataConnect): QueryPromise<ListAirportsData, undefined>;

interface ListAirportsRef {
  ...
  (dc: DataConnect): QueryRef<ListAirportsData, undefined>;
}
export const listAirportsRef: ListAirportsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAirportsRef:
```typescript
const name = listAirportsRef.operationName;
console.log(name);
```

### Variables
The `ListAirports` query has no variables.
### Return Type
Recall that executing the `ListAirports` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAirportsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAirportsData {
  airports: ({
    id: UUIDString;
    name: string;
    iataCode: string;
    city: string;
    country: string;
  } & Airport_Key)[];
}
```
### Using `ListAirports`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAirports } from '@dataconnect/generated';


// Call the `listAirports()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAirports();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAirports(dataConnect);

console.log(data.airports);

// Or, you can use the `Promise` API.
listAirports().then((response) => {
  const data = response.data;
  console.log(data.airports);
});
```

### Using `ListAirports`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAirportsRef } from '@dataconnect/generated';


// Call the `listAirportsRef()` function to get a reference to the query.
const ref = listAirportsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAirportsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.airports);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.airports);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateBooking
You can execute the `CreateBooking` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createBooking(vars: CreateBookingVariables): MutationPromise<CreateBookingData, CreateBookingVariables>;

interface CreateBookingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBookingVariables): MutationRef<CreateBookingData, CreateBookingVariables>;
}
export const createBookingRef: CreateBookingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBooking(dc: DataConnect, vars: CreateBookingVariables): MutationPromise<CreateBookingData, CreateBookingVariables>;

interface CreateBookingRef {
  ...
  (dc: DataConnect, vars: CreateBookingVariables): MutationRef<CreateBookingData, CreateBookingVariables>;
}
export const createBookingRef: CreateBookingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBookingRef:
```typescript
const name = createBookingRef.operationName;
console.log(name);
```

### Variables
The `CreateBooking` mutation requires an argument of type `CreateBookingVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateBookingVariables {
  userId: UUIDString;
  bookingDate: TimestampString;
  bookingReference: string;
  currency?: string | null;
  totalPrice: number;
}
```
### Return Type
Recall that executing the `CreateBooking` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBookingData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBookingData {
  booking_insert: Booking_Key;
}
```
### Using `CreateBooking`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBooking, CreateBookingVariables } from '@dataconnect/generated';

// The `CreateBooking` mutation requires an argument of type `CreateBookingVariables`:
const createBookingVars: CreateBookingVariables = {
  userId: ..., 
  bookingDate: ..., 
  bookingReference: ..., 
  currency: ..., // optional
  totalPrice: ..., 
};

// Call the `createBooking()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBooking(createBookingVars);
// Variables can be defined inline as well.
const { data } = await createBooking({ userId: ..., bookingDate: ..., bookingReference: ..., currency: ..., totalPrice: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBooking(dataConnect, createBookingVars);

console.log(data.booking_insert);

// Or, you can use the `Promise` API.
createBooking(createBookingVars).then((response) => {
  const data = response.data;
  console.log(data.booking_insert);
});
```

### Using `CreateBooking`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBookingRef, CreateBookingVariables } from '@dataconnect/generated';

// The `CreateBooking` mutation requires an argument of type `CreateBookingVariables`:
const createBookingVars: CreateBookingVariables = {
  userId: ..., 
  bookingDate: ..., 
  bookingReference: ..., 
  currency: ..., // optional
  totalPrice: ..., 
};

// Call the `createBookingRef()` function to get a reference to the mutation.
const ref = createBookingRef(createBookingVars);
// Variables can be defined inline as well.
const ref = createBookingRef({ userId: ..., bookingDate: ..., bookingReference: ..., currency: ..., totalPrice: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBookingRef(dataConnect, createBookingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.booking_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.booking_insert);
});
```

## UpdateFlightSearch
You can execute the `UpdateFlightSearch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateFlightSearch(vars: UpdateFlightSearchVariables): MutationPromise<UpdateFlightSearchData, UpdateFlightSearchVariables>;

interface UpdateFlightSearchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFlightSearchVariables): MutationRef<UpdateFlightSearchData, UpdateFlightSearchVariables>;
}
export const updateFlightSearchRef: UpdateFlightSearchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateFlightSearch(dc: DataConnect, vars: UpdateFlightSearchVariables): MutationPromise<UpdateFlightSearchData, UpdateFlightSearchVariables>;

interface UpdateFlightSearchRef {
  ...
  (dc: DataConnect, vars: UpdateFlightSearchVariables): MutationRef<UpdateFlightSearchData, UpdateFlightSearchVariables>;
}
export const updateFlightSearchRef: UpdateFlightSearchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateFlightSearchRef:
```typescript
const name = updateFlightSearchRef.operationName;
console.log(name);
```

### Variables
The `UpdateFlightSearch` mutation requires an argument of type `UpdateFlightSearchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateFlightSearchVariables {
  id: UUIDString;
  passengers?: number | null;
}
```
### Return Type
Recall that executing the `UpdateFlightSearch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateFlightSearchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateFlightSearchData {
  flightSearch_update?: FlightSearch_Key | null;
}
```
### Using `UpdateFlightSearch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateFlightSearch, UpdateFlightSearchVariables } from '@dataconnect/generated';

// The `UpdateFlightSearch` mutation requires an argument of type `UpdateFlightSearchVariables`:
const updateFlightSearchVars: UpdateFlightSearchVariables = {
  id: ..., 
  passengers: ..., // optional
};

// Call the `updateFlightSearch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateFlightSearch(updateFlightSearchVars);
// Variables can be defined inline as well.
const { data } = await updateFlightSearch({ id: ..., passengers: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateFlightSearch(dataConnect, updateFlightSearchVars);

console.log(data.flightSearch_update);

// Or, you can use the `Promise` API.
updateFlightSearch(updateFlightSearchVars).then((response) => {
  const data = response.data;
  console.log(data.flightSearch_update);
});
```

### Using `UpdateFlightSearch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateFlightSearchRef, UpdateFlightSearchVariables } from '@dataconnect/generated';

// The `UpdateFlightSearch` mutation requires an argument of type `UpdateFlightSearchVariables`:
const updateFlightSearchVars: UpdateFlightSearchVariables = {
  id: ..., 
  passengers: ..., // optional
};

// Call the `updateFlightSearchRef()` function to get a reference to the mutation.
const ref = updateFlightSearchRef(updateFlightSearchVars);
// Variables can be defined inline as well.
const ref = updateFlightSearchRef({ id: ..., passengers: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateFlightSearchRef(dataConnect, updateFlightSearchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.flightSearch_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.flightSearch_update);
});
```

