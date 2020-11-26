export interface IService {
    name(): string;

    connect(): void;

    getConnect(): IService;

    valid(): boolean;
}
