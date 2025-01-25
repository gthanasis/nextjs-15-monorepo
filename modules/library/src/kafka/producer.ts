import { KafkaAbstract } from './kafka.abstract'

interface AddParameters {
    topic: string
    messages: object[]
}

export class Producer extends KafkaAbstract {
    private producer: any

    async initialize (): Promise<any> {
        this.producer = this.kafka.producer()
        return await this.producer.connect()
    }

    async disconnect (): Promise<any> {
        return await this.producer.disconnect()
    }

    async add ({ topic, messages }: AddParameters): Promise<any> {
        return await this.producer.send({ topic, messages: messages })
    }
}
