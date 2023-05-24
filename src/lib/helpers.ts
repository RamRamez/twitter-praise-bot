import {close, openSync, readFileSync, writeSync} from "fs";
import ErrorTag from "./ErrorTag";

export const handleLog = (str: ErrorTag | string, errorTag?: string) => {
    if (typeof str !== 'string' && str.tag) {
        return;
    }
    errorTag && console.log({ error: str, errorCode: errorTag });
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