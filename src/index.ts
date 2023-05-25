import path from 'path';
import { existsSync, writeFileSync } from 'fs';
import { config } from 'dotenv';
import { createLog } from './lib/helpers';
import App from './app';

global.logFile = path.join(__dirname, '/../log.txt');
global.logJson = path.join(__dirname, '/../log.json');

config();

main().catch(console.log);

async function main() {
	try {
		const logExists = existsSync(global.logFile);
		if (!logExists) {
			writeFileSync(global.logFile, '');
		}
		App();
	} catch (error) {
		createLog(error, 'main');
	}
}
