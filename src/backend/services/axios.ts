import axios from "axios"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"

declare module "axios" {
  interface AxiosRequestConfig {
    jar?: CookieJar
  }
}

export const jar = new CookieJar()
export const beanfunClient = wrapper(
  axios.create({
    jar,
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
      "Accept-Encoding": "identity", // C# 特意設 identity，不壓縮
    },
  })
)
