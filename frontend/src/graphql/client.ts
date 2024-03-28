import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

const HTTP_URL = '${process.env.REACT_APP_TOWNS_SERVICE_URL}graphql';

// const httpLink = ApolloLink.from([
//   new ApolloLink((operation, forward) => {
//     const token = window.sessionStorage.getItem('accessToken');
//     if (token) {
//       /** Passing the properties to be used in the request for authentication */
//       operation.setContext({ headers: { authorization: `${token}` } });
//     }
//     return forward(operation);
//   }),
//   new HttpLink({ uri: httpUrl }),
// ]);

/** Creating instance for apollo client */
const client = new ApolloClient({
  /** Cache is main feature of apollo cient
   *  InMemoryCache - allows the cached objects to be kept in memory. We can also use other storage options
   *                  here for big applications.
   *                  But for this application inMemoryCache is sufficient.
   * By default ApolloClient fetches the requests from cache , we can customize this behaviour
   * by using a fetchPolice as 'no-cache'. We don't want to fetch responses from cache for certain
   * queries such as Mutation. We want apollo client to fetch the req-response from server.
   */
  cache: new InMemoryCache(),
  uri: HTTP_URL,
  defaultOptions: { query: { fetchPolicy: 'no-cache' } },
});

export default client;
