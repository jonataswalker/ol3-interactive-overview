import * as CONSTANTS from './constants';
// import utils from './utils';

/**
 * @class Html
 */
export class Html {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    this.Base = base;
    this.elements = {};
    this.Base.container = this.createContainer();
    return this;
  }

  createContainer() {
    const container = document.createElement('div');
    const map_el = document.createElement('div');
    const button = document.createElement('button');
    const label = document.createElement('span');
    const overlay_el = document.createElement('div');

    map_el.className = CONSTANTS.CLASSNAME.map;
    container.appendChild(map_el);

    overlay_el.className = CONSTANTS.CLASSNAME.overlay;
    overlay_el.style.boxSizing = 'border-box';

    label.textContent = '\u00BB';
    button.setAttribute('type', 'button');
    button.className = this.Base.options.collapsed ? '' : CONSTANTS.CLASSNAME.btn_absolute;
    button.title = this.Base.options.tipLabel;
    button.appendChild(label);
    container.appendChild(button);

    container.className = [
      CONSTANTS.CLASSNAME.container,
      this.Base.options.collapsed ? CONSTANTS.CLASSNAME.collapsed : '',
      CONSTANTS.CLASSNAME.OL_control,
      CONSTANTS.CLASSNAME.OL_unselectable
    ].join(' ');

    this.elements = {
      container: container,
      button: button,
      map_div: map_el,
      overlay_div: overlay_el
    };

    return container;
  }
}
