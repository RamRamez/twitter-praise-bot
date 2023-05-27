import crypto from 'crypto';
import axios from 'axios';
import { config } from 'dotenv';
import { createLog } from './helpers';
import { IBasicTweet, ITweetResponse } from '../types/tweet';
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

interface IPostTweet {
	text: string;
	inReplyToID: string;
}

export const postPraiseTweet = async (props: IPostTweet): Promise<IBasicTweet> => {
	const { text, inReplyToID } = props;
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
			{
				text,
				reply: {
					in_reply_to_tweet_id: inReplyToID,
				},
			},
			{
				headers: {
					Authorization: authHeader.Authorization,
					'Content-Type': 'application/json',
				},
			},
		);
		return data;
	} catch (error) {
		createLog(error, 'postPraiseTweet');
	}
};

export const getBotMentions = async (): Promise<ITweetResponse> => {
	try {
		const url = `https://api.twitter.com/2/users/${TWITTER_ID}/mentions?`;
		const params = new URLSearchParams({
			max_results: '100',
			'user.fields': 'username',
			'tweet.fields': 'author_id',
			expansions: 'entities.mentions.username,author_id',
		});
		const urlWithParams = `${url}${params}`;
		const { data } = await axios.get(urlWithParams, {
			headers: {
				Authorization: `Bearer ${BEARER_TOKEN}`,
			},
		});
		return data;
	} catch (error) {
		createLog(error, 'getBotMentions');
	}
};
