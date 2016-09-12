/**
 * Interactive Map Overview for OpenLayers 3
 * https://github.com/jonataswalker/ol3-interactive-overview
 * Version: v0.1.0
 * Built: 2016-09-12T13:25:51-03:00
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InteractiveOverview = factory());
}(this, (function () { 'use strict';

var namespace = "ol-itv-overview";
var container = "-container";
var map = "-map";
var overlay = "-overlay";
var hidden = "-hidden";
var collapsed = "-collapsed";
var btn_absolute = "-transitionend";
var OL_control = "ol-control";

var OL_unselectable = "ol-unselectable";

// import utils from './utils';


/**
 * DOM Elements classname
 */
var CLASSNAME = {
  container       : namespace + container,
  map             : namespace + map,
  overlay         : namespace + overlay,
  hidden          : namespace + hidden,
  collapsed       : namespace + collapsed,
  btn_absolute    : namespace + btn_absolute,
  OL_control      : OL_control,
  OL_unselectable : OL_unselectable
};



var defaultOptions = {
  collapsed       : true,
  collapsible     : true,
  tipLabel        : 'Interactive overview map',
  label           : '\u00BB',
  collapseLabel   : '\u00AB'
};

var OVERVIEWMAP_MAX_RATIO = 0.75;
var OVERVIEWMAP_MIN_RATIO = 0.1;

/**
 * @module utils
 * All the helper functions needed in this project
 */
var utils = {
  isNumeric: function isNumeric(str) {
    return /^\d+$/.test(str);
  },
  classRegex: function classRegex(classname) {
    return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  addClass: function addClass(element, classname, timeout) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.addClass(each, classname);
      });
      return;
    }

    var array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    var i = array.length;

    while (i--) {
      if (!this$1.hasClass(element, array[i])) {
        this$1._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass: function _addClass(el, klass, timeout) {
    var this$1 = this;

    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = (el.className + ' ' + klass).trim();
    }

    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(function () {
        this$1._removeClass(el, klass);
      }, timeout);
    }
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  removeClass: function removeClass(element, classname, timeout) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.removeClass(each, classname, timeout);
      });
      return;
    }

    var array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    var i = array.length;

    while (i--) {
      if (this$1.hasClass(element, array[i])) {
        this$1._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass: function _removeClass(el, klass, timeout) {
    var this$1 = this;

    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = (el.className.replace(this.classRegex(klass), ' ')).trim();
    }
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(function () {
        this$1._addClass(el, klass);
      }, timeout);
    }
  },
  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  hasClass: function hasClass(element, c) {
    // use native if available
    return (element.classList) ?
      element.classList.contains(c) : this.classRegex(c).test(element.className);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String} classname Classe.
   */
  toggleClass: function toggleClass(element, classname) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.toggleClass(each, classname);
      });
      return;
    }

    // use native if available
    if (element.classList) {
      element.classList.toggle(classname);
    } else {
      if (this.hasClass(element, classname)) {
        this._removeClass(element, classname);
      } else {
        this._addClass(element, classname);
      }
    }
  },
  $: function $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement: function isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' && obj.nodeType === 1 && !!obj.nodeName);
  },
  /**
   * Abstraction to querySelectorAll for increased
   * performance and greater usability
   * @param {String} selector
   * @param {Element} context (optional)
   * @param {Boolean} find_all (optional)
   * @return (find_all) {Element} : {Array}
   */
  find: function find(selector, context, find_all) {
    if ( context === void 0 ) context = window.document;

    var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = Array.prototype.slice,
        matches = [];

    // Redirect call to the more performant function
    // if it's a simple selector and return an array
    // for easier usage
    if (simpleRe.test(selector)) {
      switch (selector[0]) {
        case '#':
          matches = [this.$(selector.substr(1))];
          break;
        case '.':
          matches = slice.call(context.getElementsByClassName(
            selector.substr(1).replace(periodRe, ' ')));
          break;
        default:
          matches = slice.call(context.getElementsByTagName(selector));
      }
    } else {
      // If not a simple selector, query the DOM as usual
      // and return an array for easier usage
      matches = slice.call(context.querySelectorAll(selector));
    }

    return (find_all) ? matches : matches[0];
  },
  getAllChildren: function getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  },
  isEmpty: function isEmpty(str) {
    return (!str || 0 === str.length);
  },
  emptyArray: function emptyArray(array) {
    while (array.length) array.pop();
  },
  removeAllChildren: function removeAllChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },
  /**
   * Overwrites obj1's values with obj2's and adds
   * obj2's if non existent in obj1
   * @returns obj3 a new object based on obj1 and obj2
   */
  mergeOptions: function mergeOptions(obj1, obj2) {
    var obj3 = {};
    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  createFragment: function createFragment(html) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
      frag.appendChild(temp.firstChild);
    }
    return frag;
  },
  /**
   * Does str contain test?
   * @param {String} str_test
   * @param {String} str
   * @returns Boolean
   */
  contains: function contains(str_test, str) {
    return !!~str.indexOf(str_test);
  },
  isDefAndNotNull: function isDefAndNotNull(val) {
    // Note that undefined == null.
    return val != null; // eslint-disable-line no-eq-null
  },
  assertEqual: function assertEqual(a, b, message) {
    if (a !== b) {
      throw new Error(message + ' mismatch: ' + a + ' != ' + b);
    }
  },
  assert: function assert(condition, message) {
    if ( message === void 0 ) message = 'Assertion failed';

    if (!condition) {
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  },
  /**
   * @param {ol.Extent} extent Extent.
   * @param {number} value Value.
   */
  scaleFromCenter: function scaleFromCenter(extent, value) {
    var deltaX = ((extent[2] - extent[0]) / 2) * (value - 1);
    var deltaY = ((extent[3] - extent[1]) / 2) * (value - 1);
    extent[0] -= deltaX;
    extent[2] += deltaX;
    extent[1] -= deltaY;
    extent[3] += deltaY;
  },
  isMapRendered: function isMapRendered(map) {
    // since ol.Map.prototype.isRendered is private
    return !!map.getPixelFromCoordinate([0, 0]);
  }
};

