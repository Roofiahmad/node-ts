import { NextFunction, Request, Response } from 'express';
import Logging from '../library/Logging';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User';
import signJWT from '../functions/signJWT';

const NAMESPACE = 'Users';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    Logging.info(NAMESPACE + ' Token validated, user authorized');

    return res.status(200).json({
        message: 'Authorized'
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            res.status(400).json({
                message: hashError.message,
                error: hashError
            });
        }

        // insert user into DB

        const _user = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            password: hash
        });

        return _user
            .save()
            .then((user) => {
                return res.status(201).json({
                    message: 'User created',
                    user
                });
            })
            .catch((err) => res.status(500).json({ message: err.message, error: err }));
    });
};

const login = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({
                    message: 'Unauthorized'
                });
            }
            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    Logging.error(NAMESPACE + ' ' + error.message);
                    return res.status(401).json({
                        message: 'Unauthorized'
                    });
                } else if (result) {
                    signJWT(users[0], (_error, token) => {
                        Logging.error(NAMESPACE + ' ' + _error);

                        if (_error) {
                            return res.status(401).json({
                                message: 'Unauthorized',
                                error: _error
                            });
                        } else if (token) {
                            return res.status(200).json({
                                message: 'Auth Successfull',
                                token,
                                user: users[0]
                            });
                        }
                    });
                }
            });
        })
        .catch((err) => res.status(404).json({ message: err.message, error: err }));
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(201).json({
                users,
                count: users.length
            });
        })
        .catch((err) => res.status(404).json({ message: err.message, error: err }));
};

export default { validateToken, register, login, getAllUsers };
