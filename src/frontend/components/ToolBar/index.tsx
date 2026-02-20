import "./index.css"
export function ToolBar() {
  function handleBtnsClick(
    clickType: "info" | "minimize" | "maximize" | "close"
  ) {
    window.win[clickType]()
  }

  return (
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
  )
}
