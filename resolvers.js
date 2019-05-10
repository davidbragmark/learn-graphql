const { GraphQLScalarType } = require('graphql');
var tags = [
	{ photoID: '1', userID: 'gPlake' },
	{ photoID: '2', userID: 'sSchmidt' },
	{ photoID: '2', userID: 'mHattrup' },
	{ photoID: '2', userID: 'gPlake' },
];

var users = [
	{ githubLogin: 'mHattrup', name: 'Mike Hattrup' },
	{ githubLogin: 'gPlake', name: 'Glen Plake' },
	{ githubLogin: 'sSchmidt', name: 'Scott Schmidt' },
];

var _id = 0;
var photos = [
	{
		id: '1',
		name: 'Dropping the Hart Chute',
		description: 'The heart chute is one of my favorite chutes',
		category: 'ACTION',
		githubUser: 'gPlake',
		created: '3-28-1977',
	},
	{
		id: '2',
		name: 'Enjoying the sunshine',
		category: 'SELFIE',
		githubUser: 'sSchmidt',
		created: '1-2-1985',
	},
	{
		id: '3',
		name: 'Gunbarrel 25',
		description: '25 laps on gunbarrel today',
		category: 'LANDSCAPE',
		githubUser: 'sSchmidt',
		created: '2018-04-15T19:01:49.308Z',
	},
];

module.exports = {
	Query: {
		totalPhotos: () => photos.length,
		allPhotos: () => photos,
	},
	Mutation: {
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
