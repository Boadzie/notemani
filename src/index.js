const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cors = require("cors");
// import the modules at the top of the file
const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");

//Local module imports
const db = require("./db");
const models = require("./models");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;

// DB Host
const DB_HOST = process.env.DB_HOST;

// the connection
db.connect(DB_HOST);

// generate a JWT that stores a user id
const generateJWT = async (user) => {
  return await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
};
// validate the JWT
const validateJWT = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET);
};

// get the user info from a JWT
const getUser = (token) => {
  if (token) {
    try {
      // return the user information from the token
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // if there's a problem with the token, throw an error
      throw new Error("Session invalid");
    }
  }
};

// Provide resolver functions for our schema fields
const app = express();

// helmet
app.use(helmet());
app.use(cors());

// Apollo Server setup
const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization;
    // try to retrieve a user with the token
    const user = getUser(token);
    // add the db models and the user to the context
    return { models, user };
  },
});

// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: "/api" });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
