import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IncomingMessage } from 'http';
import { IUser } from './user.interface';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext): IUser => {
    // const request = ctx.switchToHttp().getRequest<Request>();
    const request = ctx.switchToHttp().getRequest<Request>();
    console.log({ p: 'decorator', data, ln: request.get('id'), body: request.body, query: request.query });
    return {
        id: 'user.id',
        name: 'user.name',
        description: 'user.descriptiom',
    };
  },
);