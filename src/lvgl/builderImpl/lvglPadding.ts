import { numToAutoFixed } from "../../common/numToAutoFixed";
import { AltFrameMixin, AltDefaultShapeMixin,AltSceneNode,AltFrameNode,AltRectangleNode,AltEllipseNode } from "../../altNodes/altMixins";
import { commonPadding } from "../../common/commonPadding";
import { objectName } from "./lvglObjectName";
/**
 * https://tailwindcss.com/docs/margin/
 * example: px-2 py-8
 */
export const lvglPadding = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  isJsx: boolean
): string => {
  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }


  let paddingString="";

  if ("all" in padding) {
	paddingString+="\n    //Full pading of "+padding.all;
	paddingString+="\n    lv_obj_set_width_fit("+objectName(node.id)+",lv_obj_get_width_fit()-"+ (padding.all*2)+");";
	paddingString+="\n    lv_obj_set_height_fit("+objectName(node.id)+",lv_obj_get_height_fit()-"+ (padding.all*2)+");";
	paddingString+="\n    lv_obj_set_pos("+objectName(node.id)+",lv_obj_get_x("+objectName(node.id)+")"+padding.all+ ",lv_obj_get_y("+objectName(node.id)+")"+padding.all+ ");";
    return paddingString;
  }


  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
	paddingString+="\n    //Horizontal pading of "+padding.horizontal;
	paddingString+="\n    lv_obj_set_width_fit("+objectName(node.id)+",lv_obj_get_width_fit()-"+ (padding.horizontal*2)+");";
	paddingString+="\n    lv_obj_set_x("+objectName(node.id)+",lv_obj_get_x("+objectName(node.id)+")"+padding.horizontal+ ");";

  }
  if (padding.vertical) {
	paddingString+="\n    //Vertical pading of "+padding.vertical;
	paddingString+="\n    lv_obj_set_height_fit("+objectName(node.id)+",lv_obj_get_height_fit()-"+ (padding.vertical*2)+");";
	paddingString+="\n    lv_obj_set_y("+objectName(node.id)+",lv_obj_get_y("+objectName(node.id)+")+"+padding.vertical+ ");";
  }
  if (padding.top) {
	paddingString+="\n    //Top pading of "+padding.top;
	paddingString+="\n    lv_obj_set_height_fit("+objectName(node.id)+",lv_obj_get_height_fit()-"+ (padding.top)+");";
	paddingString+="\n    lv_obj_set_y("+objectName(node.id)+",lv_obj_get_y("+objectName(node.id)+")+"+padding.top +");";
  }
  if (padding.bottom) {
	paddingString+="\n    //Bottom pading of "+padding.bottom;
	paddingString+="\n    lv_obj_set_height_fit("+objectName(node.id)+",lv_obj_get_height_fit()-"+ (padding.bottom)+");";
  }
  if (padding.left) {
	paddingString+="\n    //Left pading of "+padding.left;
	paddingString+="\n    lv_obj_set_width_fit("+objectName(node.id)+",lv_obj_get_width_fit()-"+ (padding.left)+");";
	paddingString+="\n    lv_obj_set_x("+objectName(node.id)+",lv_obj_get_x("+objectName(node.id)+")+"+padding.left +");";

  }
  if (padding.right) {
	paddingString+="\n    //Right pading of "+padding.right;
	paddingString+="\n    lv_obj_set_width_fit("+objectName(node.id)+",lv_obj_get_width_fit()-"+ (padding.right)+");";
  }
  if(paddingString != ""){
	paddingString+="\n";
  }
  // todo use REM

  return paddingString;
};
