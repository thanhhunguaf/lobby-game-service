import moment from "moment";
import _ from "lodash";

export default class Utils {
    public static hasText(v: string): boolean {
        return (typeof (v) === 'string') && !!v;
    }

    public static toInteger(v: string): number {
        return parseInt(v);
    }

    public static toFloat(v: string): number {
        return parseFloat(v);
    }

    public static getToDay() {
        return moment().utc().format('YYYY-MM-DD HH:mm:ss');
    }

    public static getStartOfDay() {
        return moment().utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    }

    public static getEndOfDay() {
        return moment().utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    }

    public static getStartOfWeek() {
        return moment().utc().startOf('week').format('YYYY-MM-DD HH:mm:ss');
    }

    public static getEndOfWeek() {
        return moment().utc().endOf('week').format('YYYY-MM-DD HH:mm:ss');
    }

    public static getEndOfMonth() {
        return moment().endOf('month').utc().format('YYYY-MM-DD HH:mm:ss');
    }

    public static isToday(day: string): boolean {
        if (_.isEmpty(day) || !_.isString(day)) {
            return false;
        }
        return moment(day).isSame(this.getToDay(), 'day');
    }

    public static isNotExpired(start: string, end: string, day = this.getToDay()) {
        if (_.isEmpty(day) || !_.isString(day) ||
            _.isEmpty(start) || !_.isString(start) ||
            _.isEmpty(end) || !_.isString(end)) {
            return false;
        }
        return moment(day).isBetween(start, end || undefined);
    }

    public static limitNumberWithinRange(num: number, min: number, max: number) {
        const MIN = min || 0;
        const MAX = max || 100;
        return Math.min(Math.max(num, MIN), MAX)
    }
}