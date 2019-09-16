import { LitElement, html } from "./web_modules/lit-element.js";

class ThinSpinner extends LitElement {
  static get properties() {
    return {
      loading: { type: Boolean, reflect: true }
    };
  }
  constructor() {
    super();
    this.loading = false;
  }
  render() {
    return html`
      <style>
        :host {
          display: block;
          position: relative;
        }
        #pre-bootstrap {
          background-color: white;
          opacity: 1;
          position: relative;
          transition: all linear 300ms;
          -webkit-transition: all linear 300ms;
          z-index: 999999;
        }
        body[no-js] #pre-bootstrap {
          display: none !important;
        }
        #pre-bootstrap.loaded {
          animation: fade-out 0.7s ease-in-out;
          animation-fill-mode: forwards;
        }
        #pre-bootstrap div.messaging {
          color: rgba(255, 255, 255, 0.7);
          font-family: Roboto;
          left: 0px;
          position: absolute;
          right: 0px;
          text-align: center;
          top: 50%;
        }
        #pre-bootstrap img {
          width: 300px;
          padding-bottom: 50px;
        }
        .progress-line,
        .progress-line:before {
          height: 5px;
          width: 100%;
          margin: auto;
        }
        .progress-line {
          background-color: rgba(0, 0, 0, 0.05);
          display: -webkit-flex;
          display: flex;
          width: 300px;
        }
        .progress-line:before {
          background-color: black;
          content: "";
          animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes running-progress {
          0% {
            margin-left: 0px;
            margin-right: 100%;
          }
          50% {
            margin-left: 25%;
            margin-right: 0%;
          }
          100% {
            margin-left: 100%;
            margin-right: 0;
          }
        }
        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          99% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
      </style>
      ${this.loading
        ? html`
            <div id="pre-bootstrap" class="${this.loading ? "loading" : ""}">
              <div class="messaging">
                <div class="progress-line"></div>
              </div>
            </div>
          `
        : html`
            <slot></slot>
          `}
    `;
  }
}
customElements.define("thin-spinner", ThinSpinner);
