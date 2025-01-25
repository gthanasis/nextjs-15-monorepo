import { EachBatchPayload } from 'kafkajs'
import _ from 'lodash'
import { ConsumerConstructorParams, TopicArray, TopicPartition, Base as Consumer } from './consumer'

interface SubscribeParams {
    topic: string
    handler: MessageHandler
}

type MessageHandler = (args: EachBatchPayload) => Promise<void>

export class Batch extends Consumer {
    protected topicHandlers: {
        [topic: string]: MessageHandler
    } = {}

    constructor ({ env, logger, groupID, minBytes = 5000, maxBytes = 10485760, maxWaitTimeInMs = 5000, sessionTimeout = 30000 }: ConsumerConstructorParams) {
        super({ env, logger, groupID, minBytes, maxBytes, maxWaitTimeInMs, sessionTimeout })
    }

    async subscribe ({ topic, handler }: SubscribeParams): Promise<any> {
        await this.consumer.subscribe({topic})
        this.topicHandlers[topic] = handler
    }

    // Master handler / factory to call appropriate handler per topic
    async run (runPaused = this.env.vars.NODE_ENV === 'test'): Promise<void> {
        await this.consumer.run({
            eachBatchAutoResolve: true,
            eachBatch: this.handler.bind(this)
        })

        if (runPaused) {
            const topicPartitions: TopicArray = Object.keys(this.topicHandlers).map((topic): TopicPartition => {
                return { topic }
            })
            await this.consumer.pause(topicPartitions)
        }
    }

    private async handler (args: EachBatchPayload): Promise<void> {
        const topic = _.get(args, 'batch.topic')

        try {
            const topicHandler = _.get(this.topicHandlers, topic, () => { return (null) })
            await topicHandler(args)
        } catch {
            const messages = args.batch.messages.map(msg => {
                if (msg === null) return null
                if (msg.value === null) return null
                return Buffer.from(msg.value).toString()
            }).filter(x => x !== null).join(' | ')

            this.logger.error(`Failed to handle batch in ${topic} with messages: ${messages}`)
        }
    }
}
