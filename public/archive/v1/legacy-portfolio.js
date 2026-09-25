/**
 * <legacy-portfolio-archive>
 *
 * Web component host for the nested classic root at /archive/v1/.
 *
 * jQuery / Bootstrap cannot be “innerHTML’d” into a shadow tree and still
 * work: scripts inserted that way never run, and even appendChild’d jQuery
 * queries `document`, not the shadow DOM. The correct pattern is to host the
 * classic page as its own document (same-origin) inside this element so the
 * old stack runs unchanged.
 */
(function () {
  if (customElements.get("legacy-portfolio-archive")) return;

  class LegacyPortfolioArchive extends HTMLElement {
    /** @type {ShadowRoot | null} */
    _root = null;

    connectedCallback() {
      if (this._root) return;

      this._root = this.attachShadow({ mode: "closed" });
      this.#render();
    }

    static get observedAttributes() {
      return ["src"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "src" && oldValue !== newValue && this._root) {
        this.#render();
      }
    }

    #render() {
      if (!this._root) return;

      // Classic page root (nested libs, images, jQuery) — not the live domain.
      const src = this.getAttribute("src") || "/archive/v1/index.html";

      this._root.innerHTML = `
        <style>
          :host {
            all: initial;
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: #f4f4f4;
            color-scheme: only light;
          }
          .frame {
            display: block;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: 0;
            background: #f4f4f4;
          }
        </style>
        <iframe
          class="frame"
          title="Classic aaronduchateau.com archive"
          src="${src.replace(/"/g, "&quot;")}"
        ></iframe>
      `;
    }
  }

  customElements.define("legacy-portfolio-archive", LegacyPortfolioArchive);
})();
