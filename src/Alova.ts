import {
  AlovaOptions,
  RequestAdapter,
  StatesHookCreator,
  StatesHookUpdater
} from '../typings';
import Connect from './methods/Connect';
import Delete from './methods/Delete';
import Get from './methods/Get';
import Head from './methods/Head';
import Method from './methods/Method';
import Options from './methods/Options';
import Patch from './methods/Patch';
import Post from './methods/Post';
import Put from './methods/Put';
import Trace from './methods/Trace';
import requestAdapter from './predefined/requestAdapter';

export class Alova<C extends StatesHookCreator, U extends StatesHookUpdater> {
  private requestAdapter: RequestAdapter<any> = requestAdapter;
  public options: AlovaOptions<C, U>;
  constructor(options: AlovaOptions<C, U>) {
    this.options = options;
  }

  setRequestInterceptor() {
    
  }
  setResponseInterceptor() {
    
  }

  Get(url: string) {
    const get = new Get<C, U>(url);
    get.context = this;
    return get;
  }
  Post(url: string, data: any) {
    return new Post(url);
  }
  Delete(url: string, data: any) {
    return new Delete(url);
  }
  Put(url: string, data: any) {
    return new Put(url);
  }
  Head(url: string) {
    return new Head(url);
  }
  Patch(url: string, data: any) {
    return new Patch(url);
  }
  Options(url: string) {
    return new Options(url);
  }
  Trace(url: string) {
    return new Trace(url);
  }
  Connect(url: string) {
    return new Connect(url);
  }

  setAbort() {

  }
  
  invalidate(methodInstance: Method<C, U>) {

  }

  update(methodInstance: Method<C, U>, handleUpdate: (data: unknown) => unknown) {

  }
  
  fetch(methodInstance: Method<C, U>) {

  }
}

export default function createAlova<C extends StatesHookCreator, U extends StatesHookUpdater>(options: AlovaOptions<C, U>) {
  return new Alova<C, U>(options);
}