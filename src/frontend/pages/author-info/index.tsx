import MailIcon from "@/frontend/assets/icons/mail-icon"
import GithubIcon from "@/frontend/assets/icons/github-icon"
import { SetStateAction } from "react"
import "./index.css"

type AuthorInfoProps = {
  setIsShowAuthorInfo: React.Dispatch<SetStateAction<boolean>>
}

export function AuthorInfo({ setIsShowAuthorInfo }: AuthorInfoProps) {
  return (
    <div className="author-info-wrapper">
      <section className="author-info">
        <h2 className="author-info__title">Gama Play Login</h2>
        <div className="author-info__sub-title">
          <p className="text-orange">Version 1.0.0</p>
          <p className="text-gray">By s587427．Sheng Yi</p>
        </div>

        <div className="author-info__content">
          <p className="text">
            ujc89r432c2*^&HJ
            <br />
            貓咪踩到鍵盤了
            <br />
            我也不知道要寫什麼
            <br />
            拜託各位抖內給我
          </p>
        </div>

        <div className="author-info__contact">
          <p className="text">Contact</p>
          <div className="author-info__contact-links">
            <p className="text info">
              <MailIcon className="info-icon" />
              <a className="text info-link" href="mailto:abc@gmail.com">
                聯繫開發者
              </a>
            </p>
            <p className="text info">
              <GithubIcon className="info-icon" />
              <a
                className="text info-link"
                href="https://github.com/s587427"
                onClick={(e) => {
                  e.preventDefault()
                  window.api.openExternal("https://github.com/s587427")
                }}
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </section>

      <button
        className="btn btn-orange"
        onClick={() => setIsShowAuthorInfo(false)}
      >
        返回
      </button>
    </div>
  )
}
