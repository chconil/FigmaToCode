import { AltBlendMixin } from "../../altNodes/altMixins";
import { AltLayoutMixin, AltSceneNode } from "../../altNodes/altMixins";
import { numToAutoFixed } from "../../common/numToAutoFixed";
import { objectName } from "./lvglObjectName";

/**
 * https://tailwindcss.com/docs/opacity/
 * default is [0, 25, 50, 75, 100], but '100' will be ignored:
 * if opacity was changed, let it be visible. Therefore, 98% => 75
 * node.opacity is between [0, 1]; output will be [0, 100]
 */
export const lvglOpacity = (node: AltSceneNode, isJsx: boolean): string => {
  // [when testing] node.opacity can be undefined
  if (node.opacity !== undefined && node.opacity !== 1) {
     return  "\n    lv_style_set_bg_opa(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_OPA_"+numToAutoFixed(node.opacity)+");";
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/visibility/
 * example: invisible
 */
export const lvglVisibility = (node: AltSceneNode, isJsx: boolean): string => {
  // [when testing] node.visible can be undefined

  // When something is invisible in Figma, it isn't gone. Groups can make use of it.
  // Therefore, instead of changing the visibility (which causes bugs in nested divs),
  // this plugin is going to ignore color and stroke
  if (node.visible !== undefined && !node.visible) {    
	return  "\n    lv_style_set_bg_opa(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_OPA_0);";
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/rotate/
 * default is [-180, -90, -45, 0, 45, 90, 180], but '0' will be ignored:
 * if rotation was changed, let it be perceived. Therefore, 1 => 45
 */
export const lvglRotation = (node: AltSceneNode, isJsx: boolean): string => {
  // that's how you convert angles to clockwise radians: angle * -pi/180
  // using 3.14159 as Pi for enough precision and to avoid importing math lib.
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
	return  "\n    lv_arc_set_rotation("+objectName(node.id)+", 0, "+numToAutoFixed(node.rotation)+")); // Functionnalty to be developped";
  }
  return "";
};
