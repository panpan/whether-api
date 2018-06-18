'use strict';

const express = require('express');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const bodyParser = require('body-parser');
const cors = require('cors');

const schema = require('./schema');

const app = express();

// const port = process.env.PORT || 3000;

// if (!process.env.GOOGLE_API_KEY) {
//   throw new Error('set the environment variable GOOGLE_API_KEY!');
// }
// if (!process.env.DARKSKY_API_KEY) {
//   throw new Error('set the environment variable DARKSKY_API_KEY!');
// }

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
  endpointURL: '/prod/graphql',
  query: `query ($address: String!) {
  location(address: $address) {
    formattedAddress
    coordinates
    forecast {
      icon
      temperature
      summary
      temperatureHigh
      temperatureLow
      moonPhase
    }
  }
}
`,
}));

// app.listen(port, () => {
//   console.log(`graphql server running on http://localhost:${port}/graphql`);
//   console.log(`view graphiql at http://localhost:${port}/graphiql`);
// });

module.exports = app;
