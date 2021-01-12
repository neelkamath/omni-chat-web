import {CONNECTION_ERROR, UNAUTHORIZED_ERROR} from '../errors';

export interface GraphQlRequest {
    readonly query: string;
    readonly variables?: object;
}

export interface GraphQlResponse {
    readonly data?: GraphQlData;
    readonly errors?: GraphQlError[];
}

export interface GraphQlData {
    readonly [key: string]: any;
}

export interface GraphQlError {
    readonly message: string;

    readonly [key: string]: any;
}

/**
 * Executes a GraphQL query or mutation.
 * @param request
 * @param accessToken
 * @throws UNAUTHORIZED_ERROR
 * @throws CONNECTION_ERROR
 */
export async function queryOrMutate(request: GraphQlRequest, accessToken?: string): Promise<GraphQlResponse> {
    const headers: Record<string, string> = {'Content-Type': 'application/json'};
    if (accessToken !== undefined) headers.Authorization = `Bearer ${accessToken}`;
    const response = await fetch(`${process.env.HTTP}${process.env.API_URL}/query-or-mutation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
    });
    if (response.status === 401) throw UNAUTHORIZED_ERROR;
    if (response.status !== 200) throw CONNECTION_ERROR;
    return await response.json();
}
