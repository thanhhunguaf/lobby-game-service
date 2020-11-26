export interface IQueueMessage<T> {
    action: string;
    params: T;
}