/**
 * @class Internal
 */
var Internal = function Internal(base) {
  this.Base = base;
  this.Html = base.constructor.Html;
  this.map = undefined;
  this.itv_map = undefined;
  return this;
};

Internal.prototype.init = function init (map) {
  this.map = map;
  this.itv_map = new ol.Map({
    controls    : [],
    interactions: [],
    target      : this.Html.elements.map_div,
    view        : this.Base.options.view
  });

  if (this.Base.options.layers) {
    this.Base.options.layers.forEach(function (layer) {
      this.itv_map.addLayer(layer);
    }, this);
  }

  this.overlay = new ol.Overlay({
    position  : this.map.getView().getCenter(),
    positioning : 'center-center',
    element   : this.Html.elements.overlay_div
  });
  this.itv_map.addOverlay(this.overlay);

  this.itv_map.updateSize();
  this.resetExtent();
  this.setListeners();
};

Internal.prototype.setListeners = function setListeners () {
  var this_ = this;
  var elements = this.Html.elements;
  var toggleCollapse = function (event) {
    event.preventDefault();
    if (utils.hasClass(elements.container, CLASSNAME.collapsed)) {
      utils.addClass(elements.button, CLASSNAME.btn_absolute);
    }
    utils.toggleClass(elements.container, CLASSNAME.collapsed);
  };
  var handleTransition = function (evt) {
    if (evt.propertyName === 'width' &&
        utils.hasClass(elements.container, CLASSNAME.collapsed)) {
      utils.removeClass(elements.button, CLASSNAME.btn_absolute);
    }
  };

  elements.button.addEventListener('touchend', function (ev) {
    ev.preventDefault();
    ev.target.click();
  }, false);

  elements.button.addEventListener('click', toggleCollapse, false);
  elements.map_div.addEventListener('transitionend', handleTransition, false);

  this.itv_map.once('postrender', function () {
    this.updateBox();
  }, this);

  // dragging overview overlay
  elements.overlay_div.addEventListener('mousedown', function () {
    var
        // layers = this_.itv_map.getLayers(),
        // trying to guess the base layer to calculate extent
        // layer = layers.item(0),
        // layer_extent = layer.getExtent(),
        projection = this_.itv_map.getView().getProjection(),
        world_extent = projection.getWorldExtent();

    console.info(world_extent);

    function move(move_evt) {
      var coord = this_.itv_map.getEventCoordinate(move_evt),
          coord_4326 = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326'),
          // pixel = this_.itv_map.getEventPixel(move_evt),
          // map_size = this_.itv_map.getSize(),
          // map_extent = [0, 0, map_size[0], map_size[1]],
          // view_extent = this_.itv_map.getView().calculateExtent(this_.itv_map.getSize()),
          inside = ol.extent.containsCoordinate(world_extent, coord_4326);

      if (inside) {
        this_.overlay.setPosition(coord);
        this_.map.getView().setCenter(coord);
      }

      console.info(coord_4326);
      console.info('inside', inside);
    }
    function end() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  });

  // bind map view

};

