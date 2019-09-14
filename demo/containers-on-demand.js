import { LitElement, html } from "./web_modules/lit-element.js";

class ContainersOnDemand extends LitElement {
  static get properties() {
    return {
      query: { type: String },
      path: { type: String },
      button: { type: String },
      loading: { type: Boolean, reflect: true },
      _url: { type: String }
    };
  }
  constructor() {
    super();
    this.query = "";
    this.path = "";
    this._url = "";
    this.button = "";
    this.loading = false;
  }
  _start() {
    this.loading = true;
    if (this.query.length > 0) {
      fetch(this.query)
        .then(res => res.text())
        .then(res => {
          setTimeout(() => (this._url = `${res}/${this.path}`), 4000);
        });
    }
  }
  render() {
    return html`
      <style>
        :host {
          display: block;
          position: relative;
        }
        a {
          color: inherit;
          text-decoration: inherit;
          background: #29cc18;
          text-transform: uppercase;
          padding: 1em;
          color: white;
          display: inline-block;
          font-size: 1.2em;
        }
        iframe {
          width: 100%;
          height: 100%;
        }
        #pre-bootstrap {
          background-color: white;
          bottom: 0px;
          left: 0px;
          opacity: 1;
          position: absolute;
          right: 0px;
          top: 0px;
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
          margin-top: -75px;
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
        #button {
          display: inline-flex;
          width: 80%;
          margin: auto;
          max-width: 400px;
          /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#8efc88+0,52ea52+40,0ca304+100 */
          background: #8efc88; /* Old browsers */
          background: -moz-linear-gradient(-45deg,  #8efc88 0%, #52ea52 40%, #0ca304 100%); /* FF3.6-15 */
          background: -webkit-linear-gradient(-45deg,  #8efc88 0%,#52ea52 40%,#0ca304 100%); /* Chrome10-25,Safari5.1-6 */
          background: linear-gradient(135deg,  #8efc88 0%,#52ea52 40%,#0ca304 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
          filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#8efc88', endColorstr='#0ca304',GradientType=1 ); /* IE6-9 fallback on horizontal gradient */
          padding: 2vw;
          text-align: center;
          align-items: center;
          justify-content: center;
          font-size: 2vw;
          text-transform: uppercase;
          color: black;
        }
      </style>
      ${this._url
        ? html`
            <iframe
              no-frame
              frameborder="0"
              src=${this._url}
              @error=${this._iframeError}
            ></iframe>
          `
        : this.button
        ? this.loading
          ? html`
              <div id="pre-bootstrap" class="${this.loading ? "loading" : ""}">
                <div class="messaging">
                  <div class="progress-line"></div>
                </div>
              </div>
            `
          : html`
              <button id="button" href=${this.query} @click=${this._start}>
                ${this.button}
              </button>
            `
        : html`
            Could not resolve container
          `}
    `;
  }
}
customElements.define("containers-on-demand", ContainersOnDemand);
