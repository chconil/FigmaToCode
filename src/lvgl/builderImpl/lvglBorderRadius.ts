import { AltSceneNode } from "../../altNodes/altMixins";
import { objectName } from "./lvglObjectName";
/**
 * https://tailwindcss.com/docs/border-radius/
 * example: rounded-sm
 * example: rounded-tr-lg
 */
export const lvglBorderRadius = (
  node: AltSceneNode,
  isJsx: boolean
): string => {
  if (node.type === "ELLIPSE") {
    return  "\n    lv_style_set_radius(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, 9999);";
  } else if (
    (!("cornerRadius" in node) && !("topLeftRadius" in node)) ||
    (node.cornerRadius === figma.mixed && node.topLeftRadius === undefined) ||
    node.cornerRadius === 0
  ) {
    // the second condition is used on tests. On Figma, topLeftRadius is never undefined.
    // ignore when 0, undefined or non existent
    return "";
  }

  let comp = "";

  if (node.cornerRadius !== figma.mixed) {
	 comp +=  "\n    lv_style_set_radius(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+node.cornerRadius+");";
  } else {
    // todo optimize for tr/tl/br/bl instead of t/r/l/b
    if (node.topLeftRadius !== 0) {	
	 comp +=  "\n    lv_style_set_radius(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+node.topLeftRadius+"); // WARNING: topLeftRadius not supported ";
    }
    if (node.topRightRadius !== 0) {
	 comp +=  "\n    lv_style_set_radius(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+node.topRightRadius+"); // WARNING: topRightRadius not supported ";
    }
    if (node.bottomLeftRadius !== 0) {
	  comp +=  "\n    lv_style_set_radius(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+node.bottomLeftRadius+"); // WARNING: bottomLeftRadius not supported ";
    }
    if (node.bottomRightRadius !== 0) {
	 comp +=  "\n    lv_style_set_radius(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+node.bottomRightRadius+"); // WARNING: bottomRightRadius not supported ";
    }
  }

  return comp;
};
