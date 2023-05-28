import { createLog, mainJob } from './lib/helpers';
import ErrorTag from './lib/ErrorTag';

export default async function App() {
	try {
		setInterval(() => mainJob(), 1000 * 60 * 10);
		// await mainJob();
	} catch (error) {
		createLog(error, 'App');
		throw new ErrorTag(error);
	}
}
