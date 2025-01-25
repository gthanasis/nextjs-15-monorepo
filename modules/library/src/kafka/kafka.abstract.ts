import { Admin, Kafka, KafkaConfig, LogEntry, logLevel } from 'kafkajs'
import { BunyanLogger } from 'logger'

export interface AbstractContructorParams {
    env: any
    logger: BunyanLogger
}

export class KafkaAbstract {
    protected env: any
    protected logger: BunyanLogger
    private id: string

    protected kafka: Kafka
    protected topics: any[]
    private brokerList: any
    private connectionString: any

    constructor ({ env, logger }: AbstractContructorParams) {
        this.id = 'microservices'
        this.env = env
        this.logger = logger
        this.topics = []
        this.brokerList =
            this.env.vars.KAFKA_BROKERLIST.includes(',')
                ? this.env.vars.KAFKA_BROKERLIST.split(',')
                : [this.env.vars.KAFKA_BROKERLIST]
        this.connectionString = this.env.vars.KAFKA_CONNECTION_STRING

        const configObject: KafkaConfig = {
            clientId: this.id,
            brokers: this.brokerList,
            logLevel: this.env.vars.LOG_LEVEL.toLowerCase() === 'trace' ? logLevel.INFO : logLevel.ERROR,
            logCreator: (loglevel: logLevel) => {
                return ({ namespace, level, label, log }: LogEntry) => {
                    const { message, ...extra } = log
                    const details = { namespace, ...extra }
                    if (level === logLevel.WARN) this.logger.warn(details, message)
                    if (level === logLevel.INFO) this.logger.info(details, message)
                    if (level === logLevel.DEBUG) this.logger.trace(details, message)
                    if (level === logLevel.ERROR) {
                        const err = new Error(log.message)
                        err.stack = log.stack
                        this.logger.error({err, details}, log.message)
                    }
                }
            }
        }

        // if the EVENT_HUBS_CONNECTION_STRING exists, then we connect to Event Hubs over SSL.
        // otherwise we fallback to the local kafka deployment with default options.
        if (this.connectionString) {
            configObject.ssl = true
            configObject.sasl = {
                mechanism: 'plain',
                username: '$ConnectionString',
                password: this.connectionString
            }
        }

        this.kafka = new Kafka(configObject)
    }

    getAdmin (): Admin {
        return this.kafka.admin()
    }
}
