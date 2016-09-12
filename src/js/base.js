import { Internal } from './internal';
import { Html } from './html';
import utils from './utils';
import * as constants from './constants';

/**
 * @class Base
 * @extends {ol.control.Control}
 */
export default class Base extends ol.control.Control {
  /**
   * @constructor
   * @param {object|undefined} opt_options Options.
   */
  constructor(opt_options = {}) {
    utils.assert(typeof opt_options == 'object',
        '@param `opt_options` should be object type!');

    this.options = utils.mergeOptions(constants.defaultOptions, opt_options);

    Base.Html = new Html(this);
    Base.Internal = new Internal(this);

    super({
      element: this.container,
      render: this.render
    });
  }

  /**
   * Remove all elements from the menu.
   */
  clear() {
    Object.keys(Base.Internal.items).forEach(k => {
      Base.Html.removeMenuEntry(k);
    });
  }

  /**
   * Update the overview map element.
   * @param {ol.MapEvent} mapEvent Map event.
   * @this {Base}
   */
  render(mapEvent) {
    Base.Internal.validateExtent();
    Base.Internal.updateBox();
  }

  /**
   * Not supposed to be used on app.
   */
  setMap(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    if (map) {
      // let's start since now we have the map
      Base.Internal.init(map);
    } else {
      // I'm removed from the map - remove listeners
      // Base.Internal.removeListeners();
    }
  }
}
