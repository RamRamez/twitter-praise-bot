import { close, openSync, readFileSync, writeSync } from 'fs';
import { config } from 'dotenv';
import { ITweetResponse, ITweetWithAuthor } from '../types/tweet';
import { IPraise } from '../types/praise';

config();

const { TWITTER_USERNAME } = process.env;

export const createLog = (str: any, errorTag?: string) => {
	if (typeof str !== 'string' && str.tag) {
		return;
	}
	// writeFileSync(global.logJson, JSON.stringify(str.response));
	errorTag && console.log({ error: str.response.data.errors, errorCode: errorTag });
	const oldData = readFileSync(global.logFile);
	const fd = openSync(global.logFile, 'w+');
	const log = `Date: ${new Date().toLocaleString()}\nLog: ${str} ${
		errorTag ? `\nError code: ${errorTag}` : ''
	}\n\n`;
	const buffer = Buffer.from(log);
	writeSync(fd, buffer, 0, buffer.length, 0); //write new data
	writeSync(fd, oldData, 0, oldData.length, buffer.length); //append old data
	close(fd);
};

export const addAuthorToTweets = (rawResponse: ITweetResponse): ITweetWithAuthor[] => {
	const tweets = rawResponse.data;
	const users = rawResponse.includes.users;
	return tweets.map(tweet => {
		const user = users.find(user => user.id === tweet.author_id);
		return { ...tweet, author: user };
	});
};

export const extractPraiseParams = (tweet: ITweetWithAuthor): IPraise => {
	const mentions = tweet.entities?.mentions.map(mention => mention.username);
	const receivers = mentions?.filter(mention => mention !== TWITTER_USERNAME);
	const giver = tweet.author.username;
	const lastMention = tweet.entities?.mentions.sort((a, b) => b.end - a.end)[0];
	const reason = tweet.text.substring(lastMention.end).trim();
	return { reason, receivers, giver };
};
