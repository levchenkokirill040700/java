import { Request, Response } from 'express';

function assignedRole(req: Request) {
    if (req && req.user) {
        const { user }: any = req;
        return user.role;
    }

    return undefined;   
}

function roleCheck(roles: string[]) {
    return (req: Request, res: Response, next: any) => {
        const role = assignedRole(req);
    
        if (roles.some((r) => r === role)) {
            next();
            return;
        }
    
        res.redirect('/home');
    }
}

export = roleCheck;
