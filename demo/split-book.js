import { LitElement, html } from "./web_modules/lit-element.js";

class SplitBook extends LitElement {
  constructor() {
    super();
  }
  render() {
    return html`
      <style>
        :host {
          display: flex;
          position: relative;
          width: auto;
          flex-direction: column;
          min-height: 100vh;
        }
        #container {
          display: flex;
          position: relative;
          width: auto;
          flex-direction: row;
          justify-content: space-between;
          flex: 1 1 auto;
        }
        #left, #right {
          display: flex;
          flex-direction: column;
          width: calc(50% - 5px);
        }
        #left {
          width: calc(35% - 5px);
        }
        #right {
          width: calc(65% - 5px);
        }
        #left .content {
          display: block;
        }
        .content {
          padding: 1em;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          flex: 1 1 auto;
        }
        .content ::slotted(*) {
          display: flex;
          width: 100%;
          height: 100%;
          flex-direction: column;
          flex: 1 1 auto;
        }
        .title {
          background-color: #cfdce1;
          color: #3d4251;
          line-height: 1.7;
          padding: 9px 20px;
          margin: 0;
          width: auto;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          -ms-flex: 0 0 auto;
          flex: 0 0 auto;
          border-radius: 5px;
        }
      </style>
      <div id="container">
        <div id="left">
          <div class="title">
            <slot name="left-title"></slot>
          </div>
          <div class="content">
            <slot name="left"></slot>
          </div>
        </div>

        <div id="right">
          <div class="title">
            <slot name="right-title"></slot>
          </div>
          <div class="content">
            <slot name="right"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("split-book", SplitBook);
