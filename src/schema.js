'use strict';

const { makeExecutableSchema } = require('graphql-tools');
const { createClient } = require('@google/maps');
const DarkSky = require('dark-sky');

const getLocation = (apiKey, address) => {
  const googleMapsClient = createClient({
    key: apiKey,
    Promise,
  });

  return googleMapsClient.geocode({ address }).asPromise();
};

const getForecast = (apiKey, coordinates) => (
  new DarkSky(apiKey)
    .options({
      latitude: coordinates[0],
      longitude: coordinates[1],
      exclude: ['minutely', 'hourly', 'alerts', 'flags'],
    })
    .get()
);

const typeDefs = `
  type Query {
    location(address: String!): Location
  }

  type Location {
    formattedAddress: String
    coordinates: [Float]
    forecast: Forecast
  }

  type Forecast {
    icon: String
    temperature: Float
    summary: String
    temperatureHigh: Float
    temperatureLow: Float
    moonPhase: Float
  }
`;

const resolvers = {
  Query: {
    async location(_, args, context) {
      const location = await getLocation(context.secrets.GOOGLE_API_KEY, args.address);
      const result = location.json.results[0];
      const formattedAddress = result.formatted_address;
      const { lat, lng } = result.geometry.location;
      return {
        formattedAddress,
        coordinates: [lat, lng],
      };
    },
  },
  Location: {
    async forecast(root, _, context) {
      const forecast = await getForecast(context.secrets.DARKSKY_API_KEY, root.coordinates);
      const { icon, temperature } = forecast.currently;
      const {
        summary,
        temperatureHigh,
        temperatureLow,
        moonPhase,
      } = forecast.daily.data[0];
      return {
        icon,
        temperature,
        summary,
        temperatureHigh,
        temperatureLow,
        moonPhase,
      };
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
