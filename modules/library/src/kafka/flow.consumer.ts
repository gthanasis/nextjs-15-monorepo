import { EachMessagePayload } from 'kafkajs'
import _ from 'lodash'
import { Base as Consumer } from './consumer'

interface SubscribeParams {
    topic: string
    handler: MessageHandler
}

type MessageHandler = (args: EachMessagePayload) => Promise<void>

export class Flow extends Consumer {
    protected topicHandlers: {
        [topic: string]: MessageHandler
    } = {}

    async subscribe ({ topic, handler }: SubscribeParams): Promise<any> {
        await this.consumer.subscribe({topic})
        this.topicHandlers[topic] = handler
    }

    // Master handler / factory to call appropriate handler per topic
    async run (): Promise<void> {
        await this.consumer.run({
            eachMessage: this.handler.bind(this)
        })
    }

    private async handler (args: EachMessagePayload): Promise<void> {
        const topic = _.get(args, 'topic')
        const topicHandler = _.get(this.topicHandlers, topic, () => { return (null) })
        await topicHandler(args)
    }
}
