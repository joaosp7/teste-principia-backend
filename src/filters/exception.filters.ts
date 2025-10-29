import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { QueryFailedError, TypeORMError } from "typeorm";

@Catch()
export class ExceptionGeneralFilter implements ExceptionFilter{
  private readonly logger = new Logger(ExceptionGeneralFilter.name);

  constructor(private readonly httpAdapter: HttpAdapterHost){}

  catch(exception: any, host: ArgumentsHost):void {

    let message = exception?.message ?? ''
    const contex = host.switchToHttp();

    if (exception instanceof TypeORMError){

      this.logger.error(`TypeORM/DB error: ${exception?.message}`);
      this.logger.error(`Check current Stack for error: ${exception?.stack}`);
      message = 'TypeOrmError'
    }

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : 500 

    const responseBody = {
      statusCode: httpStatus,
      message: message ? message : 'Internal Server Error',
    };
    
    this.httpAdapter.httpAdapter.reply(contex.getResponse(), responseBody, httpStatus);

  }
}