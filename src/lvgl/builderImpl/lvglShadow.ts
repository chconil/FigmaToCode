import { lvglColor } from "./lvglColor";
import { AltSceneNode } from "../../altNodes/altMixins";
import { objectName } from "./lvglObjectName";
/**
 * https://tailwindcss.com/docs/box-shadow/
 * example: shadow
 */
export const lvglShadow = (node: AltSceneNode): string => {
  // [when testing] node.effects can be undefined
  if (node.effects && node.effects.length > 0) {
    const dropShadow = node.effects.filter(
      (d): d is ShadowEffect =>
        (d.type === "DROP_SHADOW" || d.type === "INNER_SHADOW") &&
        d.visible !== false
    );
    // simple shadow from tailwind
    if (dropShadow.length > 0) {
      const shadow = dropShadow[0];

	  var style = "\n    lv_style_set_shadow_spread(&style_"+objectName(node.id)+",LV_STATE_DEFAULT,"+ shadow.spread + ");";
    style += "\n    lv_style_set_shadow_width(&style_"+objectName(node.id)+", LV_STATE_DEFAULT,"+ shadow.radius + ");";
    style += "\n    lv_style_set_shadow_color(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+lvglColor(shadow.color, shadow.color.a)+");";
    style += "\n    lv_style_set_shadow_ofs_x(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+shadow.offset.x+");";
    style += "\n    lv_style_set_shadow_ofs_y(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+shadow.offset.y+");";

      return style;
    }
  }
  return "";
};
