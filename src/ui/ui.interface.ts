export interface Position {
    x: number;
    y: number;
}

export interface ElementPosition extends Position {
    elem: HTMLElement;
    diff?: {
        x: number;
        y: number;
    };
}

export interface Behavior {
    predicate: (...args: any[]) => boolean;
    doBehavior: () => any;
}

export type FormulizeData =  string | number | HTMLElement | JQuery | any;

export type FormulizeEvent = 'input';
