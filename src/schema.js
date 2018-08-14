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
      exclude: ['alerts', 'flags'],
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
    cloudCover: Float
    humidity: Float
    icon: String
    precipProbability: Float
    summary: String
    temperature: Float
    uvIndex: Int
    nextHour: String
    next48Hours: String
    moonPhase: Float
    sunriseTime: Int
    sunsetTime: Int
    temperatureHigh: Float
    temperatureHighTime: Int
    temperatureLow: Float
    uvIndexTime: Int
  }
`;

const resolvers = {
  Query: {
    async location(_, args, context) {
      const location = await getLocation(context.secrets.GOOGLE_API_KEY, args.address);
      if (location.json.status !== 'OK') {
        throw new Error(`geocoding error: ${location.json.status}`);
      }
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
      const {
        cloudCover,
        humidity,
        icon,
        precipProbability,
        summary,
        temperature,
        uvIndex,
      } = forecast.currently;
      const nextHour = forecast.minutely.summary;
      const next48Hours = forecast.hourly.summary;
      const {
        moonPhase,
        sunriseTime,
        sunsetTime,
        temperatureHigh,
        temperatureHighTime,
        temperatureLow,
        uvIndexTime,
      } = forecast.daily.data[0];
      return {
        cloudCover,
        humidity,
        icon,
        precipProbability,
        summary,
        temperature,
        uvIndex,
        nextHour,
        next48Hours,
        moonPhase,
        sunriseTime,
        sunsetTime,
        temperatureHigh,
        temperatureHighTime,
        temperatureLow,
        uvIndexTime,
      };
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
