import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return { name: 'Deep Analise 0.0.1' };
  }
}
