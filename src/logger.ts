// citation: this code is taken from @snailplane/logger with some changes. I liked the simplicity and 
// light wegith of this compared to winston etc. i can easuly extend this to have remote api if used 
// form frontend.
export enum LogLevels {
    NONE = 1, ERROR, WARN, INFO, DEBUG
}

const LogLevelsMap: {[key:string]: number} = {
    'NONE': LogLevels.NONE,
    'ERROR': LogLevels.ERROR,
    'WARN': LogLevels.WARN,
    'INFO': LogLevels.INFO,
    'DEBUG': LogLevels.DEBUG
};

// If not running in an interactive shell (such is the case for AWS Lambda environment)
// or the LOG_TO_CLOUDWATCH environment is set, then format output for CloudWatch.
const IsCloudWatch = process.env.LOG_TO_CLOUDWATCH ? process.env.LOG_TO_CLOUDWATCH === 'true' : !process.env.SHELL;

// Is Node.js version anything older than v10?
const IsOldNode = process.version.match(/^v[0-9]\./) != null;

const envVal: string = process.env.LOG_LEVEL || 'DEBUG';

/**
 * Custom logger class.
 *
 * Works much like console's logging, but includes levels, date/time,
 * and category (file) on each line.
 *
 * Usage:
 *   import {Logger} from "@sailplane/logger";
 *   const logger = new Logger('name-of-module');
 *   logger.info("Hello World!");
 */
export class Logger {
    /**
     * Global logging level.
     * May be initialized via LOG_LEVEL environment variable, or set by code.
     */
    static globalLogLevel: LogLevels = LogLevelsMap[envVal] || LogLevels.DEBUG;

    /**
     * Include the level in log output?
     * Defaults to true if not streaming to CloudWatch or running Node.js v9 or older.
     * May also be set directly by code.
     * Note: AWS behavior changed with nodejs10.x runtime - it now includes log levels automatically.
     */
    static outputLevels = !IsCloudWatch || IsOldNode;

    /**
     * Include timestamps in log output?
     * Defaults to false if streaming to CloudWatch, true otherwise.
     * (CloudWatch provides timestamps.)
     * May override by setting the LOG_TIMESTAMPS environment variable to 'true' or 'false',
     * or set by code.
     */
    static logTimestamps = process.env.LOG_TIMESTAMPS ? process.env.LOG_TIMESTAMPS === 'true' : !IsCloudWatch ;

    /**
     * Pretty format objects when stringified to JSON?
     * Defaults to false if streaming to CloudWatch, true otherwise.
     * (Best to let CloudWatch provide the formatting.)
     * May override by setting the LOG_FORMAT_OBJECTS environment variable to 'true' or 'false',
     * or set by code.
     */
    static formatObjects = process.env.LOG_FORMAT_OBJECTS ? process.env.LOG_FORMAT_OBJECTS === 'true' : !IsCloudWatch;

    /**
     * Construct.
     * @param category logging category to include in each line.
     *                 Source file name or class name are good choices.
     */
    constructor(private category: string) {
    }

    /**
     * Format a log line. Helper for #debug, #info, #warn, and #error.
     *
     * @param level logging level
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     * @return array to pass to a console function, or null to output nothing.
     */
    private formatLog(level: LogLevels, message: any, optionalParams?: any[]): any[] | null {
        if (level > Logger.globalLogLevel) {
            return null;
        }

        const out: any[] = [];
        if (Logger.logTimestamps) {
            out.push(new Date().toISOString().substr(0,19));
        }

        if (Logger.outputLevels) {
            out.push(LogLevels[level]);
        }

        out.push(this.category + ':');
        out.push(message);
        if (optionalParams && optionalParams.length) {
            optionalParams.forEach(p => out.push(p));
        }

        return out;
    }

  
    /**
     * Log a line at DEBUG level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    debug(message: any, ...optionalParams: any[]): void {
        const content = this.formatLog(LogLevels.DEBUG, message, optionalParams);
        if (content) {
            console.debug(...content);
        }
    }

    /**
     * Log a line at INFO level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    info(message: any, ...optionalParams: any[]): void {
        const content = this.formatLog(LogLevels.INFO, message, optionalParams);
        if (content) {
            console.info(...content);
        }
    }

    /**
     * Log a line at WARN level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    warn(message: any, ...optionalParams: any[]): void {
        const content = this.formatLog(LogLevels.WARN, message, optionalParams);
        if (content) {
            console.warn(...content);
        }
    }

    /**
     * Log a line at ERROR level.
     *
     * @param message text to log
     * @param optionalParams A list of JavaScript objects to output.
     *                       The string representations of each of these objects are
     *                       appended together in the order listed and output.
     */
    error(message: any, ...optionalParams: any[]): void {
        const content = this.formatLog(LogLevels.ERROR, message, optionalParams);
        if (content) {
            console.error(...content);
        }
    }
   
}