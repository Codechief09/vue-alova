import { AlovaMethodConfig, MethodRequestConfig, MethodType, RequestBody } from '~/typings';
import Alova from './Alova';
import sendRequest from './functions/sendRequest';
import { getConfig, getContextOptions, instanceOf, isPlainObject, key, noop } from './utils/helper';
import { deleteAttr, falseValue, forEach, isArray, mapItem, undefinedValue } from './utils/variables';

export const typeGet = 'GET';
export const typeHead = 'HEAD';
export const typePost = 'POST';
export const typePut = 'PUT';
export const typePatch = 'PATCH';
export const typeDelete = 'DELETE';
export const typeOptions = 'OPTIONS';
export default class Method<S = any, E = any, R = any, T = any, RC = any, RE = any, RH = any> {
  public type: MethodType;
  public baseURL: string;
  public url: string;
  public config: MethodRequestConfig & AlovaMethodConfig<R, T, RC, RH>;
  public data?: RequestBody;
  public hitSource?: (string | RegExp)[];
  public context: Alova<S, E, RC, RE, RH>;
  public response: R;
  public __key__?: string;

  // 直接发送请求的中断函数
  public abort = noop;
  constructor(
    type: MethodType,
    context: Alova<S, E, RC, RE, RH>,
    url: string,
    config?: AlovaMethodConfig<R, T, RC, RH>,
    data?: RequestBody
  ) {
    const contextOptions = getContextOptions(context);
    this.baseURL = contextOptions.baseURL || '';
    this.url = url;
    this.type = type;
    this.context = context;

    // 将请求相关的全局配置合并到Method对象中
    const contextConcatConfig: any = {},
      mergedLocalCacheKey = 'localCache',
      globalLocalCache = isPlainObject(contextOptions[mergedLocalCacheKey])
        ? contextOptions[mergedLocalCacheKey][type]
        : undefinedValue,
      hitSource = config?.hitSource;

    // 合并参数
    forEach(['timeout', 'shareRequest'], mergedKey => {
      if (contextOptions[mergedKey as keyof typeof contextOptions] !== undefinedValue) {
        contextConcatConfig[mergedKey] = contextOptions[mergedKey as keyof typeof contextOptions];
      }
    });

    // 合并localCache
    if (globalLocalCache !== undefinedValue) {
      contextConcatConfig[mergedLocalCacheKey] = globalLocalCache;
    }

    // 将hitSource统一处理成数组，且当有method实例时将它们转换为methodKey
    if (hitSource) {
      this.hitSource = mapItem(isArray(hitSource) ? hitSource : [hitSource], sourceItem =>
        instanceOf(sourceItem, Method) ? key(sourceItem) : (sourceItem as string | RegExp)
      );
      deleteAttr(config, 'hitSource');
    }

    this.config = {
      ...contextConcatConfig,
      headers: {},
      params: {},
      ...(config || {})
    };
    this.data = data;
  }

  /**
   * 通过method实例发送请求，返回promise对象
   */
  public send(forceRequest = falseValue): Promise<R> {
    return sendRequest(this, forceRequest).response();
  }

  /**
   * 设置方法名称，如果已有名称将被覆盖
   * @param name 方法名称
   */
  public setName(name: string | number) {
    getConfig(this).name = name;
  }
}
