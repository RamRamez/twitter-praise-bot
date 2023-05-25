import crypto from 'crypto';
import axios from 'axios';
import { config } from 'dotenv';
import { createLog } from './helpers';
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-commonjs
const OAuth = require('oauth-1.0a');

config();

const {
	TWITTER_ID,
	BEARER_TOKEN,
	CONSUMER_KEY,
	CONSUMER_SECRET,
	ACCESS_TOKEN,
	TOKEN_SECRET,
} = process.env;

interface IPostTweetResponse {
	edit_history_tweet_ids: string[];
	id: string;
	text: string;
}

export const postTweet = async (props: { text: string }): Promise<IPostTweetResponse> => {
	const { text } = props;
	const url = `https://api.twitter.com/2/tweets`;
	const oauth = OAuth({
		consumer: {
			key: CONSUMER_KEY,
			secret: CONSUMER_SECRET,
		},
		signature_method: 'HMAC-SHA1',
		hash_function: (baseString, key) =>
			crypto.createHmac('sha1', key).update(baseString).digest('base64'),
	});

	const authHeader = oauth.toHeader(
		oauth.authorize(
			{
				url,
				method: 'POST',
			},
			{
				key: ACCESS_TOKEN,
				secret: TOKEN_SECRET,
			},
		),
	);

	try {
		const { data } = await axios.post(
			url,
			{ text },
			{
				headers: {
					Authorization: authHeader.Authorization,
					'Content-Type': 'application/json',
				},
			},
		);
		return data;
	} catch (error) {
		createLog(error, 'getRequest');
	}
};

export const getBotMentions = async () => {
	try {
		const url = `https://api.twitter.com/2/users/${TWITTER_ID}/mentions`;
		const { data } = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${BEARER_TOKEN}`,
			},
		});
		return data;
	} catch (error) {
		createLog(error, 'getBotMentions');
	}
};
