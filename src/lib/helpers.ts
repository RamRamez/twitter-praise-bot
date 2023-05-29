import { close, openSync, readFileSync, writeSync } from 'fs';
import { config } from 'dotenv';
import { ITweetResponse, ITweetWithAuthor } from '../types/tweet';
import { IPraise } from '../types/praise';
import { getBotMentions, postPraiseTweet } from './twitterAPI';
import Mentions from '../models/tweetModel';
import ErrorTag from './ErrorTag';

config();

const { TWITTER_USERNAME } = process.env;

export const createLog = (str: any, tag?: string) => {
	if (typeof str !== 'string' && str.hasTag) {
		return;
	}
	tag && console.log({ fullMessage: str, response: str.response, tag });
	const oldData = readFileSync(global.logFile);
	const fd = openSync(global.logFile, 'w+');
	const log = `Date: ${new Date().toLocaleString()}\nLog: ${str} ${
		str.response?.statusText ? `\nResponse: ${str.response.statusText}` : ''
	} ${tag ? `\nTag: ${tag}` : ''}\n\n`;
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

export const preparePraiseTweet = (params: IPraise): string => {
	const { receivers, giver, reason } = params;
	const receiversString = receivers.join(' and @');
	return `@${giver} has praised @${receiversString} ${reason}`;
};

export const getAndSaveMentions = async (): Promise<ITweetWithAuthor[] | undefined> => {
	try {
		const mentions = await Mentions.find().sort({ id: -1 });
		const lastMentionId = mentions[0]?.id;
		const mentionsResponse = await getBotMentions(lastMentionId);
		const mentionsIds = mentionsResponse.data?.map(mention => mention.id);
		if (mentionsResponse.meta.result_count === 0) {
			createLog('Mentions are up to date', 'no new mentions');
			return undefined;
		}
		createLog(`Fetched mentions: ${mentionsIds.join()}`, 'new mentions fetched');
		const tweetsWithAuthors = addAuthorToTweets(mentionsResponse);
		await Mentions.insertMany(tweetsWithAuthors, { ordered: false });
		createLog(`Added mentions: ${mentionsIds.join()}`, 'new mentions added to DB');
		return tweetsWithAuthors;
	} catch (error) {
		createLog(error, 'getAndSaveMentions');
		throw new ErrorTag(error);
	}
};

export const sendBatchTweets = async (tweets: ITweetWithAuthor[]) => {
	try {
		const tweetsPromises = [];
		tweets.forEach(tweet => {
			const praiseParams = extractPraiseParams(tweet);
			const praiseTweet = preparePraiseTweet(praiseParams);
			const tweetPromise = postPraiseTweet({
				text: praiseTweet,
				inReplyToID: tweet.id,
			});
			tweetsPromises.push(tweetPromise);
		});
		const results = await Promise.all(tweetsPromises);
		const tweetIDs = results.map(result => result.id);
		createLog(`Sent tweet IDs: ${tweetIDs.join()}`, 'Batch Tweets sent');
	} catch (error) {
		createLog(error, 'sendBatchTweets');
		throw new ErrorTag(error);
	}
};

export const mainJob = async () => {
	try {
		const newMentions = await getAndSaveMentions();
		if (newMentions) {
			await sendBatchTweets(newMentions);
		}
		console.log('Job done');
	} catch (error) {
		createLog(error, 'mainJob');
		throw new ErrorTag(error);
	}
};
