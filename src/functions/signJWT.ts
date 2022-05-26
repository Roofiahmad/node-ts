import Logging from '../library/Logging';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import IUser from '../interfaces/user';

const NAMESPACE = 'Auth';

const signJWT = (user: IUser, callback: (error: Error | null, token: string | null) => void): void => {
    const timeSinchEpoch = new Date().getTime();
    const expirationTime = timeSinchEpoch + Number(config.token.expireTime) * 100000;
    const expirationTimeInSeconds = Math.floor(expirationTime / 1000);

    Logging.info(NAMESPACE + ' Attempting to sign token for ' + user.username);

    try {
        jwt.sign({ username: user.username }, config.token.secret, { issuer: config.token.issuer, algorithm: 'HS256', expiresIn: expirationTimeInSeconds }, (error, token) => {
            if (error) {
                callback(error, null);
            } else if (token) {
                callback(null, token);
            }
        });
    } catch (error: any) {
        Logging.error(NAMESPACE + ' ' + error);
        callback(error, null);
    }
};

export default signJWT;
