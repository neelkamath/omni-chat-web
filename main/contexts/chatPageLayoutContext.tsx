import React, {createContext, ReactElement, useState} from 'react';
import {Empty} from 'antd';

export interface ChatPageLayoutContextData {
    readonly content: ReactElement;
    readonly setContent: (content: ReactElement) => void;
}

/**
 * Context for the chat page layout (e.g., whether a chat or search bar is displayed in the content section). It's
 * `undefined` when it's used outside of it's {@link ChatPageLayoutContext.Provider}.
 */
export const ChatPageLayoutContext = createContext<ChatPageLayoutContextData | undefined>(undefined);

/** Hook for {@link ChatPageLayoutContext}. {@link ChatPageLayoutContextData.content} is {@link Empty} by default. */
export function useChatPageLayoutContext(): ChatPageLayoutContextData {
    const [content, setContent] = useState(<Empty/>);
    return {content, setContent};
}
