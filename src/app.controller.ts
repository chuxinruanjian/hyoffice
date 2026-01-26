import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  serveFrontend(@Req() req: Request, @Res() res: Response) {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }
}
