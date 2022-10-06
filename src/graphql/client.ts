import { ApolloClient, InMemoryCache } from '@apollo/client';
import { config } from '@utils/env';

export const apolloClient = new ApolloClient({
  uri: config.voyageGraphQLUrl,
  cache: new InMemoryCache(),
});
