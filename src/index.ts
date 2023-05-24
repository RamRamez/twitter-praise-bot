import path from 'path';
import { config } from 'dotenv';
import { handleLog } from './lib/helpers';
import {existsSync, writeFileSync} from "fs";

global.logFile = path.join(__dirname, '/../log.txt');

config();

const { BEARER_TOKEN } = process.env;

main().catch(console.log);

async function main() {
	try {
		const logExists = existsSync(global.logFile);
		if (!logExists) {
			writeFileSync(global.logFile, '');
		}
		console.log(BEARER_TOKEN);
	} catch (error) {
		handleLog(error, 'main');
	}
}
