import { net } from "electron"

type Options = RequestInit & { bypassCustomProtocolHandlers?: boolean }
export function beanfunFetch(url: string, options: Options = {}) {
  const defaultHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
    "Accept-Encoding": "identity", // 不要壓縮
  }

  if (options?.headers)
    options.headers = { ...defaultHeaders, ...options.headers }

  return net.fetch(url, options)
}
