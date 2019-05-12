const { GraphQLScalarType } = require('graphql');
const fetch = require('node-fetch');
const { ObjectID } = require('mongodb');
const { authorizeWithGithub } = require('./lib');

module.exports = {
	Query: {
		me: (parent, args, { currentUser }) => currentUser,

		totalPhotos: (parent, args, { db }) =>
			db.collection('photos').estimatedDocumentCount(),

		allPhotos: (parent, args, { db }) =>
			db
				.collection('photos')
				.find()
				.toArray(),

		totalUsers: (parent, args, { db }) =>
			db.collection('users').estimatedDocumentCount(),

		allUsers: (parent, args, { db }) =>
			db
				.collection('users')
				.find()
				.toArray(),
	},
	Mutation: {
		async githubAuth(parent, { code }, { db }) {
			let {
				message,
				access_token,
				avatar_url,
				login,
				name,
			} = await authorizeWithGithub({
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code,
			});
			if (message) {
				throw new Error(message);
			}
			let latestUserInfo = {
				name,
				githubLogin: login,
				githubToken: access_token,
				avatar: avatar_url,
			};
			const {
				ops: [user],
			} = await db
				.collection('users')
				.replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

			return { user, token: access_token };
		},

		postPhoto(parent, args) {
			var newPhoto = {
				id: _id++,
				...args.input,
				created: new Date(),
			};

			photos.push(newPhoto);
			return newPhoto;
		},
	},
	Photo: {
		url: parent => `http://yourwebsite.com/img/${parent.id}.jpg`,
		postedBy: parent => {
			return users.find(u => u.githubLogin === parent.githubUser);
		},
		taggedUsers: parent =>
			tags
				// returns an array of tags that only contain the current Photo.
				.filter(tag => tag.photoID === parent.id)
				// converts the arrays of tags into an array of userIDs
				.map(tag => tag.userID)
				// converts array of userIDs into an array of user objects.
				.map(userID => users.find(u => u.githubLogin === userID)),
	},
	User: {
		postedPhotos: parent => {
			return photos.filter(p => p.githubUser === parent.githubLogin);
		},
		inPhotos: parent =>
			tags
				// returns an array of tags that only contain the current User.
				.filter(tag => tag.userID === parent.id)
				// converts the arrays of tags into an array of photoIDs
				.map(tag => tag.photoID)
				// converts array of photoIDs into an array of photo objects.
				.map(photoID => photos.find(p => p.id === photoID)),
	},
	DateTime: new GraphQLScalarType({
		name: 'DateTime',
		description: 'A valid date time value.',
		parseValue: value => new Date(value),
		serialize: value => new Date(value).toISOString(),
		parseLiteral: ast => ast.value,
	}),
};
