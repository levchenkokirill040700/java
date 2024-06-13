import { Request, Response } from 'express';

export interface LogObject {
    err?: unknown;
    req?: Request;
    res?: Response;
}
