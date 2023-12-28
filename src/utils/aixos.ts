import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from "axios";

// 日志处理，可定制
const printLog = console;

// 作为被Promise包裹的请求响应对象的格式
export interface IResponse {
  code: number;
  msg: string;
  result: {
    lastOperaTime: number;
    data: any;
  };
}

// 发送请求的配置项的格式
export interface RequestParams {
  url: string;
  baseUrl?: string;
  data?: object;
  filter?: boolean;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  headers?: any;
  timeout?: number;
}

// 封装对象支持的请求方式/方法
interface IHttp {
  get?: (params: RequestParams) => Promise<any>;
  post?: (params: RequestParams) => Promise<any>;
  put?: (params: RequestParams) => Promise<any>;
  patch?: (params: RequestParams) => Promise<any>;
  delete?: (params: RequestParams) => Promise<any>;
}

// 支持的请求方式类型
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

// 向外暴露出去的对象
const request: IHttp = {};

// 支持的请求类型
const methods: HttpMethod[] = ["get", "post", "put", "patch", "delete"];

// 遍历methods数组，逐步构造req对象
methods.forEach((_m: HttpMethod) => {
  // 使用遍历的方式对req对象上的各个方法进行构造
  request[_m] = (params: RequestParams) => {
    // 1. 构造参数合并
    params = {
      ...params,
      responseType: params.responseType || "json",
    };

    // 2. 从使用对象方法的形参上结构出必要的参数
    const {
      url, // 服务器地址
      data, // 有效载荷
      filter = true, // 过滤器
      responseType, // 返回类型
      timeout, // 超时时间
    } = params;

    // 3. 使用axios创建AxiosInstance实例对象
    const instance = axios.create({
      baseURL: params.baseUrl ?? process.env.API_HOST,
      timeout: timeout ?? 10000,
    });

    // 4. 创建请求头对象
    const headers = {
      lastOperaTime: Date.now(), // 时间戳
      token: localStorage.getItem("TOKEN"), // 凭证(如果有)
      Accept: "application/json", // 接受返回数据的类型
      "Content-Type": "application/json; charset=utf-8", // 内容格式
    };

    // 5. 请求配置
    const axiosConfig: AxiosRequestConfig = {
      method: _m, // 请求方法
      url, // 服务器地址
      headers: {
        // 合并请求头
        ...headers,
        ...(params.headers || {}),
      },
      responseType, // 返回值类型
    };

    // 6. 针对不同的请求类型需要对请求配置进行修正
    if (data) {
      // 对于有效载荷，不同的请求方式携带信息的方式是不同的，在这里做了区分
      if (_m === "get") {
        axiosConfig.params = data;
      } else if (data instanceof FormData) {
        axiosConfig.data = data;
      } else {
        axiosConfig.data = data;
      }
    }

    // 添加请求拦截器
    instance.interceptors.request.use(
      // 占位
      (config: any) => {
        return config;
      },
      // 失败则返回失败
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // 7. 添加响应拦截器
    instance.interceptors.response.use(
      // 成功的回调，将发起请求的参数作为第二参数回传
      (res: any) => handleSuccess(res, params),
      // 失败的回调，将发起请求的参数作为第二参数回传
      (err: any) => handleError(err, params)
    );

    // 8. 构造请求成功的回调函数 -- 主要是对返回数据进行格式化的操作
    function handleSuccess(
      response: AxiosResponse<IResponse>,
      requestParams: RequestParams
    ) {
      if (response.data) {
        // 解构数据
        const { code, msg, result } = response.data;
        if (code !== 0) {
          printLog.error(msg);
        }

        return filter ? result?.data ?? result : response.data;
      } else {
        printLog.error("incorrect data format");
        return response.data;
      }
    }

    // 9. 构造请求失败的回调函数
    function handleError(err: AxiosError, requestParams: RequestParams) {
      if (err.response) {
        printLog.error(`api: ${requestParams.url}: ${err.response.status}`);
      }
      if (err instanceof Error) {
        if (err.message) {
          printLog.error(err.message);
        }
      }
      if (!window.navigator.onLine) {
        // 处理断网情况
        printLog.error("netwrok error");
      }
      return Promise.reject(err);
    }

    // 10. 发送请求并将请求结果（Promise对象）作为函数的返回值
    return instance.request(axiosConfig);
  };
});

export default request;
