import BunyanLogger, { createLogger, LogLevel, stdSerializers } from 'bunyan'
import debugStream from 'bunyan-debug-stream'
import moment from 'moment'
const serializers = stdSerializers
const Reset = '\x1b[0m'
const FgMagenta = '\x1b[35m'

type LoggerProps = {
    name: string
    level?: LogLevel
}

export class Logger {
    private name: any
    private level: LogLevel
    private logger: BunyanLogger
    constructor ({ name, level }: LoggerProps) {
        this.name = name
        this.level = level || 'info'
        const debug = debugStream({
            basepath: __dirname,
            forceColor: true,
            colors: ({
                'info': 'cyan',
                'error': 'red',
                'warn': 'yellow',
                'debug': 'green'
            } as any),
            showDate: (time: any) => `${FgMagenta}${moment(time).format('DD/MM/YY HH:mm:ss')}${Reset}`,
            showPid: false
        })
        this.logger = createLogger({
            name: `${this.name}`,
            streams: [{ type: 'raw', level: this.level, stream: debug }],
            level: this.level,
            serializers
        })
    }

    detach (): BunyanLogger {
        return this.logger
    }
}
export { BunyanLogger, LogLevel }
