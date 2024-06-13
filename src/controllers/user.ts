import { Request } from 'express';
import userModel from '../models/user';
import Logger from '../utils/logger';
import * as I from '../interfaces';

class User {
    log: Logger;

    constructor() {
        this.log = new Logger();
    }

    async create(req: Request) {
        const {
            username,
            password,
            role
        } = req.body;

        const result: I.Result = {
            res: null
        };

        try {
            const response = await userModel.register({ 
                username,
                active: true,
                role,
                created: new Date()
            }, password);

            this.log.debug(`created: ${response.username}, id: ${response._id}`, { req });
            result.res = response._id;
        } catch (e: any) {
            result.error = true;
            this.log.error('could not create user', { err: e, req });
        }

        return result;
    }

    async resetPassword(req: Request): Promise<I.Result> {
        const result: I.Result = {
            res: null
        };
    
        const {
            current_password,
            new_password
        } = req.body;

        const { user }: any = req;

        try {
            const userM = await userModel.findByUsername(user.username);
    
            await userM.changePassword(current_password, new_password)

            await userM.save();

            this.log.debug(`updated password`, { req });

            result.res = 'password reset successfully';
        } catch(e: any) {
            if (e.message === 'Password or username is incorrect') {
                result.res = 'Current Password is incorrect';

                return result;
            }

            result.error = true;
            this.log.error('could not update password', { err: e, req })
        }

        return result;
    }

}

export = User;
