export interface AccountInput {
    readonly username: string;
    readonly password: string;
    readonly emailAddress: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly bio?: string;
}

export interface Login {
    readonly username: string;
    readonly password: string;
}

export interface TokenSet {
    readonly accessToken: string;
    readonly refreshToken: string;
}
