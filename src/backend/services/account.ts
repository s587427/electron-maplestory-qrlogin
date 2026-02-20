import crypto from "crypto"
import { beanfunClient, jar } from "./axios"

export interface ServiceAccount {
  clickable: boolean
  id: string
  ssn: string
  name: string
  createTime: string
}

export interface GetAccountsResult {
  accountList: ServiceAccount[]
  accountAmountLimitNotice: string
}

async function getAccounts(
  webToken: string,
  serviceCode: string,
  serviceRegion: string,
  fatal: boolean = true
): Promise<GetAccountsResult> {
  const host: string = "tw.beanfun.com"

  // 先打 auth.aspx 初始化
  await beanfunClient.get(
    `https://${host}/beanfun_block/auth.aspx?channel=game_zone&page_and_query=game_start.aspx%3Fservice_code_and_region%3D${serviceCode}_${serviceRegion}&web_token=${webToken}`
  )

  // 再抓帳號清單 HTML
  const { data: response } = await beanfunClient.get(
    `https://${host}/beanfun_block/game_zone/game_server_account_list.aspx?sc=${serviceCode}&sr=${serviceRegion}&dt=${Date.now()}`
  )

  // 抓帳號列表
  const accountRegex =
    /onclick="([^"]*)"><div id="(\w+)" sn="(\d+)" name="([^"]+)"/g

  let accountList: ServiceAccount[] = []
  let match: RegExpExecArray | null

  while ((match = accountRegex.exec(response)) !== null) {
    const [, onclick, id, ssn, name] = match
    if (!id || !ssn || !name) continue

    accountList.push({
      clickable: onclick !== "",
      id,
      ssn,
      name: decodeURIComponent(name),
      createTime: null,
    })
  }

  // update createTime
  accountList = await Promise.all(
    accountList.map(async (acc) => {
      return {
        ...acc,
        createTime: await getCreateTime(serviceCode, serviceRegion, acc.ssn),
      }
    })
  )

  // 抓提示訊息
  const noticeRegex =
    /<div id="divServiceAccountAmountLimitNotice" class="InnerContent">(.*)<\/div>/
  const noticeMatch = response.match(noticeRegex)

  let accountAmountLimitNotice = ""
  if (noticeMatch) {
    accountAmountLimitNotice = noticeMatch[1]
    if (accountAmountLimitNotice.includes("進階認證")) {
      accountAmountLimitNotice = "AuthReLogin"
    }
  }

  // 排序
  accountList.sort((a, b) => a.ssn.localeCompare(b.ssn))

  return { accountList, accountAmountLimitNotice }
}

// public int getRemainPoint(){
//     string response = null;
//     System.Text.RegularExpressions.Regex regex;

//     string url = "https://";
//     if (App.LoginRegion == "TW")
//         url += "tw";
//     else
//         url += "bfweb.hk";
//     response = this.DownloadString(url += ".beanfun.com/beanfun_block/generic_handlers/get_remain_point.ashx?webtoken=1");

//     try
//     {
//         regex = new System.Text.RegularExpressions.Regex("\"RemainPoint\" : \"(.*)\" }");
//         if (regex.IsMatch(response))
//             return int.Parse(regex.Match(response).Groups[1].Value);
//         else
//             return 0;
//     }
//     catch
//     { return 0; }
// }

async function getOTP(
  serviceAccount: ServiceAccount,
  serviceCode: string = "610074",
  serviceRegion: string = "T9"
) {
  const host = "tw.beanfun.com"
  const loginHost = "tw.newlogin.beanfun.com"

  const cookies = await jar.getCookies(`https://${host}`)
  const webToken = cookies?.find((c) => c.key === "bfWebToken")?.value

  // ===============================
  // Step1: game_start_step2.aspx
  // ===============================
  const gameStartStep2Response = await beanfunClient.get(
    `https://${host}/beanfun_block/game_zone/game_start_step2.aspx?service_code=${serviceCode}&service_region=${serviceRegion}&sotp=${serviceAccount.ssn}&dt=${getCurrentTime(2)}`
  )

  let match = gameStartStep2Response.data.match(
    /GetResultByLongPolling&key=(.*)"/
  )
  if (!match) {
    throw new Error(gameStartStep2Response.data)
  }
  const longPollingKey = match[1]

  // ===============================
  // Step2: unkKey unkValue (TW only)
  // ===============================
  let unkKey: string | null = null
  let unkValue: string | null = null
  match = gameStartStep2Response.data.match(
    /MyAccountData\.ServiceAccountCreateTime \+ "(.*)=(.*)";/
  )
  if (!match) {
    console.log("OTPNoUnkData")
    throw new Error("OTPNoUnkData")
  }

  unkKey = decodeURIComponent(match[1])
  unkValue = decodeURIComponent(match[2])

  // ===============================
  // Step3: ServiceAccountCreateTime
  // ===============================
  if (!serviceAccount.createTime) {
    match = gameStartStep2Response.data.match(
      /ServiceAccountCreateTime: "([^"]+)"/
    )
    if (!match) {
      console.log("OTPNoCreateTime")
      throw new Error("OTPNoCreateTime")
    }
    serviceAccount.createTime = match[1]
  }

  // ===============================
  // Step4: get_cookies.ashx → SecretCode
  // ===============================
  const getCookiesResponse = await beanfunClient.get(
    `https://${loginHost}/generic_handlers/get_cookies.ashx`
  )

  match = getCookiesResponse.data.match(/var m_strSecretCode = '(.*)';/)
  if (!match) {
    console.log("OTPNoSecretCode")
    throw new Error("OTPNoSecretCode")
  }
  const secretCode = match[1]

  // ===============================
  // Step5: POST record_service_start
  // ===============================
  const payload: Record<string, string> = {
    service_code: serviceCode,
    service_region: serviceRegion,
    service_account_id: serviceAccount.id,
    sotp: serviceAccount.ssn,
    service_account_display_name: serviceAccount.name,
    service_account_create_time: serviceAccount.createTime,
  }

  if (unkKey && unkValue) {
    payload[unkKey] = unkValue
  }

  await beanfunClient.post(
    `https://${host}/beanfun_block/generic_handlers/record_service_start.ashx`,
    new URLSearchParams(payload).toString()
  )

  // ===============================
  // Step6: LongPolling result
  // ===============================
  await beanfunClient.get(
    `https://${host}/generic_handlers/get_result.ashx?meth=GetResultByLongPolling&key=${longPollingKey}&_=${getCurrentTime()}`
  )

  // ===============================
  // Step7: get_webstart_otp.ashx
  // ===============================
  const url =
    `https://${host}/beanfun_block/generic_handlers/get_webstart_otp.ashx?` +
    `SN=${longPollingKey}` +
    `&WebToken=${webToken}` +
    `&SecretCode=${secretCode}` +
    `&ppppp=1F552AEAFF976018F942B13690C990F60ED01510DDF89165F1658CCE7BC21DBA` +
    `&ServiceCode=${serviceCode}` +
    `&ServiceRegion=${serviceRegion}` +
    `&ServiceAccount=${serviceAccount.id}` +
    `&CreateTime=${serviceAccount.createTime.replace(/ /g, "%20")}` +
    `&d=${Math.floor(process.uptime() * 1000)}`
  const getWebstartOtpResponse = await beanfunClient.get(url)

  if (!getWebstartOtpResponse.data) {
    console.log("OTPNoResponse")
    throw new Error("OTPNoResponse")
  }

  const parts = getWebstartOtpResponse.data.split(";")
  if (parts.length < 2) {
    console.log("OTPNoResponse")
    throw new Error("OTPNoResponse")
  }
  if (parts[0] !== "1") {
    console.log("GetOtpError:", getWebstartOtpResponse.data, parts[1])
    throw new Error("GetOtpError")
  }

  // ===============================
  // Step8: DES Decrypt OTP
  // ===============================
  const encrypted = parts[1]
  const key = encrypted.substring(0, 8)
  const plainHex = encrypted.substring(8)

  const decipher = crypto.createDecipheriv(
    "des-ecb",
    Buffer.from(key, "ascii"),
    null
  )

  decipher.setAutoPadding(false)

  let decrypted = decipher.update(Buffer.from(plainHex, "hex"))
  decrypted = Buffer.concat([decrypted, decipher.final()])

  const otp = decrypted.toString("utf8").replace(/\0/g, "").trim()
  console.log({ parts, encrypted, key, decipher, otp })

  return otp
}

