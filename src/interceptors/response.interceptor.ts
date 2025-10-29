import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export interface Response <T>{
  data: T[]
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>>{
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    return next.handle().pipe(map(data => {
      if (!data) return {data: []}
      if(Array.isArray(data)) return {data: [...data]}
      return {data: [data]}
    }));
  }
} 