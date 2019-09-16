import { LitElement, html } from "./web_modules/lit-element.js";
import "./thin-spinner.js"

class ContainersOnDemand extends LitElement {
  static get properties() {
    return {
      endpoint: { type: String },
      host: { type: String},
      image: { type: String},
      path: { type: String },
      port: { type: String },
      repo: { type: String },
      env: { type: String },
      button: { type: String },
      loading: { type: Boolean, reflect: true },
      _url: { type: String }
    };
  }
  constructor() {
    super();
    this.endpoint = "";
    this.path = "";
    this.image = "";
    this.port = "80";
    this.repo =""
    this.env =""
    this._url = "";
    this.button = "";
    this.host = window.location.host;
    this.loading = false;
  }
  _start() {
    this.loading = true;
    const repo = (this.repo) ? `&repo=${this.repo}` : ''
    const env = (this.env) ? `&env=${this.env}` : ''
    const query = `${this.endpoint}?image=${this.image}&host=${this.host}&port=${this.port}${repo}${env}`
    if (query.length > 0) {
      fetch(query)
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
          padding: 18px;
          text-align: center;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          text-transform: uppercase;
          color: black;
          cursor: pointer;
        }
        thin-spinner {
          display: block;
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 100%;
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
              <thin-spinner loading="${this.loading}"></thin-spinner>
            `
          : html`
              <button id="button" @click=${this._start}>
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
