import { Cursor } from '@neelkamath/omni-chat';

export interface ForwardPagination {
  readonly first?: number;
  readonly after?: Cursor;
}
