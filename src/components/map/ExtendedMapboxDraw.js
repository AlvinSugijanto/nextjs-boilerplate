import MapboxDraw from "@mapbox/mapbox-gl-draw";

export class ExtendedMapboxDraw extends MapboxDraw {
  constructor(options) {
    super(options);

    this._customButtons = options.customButtons || [];
    this._parentOnAdd = this.onAdd.bind(this);

    // Override onAdd to inject custom buttons
    this.onAdd = (map) => {
      const container = this._parentOnAdd(map);
      this._container = container;

      // Add custom buttons after the default ones
      this._customButtons.forEach((buttonConfig) => {
        this._addCustomButton(buttonConfig);
      });

      return container;
    };
  }

  _addCustomButton(config) {
    if (!this._container) return;

    const button = document.createElement("button");
    button.className = "mapbox-gl-draw_ctrl-draw-btn";

    if (config.classes) {
      config.classes.forEach((cls) => button.classList.add(cls));
    }

    if (config.title) {
      button.title = config.title;
    }

    if (config.content) {
      button.appendChild(config.content);
    } else if (config.svg) {
      button.style.backgroundImage = `url("${config.svg}")`;
      button.style.backgroundSize = "18px 18px";
    }

    button.addEventListener("click", () => {
      if (config.action) {
        config.action(this);
      }
    });

    if (config.position !== undefined) {
      const children = Array.from(this._container.children);
      if (config.position < children.length) {
        this._container.insertBefore(button, children[config.position]);
      } else {
        this._container.appendChild(button);
      }
    } else {
      this._container.appendChild(button);
    }
  }
}
