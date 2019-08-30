import { LitElement, html } from './web_modules/lit-element.js'

class ContainersOnDemand extends LitElement {
  static get properties() {
    return { 
      query: { type: String },
      button: { type: String }
      // _url: { type: String } 
      // TODO: Add a boolean property
      // TODO: Add an array property
    };
  }
  constructor() {
    super();
    this.query = ''
    this.path = ''
    this._url = ''
    this.button = ''
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
  render() {
    return html`
      <style>
        :host {
          display: block
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
      </style>
      ${this.button
        ? html`<a href=${this.query} target="_blank">${this.button}</a>`
        : html`Could not resolve container`
      }
    `;
  }
}
customElements.define('containers-on-demand', ContainersOnDemand);