import {SGEvent} from './SGEvent';

export default interface SGRequest {
    cmd: SGEvent;
    data: any;
}
