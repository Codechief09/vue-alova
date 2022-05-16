import { MethodConfig } from '../../typings';
import { RequestBody } from '../Alova';

type RequestInit = NonNullable<Parameters<typeof fetch>[1]>;
export default function GlobalFetch(requestInit: RequestInit = {}) {
  return function<R, T>(source: string, data: RequestBody, config: RequestInit, options: MethodConfig<R, T> = {}) {
    // 设置了中断时间，则在指定时间后中断请求
    const timeout = options.timeout || 0;
    const ctrl = new AbortController();
    let abortTimer: NodeJS.Timeout;
    if (timeout > 0) {
      abortTimer = setTimeout(ctrl.abort, timeout);
    }
    const fetchPromise = fetch(source, {
      ...requestInit,
      ...config,
      signal: ctrl.signal,
      body: data instanceof FormData ? data : JSON.stringify(data),
    }).then(resp => {
      // 请求成功后清除中断处理
      clearTimeout(abortTimer);
      return resp;
    });
    
    return {
      response: () => fetchPromise,
      progress: (cb: (value: number) => void) => {
        fetchPromise.then(response => {
          const contentLength = Number(response.headers.get('Content-Length')) || 1;
          let receivedLength = 0;
          let progressTimer = setInterval(() => {
            response.body?.getReader().read().then(({done, value = new Uint8Array()}) => {
              if (done) {
                clearInterval(progressTimer);
              }
              receivedLength += value.length;
              const percent = (receivedLength / contentLength).toFixed(4);
              cb(Number(percent));
            });
          });
        });
      },
      abort: () => ctrl.abort(),
    };
  };
}