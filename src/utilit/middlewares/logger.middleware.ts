import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log("requset... in start")
        next()
    }
}

@Injectable()
export class LoggerMiddlewar2 implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log("requset... in start2")
        next()
    }
}