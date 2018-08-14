'use strict';

const express = require('express');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const bodyParser = require('body-parser');
const cors = require('cors');

const schema = require('./schema');

require('dotenv').config();

if (process.env.NODE_ENV === 'development') {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('set the environment variable GOOGLE_API_KEY!');
  }
  if (!process.env.DARKSKY_API_KEY) {
    throw new Error('set the environment variable DARKSKY_API_KEY!');
  }
}

const app = express();

app.use(cors());

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: {
    secrets: {
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      DARKSKY_API_KEY: process.env.DARKSKY_API_KEY,
    },
  },
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: 'graphql',
  query: `query ($address: String!) {
  location(address: $address) {
    formattedAddress
    coordinates
    forecast {
      cloudCover
      humidity
      icon
      precipProbability
      summary
      temperature
      uvIndex
      nextHour
      next48Hours
      moonPhase
      sunriseTime
      sunsetTime
      temperatureHigh
      temperatureHighTime
      temperatureLow
      uvIndexTime
    }
  }
}
`,
}));

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`graphql server running on http://localhost:${port}/graphql`);
    console.log(`view graphiql at http://localhost:${port}/graphiql`);
  });
} else {
  module.exports = app;
}
