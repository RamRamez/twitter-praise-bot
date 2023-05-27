import { addAuthorToTweets, createLog, extractPraiseParams } from './lib/helpers';
import { getBotMentions } from './lib/twitterAPI';

export default async function App() {
	try {
		const mentionsResponse = await getBotMentions();
		const tweetsWithAuthors = addAuthorToTweets(mentionsResponse);
		const params = extractPraiseParams(tweetsWithAuthors[0]);
		// const res = await postTweet({
		// 	text: 'reply tweet 2',
		// 	inReplyToID: '1661704305059962880',
		// });
		// writeFileSync(global.logJson, JSON.stringify(params));
		console.log('params', params);
	} catch (error) {
		createLog(error, 'App');
	}
}
