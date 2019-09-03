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
  // updated(changedProperties) {
  //   changedProperties.forEach((oldValue, propName) => {
  //     // if (propName === 'query') {
  //     //   if (this.query.length > 0) {
  //     //     fetch(this.query)
  //     //       .then(res => res.text())
  //     //       .then(res => this._url = res)
  //     //   }
  //     // }
  //   });
  // }
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
                    animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1)
                      infinite;
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
      ${this._url
        ? html`
            <iframe no-frame frameborder="0" src=${this._url}></iframe>
          `
        : this.button
        ? this.loading
          ? html`
              <div id="pre-bootstrap" class="${this.loading ? 'loading' : ''}">
                <div class="messaging">
                  <div class="progress-line"></div>
                </div>
              </div>
            `
          : html`
              <button href=${this.query} @click=${this._start}>
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
