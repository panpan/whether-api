const express = require('express');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const bodyParser = require('body-parser');

const schema = require('./schema');

const port = process.env.PORT || 3000;
const app = express();

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('set the environment variable GOOGLE_API_KEY!');
}
if (!process.env.DARKSKY_API_KEY) {
  throw new Error('set the environment variable DARKSKY_API_KEY!');
}

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
  endpointURL: '/graphql',
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

app.listen(port, () => {
  console.log(`graphql server running on http://localhost:${port}/graphql`);
  console.log(`view graphiql at http://localhost:${port}/graphiql`);
});
