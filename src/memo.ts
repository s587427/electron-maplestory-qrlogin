// ! 大致流程
// ? 網站跳轉aspx
// GET: https://tw.beanfun.com/beanfun_block/bflogin/default.aspx?service=999999_T0&dt=20260430235044.890&url=https%3A//tw.beanfun.com/%23
// GET: https://tw.newlogin.beanfun.com/checkin.aspx?skey=202604e83afb6739974f&display_mode=0
// GET: https://tw.newlogin.beanfun.com/checkin_step2.aspx?skey=202604e83afb6739974f&display_mode=2

// ? 新版QR CODE登入頁 call api
// GET: https://tw.newlogin.beanfun.com/checkin_step2.aspx?skey=202604e83afb6739974f&display_mode=2&_=1777564245358
// GET: https://login.beanfun.com/Login/InitLogin
// POST: https://login.beanfun.com/QRLogin/CheckLoginStatus -> need data: pSKey, requestVerificationToken
// POST: https://login.beanfun.com/QRLogin/QRLogin

// ?登入拿webToken aspx,  sever will set cookie
// GET: https://login.beanfun.com/Login/SendLogin get
// GET: https://tw.beanfun.com/beanfun_block/bflogin/return.aspx
