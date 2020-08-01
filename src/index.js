const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;

//fake data

let notes = [
  { id: "1", content: "This is a note", author: "Adam Scott" },
  { id: "2", content: "This is another note", author: "Harlow Everly" },
  { id: "3", content: "Oh hey look, another note!", author: "Riley Harrison" },
];

// Construct a schema, using GraphQL's schema language
const typeDefs = gql`
  type Query {
    hello: String
    notes: [Note!]!
    note(id: ID!): Note!
  }

  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Mutation {
    newNote(content: String!): Note!
  }
`;
// Provide resolver functions for our schema fields
const resolvers = {
  Query: {
    hello: () => "Hello world!",
    notes: () => notes,
    note: (parent, args, context, info) => {
      return notes.find((note) => note.id == args.id);
    },
  },

  Mutation: {
    newNote: (parent, args, context, info) => {
      let noteValue = {
        id: String(notes.length + 1),
        content: args.content,
        author: "Adam Scott",
      };
      notes.push(noteValue);
      return noteValue;
    },
  },
};

const app = express();

// Apollo Server setup
const server = new ApolloServer({ typeDefs, resolvers });

// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: "/api" });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
