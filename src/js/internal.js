import * as CONSTANTS from './constants';
import utils from './utils';

/**
 * @class Internal
 */
export class Internal {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    this.Base = base;
    this.Html = base.constructor.Html;
    this.map = undefined;
    this.itv_map = undefined;
    return this;
  }

  init(map) {
    this.map = map;
    this.itv_map = new ol.Map({
      controls      : [],
      interactions  : [],
      target        : this.Html.elements.map_div,
      view          : this.Base.options.view
    });

    if (this.Base.options.layers) {
      this.Base.options.layers.forEach(function (layer) {
        this.itv_map.addLayer(layer);
      }, this);
    }

    this.overlay = new ol.Overlay({
      position    : this.map.getView().getCenter(),
      positioning : 'center-center',
      element     : this.Html.elements.overlay_div
    });
    this.itv_map.addOverlay(this.overlay);

    this.itv_map.updateSize();
    this.resetExtent();
    this.setListeners();
  }

  setListeners() {
    const this_ = this;
    const elements = this.Html.elements;
    const toggleCollapse = function (event) {
      event.preventDefault();
      if (utils.hasClass(elements.container, CONSTANTS.CLASSNAME.collapsed)) {
        utils.addClass(elements.button, CONSTANTS.CLASSNAME.btn_absolute);
      }
      utils.toggleClass(elements.container, CONSTANTS.CLASSNAME.collapsed);
    };
    const handleTransition = function (evt) {
      if (evt.propertyName === 'width' &&
          utils.hasClass(elements.container, CONSTANTS.CLASSNAME.collapsed)) {
        utils.removeClass(elements.button, CONSTANTS.CLASSNAME.btn_absolute);
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
      const
          // layers = this_.itv_map.getLayers(),
          // trying to guess the base layer to calculate extent
          // layer = layers.item(0),
          // layer_extent = layer.getExtent(),
          projection = this_.itv_map.getView().getProjection(),
          world_extent = projection.getWorldExtent();

      console.info(world_extent);

      function move(move_evt) {
        const coord = this_.itv_map.getEventCoordinate(move_evt),
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

  }

  /**
   * @param {number} rotation Target rotation.
   * @param {ol.Coordinate} coordinate Coordinate.
   * @return {ol.Coordinate|undefined} Coordinate for rotation and center anchor.
   */
  calculateCoordinateRotate(rotation, coordinate) {
    let coordinateRotate;
    const currentCenter = this.map.getView().getCenter();

    if (currentCenter) {
      coordinateRotate = [
        coordinate[0] - currentCenter[0],
        coordinate[1] - currentCenter[1]
      ];
      ol.coordinate.rotate(coordinateRotate, rotation);
      ol.coordinate.add(coordinateRotate, currentCenter);
    }
    return coordinateRotate;
  }

  /**
   * Set the center of the overview map to the map center without changing its
   * resolution.
   */
  recenter() {
    this.itv_map.getView().setCenter(this.map.getView().getCenter());
  }

  /**
   * Reset the overview map extent to half calculated min and max ratio times
   * the extent of the main map.
   */
  resetExtent() {
    if (CONSTANTS.OVERVIEWMAP_MAX_RATIO === 0 || CONSTANTS.OVERVIEWMAP_MIN_RATIO === 0) {
      return;
    }

    const extent = this.map.getView().calculateExtent(this.map.getSize());

    // get how many times the current map overview could hold different
    // box sizes using the min and max ratio, pick the step in the middle used
    // to calculate the extent from the main map to set it to the overview map,
    const steps = Math.log(
        CONSTANTS.OVERVIEWMAP_MAX_RATIO / CONSTANTS.OVERVIEWMAP_MIN_RATIO) / Math.LN2;
    const ratio = 1 / (Math.pow(2, steps / 2) * CONSTANTS.OVERVIEWMAP_MIN_RATIO);

    utils.scaleFromCenter(extent, ratio);
    this.itv_map.getView().fit(extent, this.itv_map.getSize());
  }

  /**
   * Update the box using the main map extent
   */
  updateBox() {
    if (!utils.isMapRendered(this.map) || !utils.isMapRendered(this.itv_map)) {
      return;
    }

    const view = this.map.getView(),
        extent = view.calculateExtent(this.map.getSize()),
        center = ol.extent.getCenter(extent),
        // set position using center coordinates
        rotateCenter = this.calculateCoordinateRotate(view.getRotation(), center);

    this.overlay.setPosition(rotateCenter);
  }

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
  validateExtent() {
    if (!utils.isMapRendered(this.map) || !utils.isMapRendered(this.itv_map)) {
      return;
    }

    let extent = this.map.getView().calculateExtent(this.map.getSize()),
        ovmapSize = this.itv_map.getSize(),
        ovextent = this.itv_map.getView().calculateExtent(ovmapSize),
        topLeftPixel = this.itv_map.getPixelFromCoordinate(ol.extent.getTopLeft(extent)),
        bottomRightPixel = this.itv_map.getPixelFromCoordinate(ol.extent.getBottomRight(extent)),
        boxWidth = Math.abs(topLeftPixel[0] - bottomRightPixel[0]),
        boxHeight = Math.abs(topLeftPixel[1] - bottomRightPixel[1]);

    if (boxWidth < ovmapSize[0] * CONSTANTS.OVERVIEWMAP_MIN_RATIO ||
        boxHeight < ovmapSize[1] * CONSTANTS.OVERVIEWMAP_MIN_RATIO ||
        boxWidth > ovmapSize[0] * CONSTANTS.OVERVIEWMAP_MAX_RATIO ||
        boxHeight > ovmapSize[1] * CONSTANTS.OVERVIEWMAP_MAX_RATIO) {
      this.resetExtent();
    } else if (!ol.extent.containsExtent(ovextent, extent)) {
      this.recenter();
    }
  }
}
