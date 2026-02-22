import React, { SetStateAction } from "react"
import "./index.css"

type ToolBarProps = {
  setIsShowAuthorInfo: React.Dispatch<SetStateAction<boolean>>
}

export function ToolBar({ setIsShowAuthorInfo }: ToolBarProps) {
  function handleBtnsClick(
    clickType: "info" | "minimize" | "maximize" | "close"
  ) {
    window.win[clickType]()

    switch (clickType) {
      case "info":
        setIsShowAuthorInfo((preVal) => !preVal)
        break

      default:
        break
    }
  }

  return (
    <>
      <section className="toolbar">
        <button
          className="toolbar__btn toolbar__info"
          onClick={() => handleBtnsClick("info")}
        />
        <button
          className="toolbar__btn toolbar__minimize"
          onClick={() => handleBtnsClick("minimize")}
        />
        {/* <button
        className="toolbar__btn toolbar__maximize"
        onClick={() => handleBtnsClick("maximize")}
      /> */}
        <button
          className="toolbar__btn toolbar__close"
          onClick={() => handleBtnsClick("close")}
        />
      </section>
    </>
  )
}
