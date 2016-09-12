// import utils from './utils';
import * as _VARS from '../../config/vars.json';

export const VARS = _VARS;

/**
 * DOM Elements classname
 */
export const CLASSNAME = {
  container       : _VARS.namespace + _VARS.container,
  map             : _VARS.namespace + _VARS.map,
  overlay         : _VARS.namespace + _VARS.overlay,
  hidden          : _VARS.namespace + _VARS.hidden,
  collapsed       : _VARS.namespace + _VARS.collapsed,
  btn_absolute    : _VARS.namespace + _VARS.btn_absolute,
  OL_control      : _VARS.OL_control,
  OL_unselectable : _VARS.OL_unselectable
};

export const eventType = {
  /**
   * Triggered before context menu is openned.
   */
  BEFOREOPEN: 'beforeopen'
};

export const defaultOptions = {
  collapsed       : true,
  collapsible     : true,
  tipLabel        : 'Interactive overview map',
  label           : '\u00BB',
  collapseLabel   : '\u00AB'
};

export const OVERVIEWMAP_MAX_RATIO = 0.75;
export const OVERVIEWMAP_MIN_RATIO = 0.1;
