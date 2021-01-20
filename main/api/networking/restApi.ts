import {
    ConnectionError,
    InternalServerError,
    InvalidPicError,
    NonexistentUserIdError,
    UnauthorizedError,
} from './errors';

/**
 * @return `Blob` is the user has a profile pic, and `null` if they don't.
 * @throws {NonexistentUserIdError}
 * @throws {ConnectionError}
 * @throws InternalServerError
 */
export async function getProfilePic(userId: number): Promise<Blob | null> {
    const params = new URLSearchParams({'user-id': userId.toString()});
    const response = await fetch(`${process.env.HTTP}${process.env.API_URL}/profile-pic?${params.toString()}`);
    if (response.status >= 500 && response.status < 600) throw new InternalServerError();
    switch (response.status) {
        case 200:
            return await response.blob();
        case 204:
            return null;
        case 400:
            throw new NonexistentUserIdError();
        default:
            throw new ConnectionError();
    }
}

/**
 * Update the user's profile pic.
 * @throws {InvalidPicError}
 * @throws {UnauthorizedError}
 * @throws {ConnectionError}
 * @throws {InternalServerError}
 */
export async function patchProfilePic(accessToken: string, pic: File): Promise<void> {
    const formData = new FormData();
    formData.append('pic', pic);
    const response = await fetch(`${process.env.HTTP}${process.env.API_URL}/profile-pic`, {
        method: 'PATCH',
        headers: {'Authorization': `Bearer ${accessToken}`},
        body: formData,
    });
    if (response.status >= 500 && response.status < 600) throw new InternalServerError();
    switch (response.status) {
        case 204:
            return;
        case 400:
            throw new InvalidPicError();
        case 401:
            throw new UnauthorizedError();
        default:
            throw new ConnectionError();
    }
}
