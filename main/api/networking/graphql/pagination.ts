import {Cursor} from './models';

export interface ForwardPagination {
    readonly first?: number;
    readonly after?: Cursor;
}

export interface BackwardPagination {
    readonly last?: number;
    readonly before?: Cursor;
}