/**
 * @param {number} rotation Target rotation.
 * @param {ol.Coordinate} coordinate Coordinate.
 * @return {ol.Coordinate|undefined} Coordinate for rotation and center anchor.
 */
Internal.prototype.calculateCoordinateRotate = function calculateCoordinateRotate (rotation, coordinate) {
  var coordinateRotate;
  var currentCenter = this.map.getView().getCenter();

  if (currentCenter) {
    coordinateRotate = [
      coordinate[0] - currentCenter[0],
      coordinate[1] - currentCenter[1]
    ];
    ol.coordinate.rotate(coordinateRotate, rotation);
    ol.coordinate.add(coordinateRotate, currentCenter);
  }
  return coordinateRotate;
};

/**
 * Set the center of the overview map to the map center without changing its
 * resolution.
 */
Internal.prototype.recenter = function recenter () {
  this.itv_map.getView().setCenter(this.map.getView().getCenter());
};

/**
 * Reset the overview map extent to half calculated min and max ratio times
 * the extent of the main map.
 */
Internal.prototype.resetExtent = function resetExtent () {
  if (OVERVIEWMAP_MAX_RATIO === 0 || OVERVIEWMAP_MIN_RATIO === 0) {
    return;
  }

  var extent = this.map.getView().calculateExtent(this.map.getSize());

  // get how many times the current map overview could hold different
  // box sizes using the min and max ratio, pick the step in the middle used
  // to calculate the extent from the main map to set it to the overview map,
  var steps = Math.log(
      OVERVIEWMAP_MAX_RATIO / OVERVIEWMAP_MIN_RATIO) / Math.LN2;
  var ratio = 1 / (Math.pow(2, steps / 2) * OVERVIEWMAP_MIN_RATIO);

  utils.scaleFromCenter(extent, ratio);
  this.itv_map.getView().fit(extent, this.itv_map.getSize());
};

/**
 * Update the box using the main map extent
 */
Internal.prototype.updateBox = function updateBox () {
  if (!utils.isMapRendered(this.map) || !utils.isMapRendered(this.itv_map)) {
    return;
  }

  var view = this.map.getView(),
      extent = view.calculateExtent(this.map.getSize()),
      center = ol.extent.getCenter(extent),
      // set position using center coordinates
      rotateCenter = this.calculateCoordinateRotate(view.getRotation(), center);

  this.overlay.setPosition(rotateCenter);
};

/**
 * Reset the overview map extent if the box size (width or
 * height) is less than the size of the overview map size times minRatio
 * or is greater than the size of the overview size times maxRatio.
 *
 * If the map extent was not reset, the box size can fits in the defined
 * ratio sizes. This method then checks if is contained inside the overview
 * map current extent. If not, recenter the overview map to the current
 * main map center location.
 */
