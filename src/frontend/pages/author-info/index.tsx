import MailIconSrc from "@/frontend/assets/images/mail.png"
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
          <p className="text-orange">Version 0.0</p>
          <p className="text-gray">By s587427．Sheng Yi</p>
        </div>

        <div className="author-info__content">
          <p className="text">Author’s Note</p>
          <p className="text">1234678</p>
          <p className="text">12624</p>
          <p className="text">341256565</p>
        </div>

        <div className="author-info__contact">
          <p className="text">Contact</p>
          <p className="text">
            <img className="mail-icon" src={MailIconSrc} alt="mailIcon" />
            s587427@gmailc.com
          </p>
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