function getCurrentTime(method: number = 0): string {
  const date = new Date()

  const pad = (n: number, len: number = 2) => n.toString().padStart(len, "0")

  switch (method) {
    case 1:
      return (
        (date.getFullYear() - 1900).toString() + // 年 - 1900
        date.getMonth().toString() + // 月 - 1 (getMonth 已經是 0~11)
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        pad(date.getMilliseconds(), 3)
      )
    case 2:
      return (
        date.getFullYear().toString() + // 年
        date.getMonth().toString() + // 月 - 1 (getMonth 0~11)
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        pad(date.getMilliseconds(), 3)
      )
    default:
      return (
        pad(date.getFullYear(), 4) +
        pad(date.getMonth() + 1) + // Node.js month 0~11 → 補回 1
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        "." +
        pad(date.getMilliseconds(), 3)
      )
  }
}

async function getCreateTime(
  serviceCode: string,
  serviceRegion: string,
  sn: string
): Promise<null | string> {
  const response = await beanfunClient.get(
    `https://tw.beanfun.com/beanfun_block/game_zone/game_start_step2.aspx?service_code=${serviceCode}&service_region=$${serviceRegion}&sotp=${sn}&dt=${getCurrentTime(2)}`
  )

  // console.log("getCreateTime response: ", response)
  // Regex 抓 ServiceAccountCreateTime
  const match = response.data.match(/ServiceAccountCreateTime: "([^"]+)"/)

  if (!match) return null

  return match[1]
}

export { getAccounts, getOTP }
