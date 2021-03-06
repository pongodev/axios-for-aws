import axios from 'axios';
import https from 'https';
import { AwsEvent } from './models/awsEvent';
import { extractHeadersFromEvent } from './utils/headers';
import { aggregateParameters } from './utils/parameters';

export interface OptionalAxiosLambdaConfiguration {
  readonly host?: string;
  readonly httpsAgent?: https.Agent;
}
interface AxiosLambdaResponseOfT<T> {
  readonly data: T;
  readonly status: number;
  readonly headers: any;
  readonly config: any;
  readonly request?: any;
}
export interface AxiosLambdaResponse extends AxiosLambdaResponseOfT<any> {}

export async function axiosLambda(
  event: AwsEvent,
  url: string,
  config: OptionalAxiosLambdaConfiguration
): Promise<AxiosLambdaResponse> {
  const { httpMethod, body } = event;
  const { host, httpsAgent } = {
    ...config,
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  };
  const headers = extractHeadersFromEvent(event);
  const params = aggregateParameters(event);
  const targetRequest = {
    data: body,
    headers: host ? { ...headers, ['HOST']: host } : headers,
    httpsAgent: (url || '').indexOf('https') !== -1 ? httpsAgent : undefined,
    method: httpMethod,
    params,
    url
  };
  return axios(targetRequest);
}
