import {
	addAuthorToTweets,
	createLog,
	extractPraiseParams,
	preparePraiseTweet,
} from './lib/helpers';
import { getBotMentions, postPraiseTweet } from './lib/twitterAPI';

export default async function App() {
	try {
		const mentionsResponse = await getBotMentions();
		const tweetsWithAuthors = addAuthorToTweets(mentionsResponse);
		const tweetsPromises = [];
		tweetsWithAuthors.forEach(tweet => {
			const praiseParams = extractPraiseParams(tweet);
			const praiseTweet = preparePraiseTweet(praiseParams);
			const tweetPromise = postPraiseTweet({
				text: praiseTweet,
				inReplyToID: tweet.id,
			});
			tweetsPromises.push(tweetPromise);
		});
		const results = await Promise.all(tweetsPromises);

		// writeFileSync(global.logJson, JSON.stringify(mentionsResponse));
		console.log('results', results);
	} catch (error) {
		createLog(error, 'App');
	}
}
