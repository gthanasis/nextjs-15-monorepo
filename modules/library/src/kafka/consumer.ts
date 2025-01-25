import { KafkaJSNonRetriableError } from 'kafkajs'
import { AbstractContructorParams, KafkaAbstract } from './kafka.abstract'
export interface ConsumerConstructorParams extends AbstractContructorParams {
    groupID: string,
    minBytes?: number,
    maxBytes?: number,
    maxWaitTimeInMs?: number,
    sessionTimeout?: number,
}

export type TopicPartition = {
    topic: string,
    partitions?: Array<number>
}

export type TopicArray = Array<TopicPartition>

export abstract class Base extends KafkaAbstract {
    protected consumer: any
    protected groupID: string
    protected MAX_RETRIES = 5

    constructor ({ env, logger, groupID, minBytes = 1, maxBytes = 10485760, maxWaitTimeInMs = 5000, sessionTimeout = 30000 }: ConsumerConstructorParams) {
        super({ env, logger })
        this.groupID = groupID

        this.consumer = this.kafka.consumer({
            groupId: this.groupID,
            minBytes,
            maxBytes,
            maxWaitTimeInMs,
            sessionTimeout
        })

        this.disconnect.bind(this)
    }

    async connect (): Promise<void> {
        await this.consumer.connect()
    }

    async disconnect (): Promise<void> {
        await this.consumer.disconnect()
    }

    async pause (topicPartitions: TopicArray): Promise<void> {
        await this.consumer.pause(topicPartitions)
        .catch((e: KafkaJSNonRetriableError) => {
            this.logger.warn(`Tried to pause consumer for topics: ${topicPartitions.map(tp => tp.topic).join(', ')}`)
        })
    }

    async resume (topicPartitions: TopicArray): Promise<void> {
        const topics = topicPartitions.map((tp: TopicPartition) => tp.topic)
        const pausedTopicPartitions = this.consumer.paused()
        const resumeableTopicPartitions: TopicArray = []

        pausedTopicPartitions.filter((tp: TopicPartition) => {
            if (topics.includes(tp.topic)) {
                resumeableTopicPartitions.push(tp)
            } else {
                this.logger.warn(`Tried to resume unpaused topic: ${tp.topic}`)
            }
        })

        await this.consumer.resume(resumeableTopicPartitions)
    }

    abstract subscribe ({ topic, handler }: any): Promise<any>
    abstract run (): Promise<void>
}
