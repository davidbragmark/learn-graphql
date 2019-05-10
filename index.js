const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express')
	.default;

const { readFileSync } = require('fs');
const resolvers = require('./resolvers');
const typeDefs = readFileSync('./typedef.graphql', 'UTF-8');

const app = new express();

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

server.applyMiddleware({ app });

app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

app.listen({ port: 4000 }, () =>
	console.log(
		`GraphQL Server running  http://localhost:4000${server.graphqlPath}`,
	),
);