Internal.prototype.validateExtent = function validateExtent () {
  if (!utils.isMapRendered(this.map) || !utils.isMapRendered(this.itv_map)) {
    return;
  }

  var extent = this.map.getView().calculateExtent(this.map.getSize()),
      ovmapSize = this.itv_map.getSize(),
      ovextent = this.itv_map.getView().calculateExtent(ovmapSize),
      topLeftPixel = this.itv_map.getPixelFromCoordinate(ol.extent.getTopLeft(extent)),
      bottomRightPixel = this.itv_map.getPixelFromCoordinate(ol.extent.getBottomRight(extent)),
      boxWidth = Math.abs(topLeftPixel[0] - bottomRightPixel[0]),
      boxHeight = Math.abs(topLeftPixel[1] - bottomRightPixel[1]);

  if (boxWidth < ovmapSize[0] * OVERVIEWMAP_MIN_RATIO ||
      boxHeight < ovmapSize[1] * OVERVIEWMAP_MIN_RATIO ||
      boxWidth > ovmapSize[0] * OVERVIEWMAP_MAX_RATIO ||
      boxHeight > ovmapSize[1] * OVERVIEWMAP_MAX_RATIO) {
    this.resetExtent();
  } else if (!ol.extent.containsExtent(ovextent, extent)) {
    this.recenter();
  }
};

// import utils from './utils';

/**
 * @class Html
 */
var Html = function Html(base) {
  this.Base = base;
  this.elements = {};
  this.Base.container = this.createContainer();
  return this;
};

Html.prototype.createContainer = function createContainer () {
  var container = document.createElement('div');
  var map_el = document.createElement('div');
  var button = document.createElement('button');
  var label = document.createElement('span');
  var overlay_el = document.createElement('div');

  map_el.className = CLASSNAME.map;
  container.appendChild(map_el);

  overlay_el.className = CLASSNAME.overlay;
  overlay_el.style.boxSizing = 'border-box';

  label.textContent = '\u00BB';
  button.setAttribute('type', 'button');
  button.className = this.Base.options.collapsed ? '' : CLASSNAME.btn_absolute;
  button.title = this.Base.options.tipLabel;
  button.appendChild(label);
  container.appendChild(button);

  container.className = [
    CLASSNAME.container,
    this.Base.options.collapsed ? CLASSNAME.collapsed : '',
    CLASSNAME.OL_control,
    CLASSNAME.OL_unselectable
  ].join(' ');

  this.elements = {
    container: container,
    button: button,
    map_div: map_el,
    overlay_div: overlay_el
  };

  return container;
};

/**
 * @class Base
 * @extends {ol.control.Control}
 */
var Base = (function (superclass) {
  function Base(opt_options) {
    if ( opt_options === void 0 ) opt_options = {};

    utils.assert(typeof opt_options == 'object',
        '@param `opt_options` should be object type!');

    this.options = utils.mergeOptions(defaultOptions, opt_options);

    Base.Html = new Html(this);
    Base.Internal = new Internal(this);

    superclass.call(this, {
      element: this.container,
      render: this.render
    });
  }

  if ( superclass ) Base.__proto__ = superclass;
  Base.prototype = Object.create( superclass && superclass.prototype );
  Base.prototype.constructor = Base;

  /**
   * Remove all elements from the menu.
   */
  Base.prototype.clear = function clear () {
    Object.keys(Base.Internal.items).forEach(function (k) {
      Base.Html.removeMenuEntry(k);
    });
  };

  /**
   * Update the overview map element.
   * @param {ol.MapEvent} mapEvent Map event.
   * @this {Base}
   */
  Base.prototype.render = function render (mapEvent) {
    Base.Internal.validateExtent();
    Base.Internal.updateBox();
  };

  /**
   * Not supposed to be used on app.
   */
  Base.prototype.setMap = function setMap (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    if (map) {
      // let's start since now we have the map
      Base.Internal.init(map);
    } else {
      // I'm removed from the map - remove listeners
      // Base.Internal.removeListeners();
    }
  };

  return Base;
}(ol.control.Control));

return Base;

})));