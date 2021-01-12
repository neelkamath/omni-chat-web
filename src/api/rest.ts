import {CONNECTION_ERROR, INVALID_PIC_ERROR, NONEXISTENT_USER_ID_ERROR, UNAUTHORIZED_ERROR} from './errors';

/**
 * @param userId
 * @return `Blob` is the user has a profile pic, and `null` if they don't.
 * @throws NONEXISTENT_USER_ID_ERROR
 * @throws CONNECTION_ERROR
 */
export async function getProfilePic(userId: number): Promise<Blob | null> {
    const params = new URLSearchParams({'user-id': userId.toString()});
    const response = await fetch(`${process.env.HTTP}${process.env.API_URL}/profile-pic?${params.toString()}`);
    switch (response.status) {
        case 200:
            return await response.blob();
        case 204:
            return null;
        case 400:
            throw NONEXISTENT_USER_ID_ERROR;
        default:
            throw CONNECTION_ERROR;
    }
}

/**
 * Update the user's profile pic.
 * @param accessToken
 * @param pic
 * @throws INVALID_PIC_ERROR
 * @throws UNAUTHORIZED_ERROR
 * @throws CONNECTION_ERROR
 */
export async function patchProfilePic(accessToken: string, pic: File): Promise<void> {
    const formData = new FormData();
    formData.append('pic', pic);
    const response = await fetch(`${process.env.HTTP}${process.env.API_URL}/profile-pic`, {
        method: 'PATCH',
        headers: {'Authorization': `Bearer ${accessToken}`},
        body: formData,
    });
    switch (response.status) {
        case 204:
            return;
        case 400:
            throw INVALID_PIC_ERROR;
        case 401:
            throw UNAUTHORIZED_ERROR;
        default:
            throw CONNECTION_ERROR;
    }
}
