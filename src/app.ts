import { createLog } from './lib/helpers';
import { getBotMentions, postTweet } from './lib/twitterAPI';

export default async function App() {
	try {
		const res = await postTweet({ text: 'Hello World! node 5' });
		const res2 = await getBotMentions();
		console.log(res, res2);
	} catch (error) {
		createLog(error, 'App');
	}
}
