import {
  createAlova,
  GlobalFetch,
  useFetcher,
  useRequest,
} from '../../../src';
import VueHook from '../../../src/predefine/VueHook';
import { getResponseCache } from '../../../src/storage/responseCache';
import { key } from '../../../src/utils/helper';
import { AlovaRequestAdapterConfig } from '../../../typings';
import { Result } from '../result.type';
import server from '../../server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
function getInstance(
  beforeRequestExpect?: (config: AlovaRequestAdapterConfig<any, any, RequestInit, Headers>) => void,
  responseExpect?: (jsonPromise: Promise<any>) => void,
  resErrorExpect?: (err: Error) => void,
) {
  return createAlova({
    baseURL: 'http://localhost:3000',
    timeout: 3000,
    statesHook: VueHook,
    requestAdapter: GlobalFetch(),
    beforeRequest(config) {
      beforeRequestExpect && beforeRequestExpect(config);
      return config;
    },
    responsed: {
      success: response => {
        const jsonPromise = response.json();
        responseExpect && responseExpect(jsonPromise);
        return jsonPromise;
      },
      error: err => {
        resErrorExpect && resErrorExpect(err);
      }
    }
  });
}

describe('use useFetcher hook to fetch data', function() {
  test('should replace cached response when fetch data', done => {
    const alova = getInstance();
    const createGet = (params: Record<string, string>) => alova.Get('/unit-test-count', {
      params,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      transformData(result: Result, _) {
        return result.data;
      },
      localCache: 100 * 1000,
    });

    const Get1 = createGet({ a: '1', b: '2'});
    const { data } = useRequest(Get1, {
      onSuccess: () => {
        expect(data.value.params.count).toBe(0);
        fetch(Get1);
        expect(fetching.value).toBeTruthy();
        expect(downloading.value).toEqual({ total: 0, loaded: 0 });
        expect(error.value).toBeUndefined();
        // 缓存有值
        const cacheData = getResponseCache(alova.id, key(Get1));
        expect(cacheData.params).toEqual({ a: '1', b: '2', count: 0 });
      }
    });

    const {
      fetching,
      downloading,
      error,
      fetch,
    } = useFetcher(alova, {
      onSuccess: () => {
        expect(data.value.params.count).toBe(1);
        expect(fetching.value).toBeFalsy();
        expect(downloading.value).toEqual({ total: 0, loaded: 0 });
        expect(error.value).toBeUndefined();
        // 缓存有值
        const cacheData = getResponseCache(alova.id, key(Get1));
        expect(cacheData.params).toEqual({ a: '1', b: '2', count: 1 });
        done();
      }
    });
    
    expect(fetching.value).toBeFalsy();
    expect(downloading.value).toEqual({ total: 0, loaded: 0 });
    expect(error.value).toBeUndefined();
  });
});