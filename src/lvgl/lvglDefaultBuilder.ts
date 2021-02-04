import { lvglShadow } from "./builderImpl/lvglShadow";
import {
  AltSceneNode,
  AltGeometryMixin,
  AltBlendMixin,
  AltFrameMixin,
  AltDefaultShapeMixin,
  AltFrameNode,AltRectangleNode,AltEllipseNode 
} from "../altNodes/altMixins";
import {
  lvglVisibility,
  lvglRotation,
  lvglOpacity,
} from "./builderImpl/lvglBlend";

import { lvglColorFromFills, lvglGradientFromFills } from "./builderImpl/lvglColor";
import { lvglPadding } from "./builderImpl/lvglPadding";
import { objectName } from "./builderImpl/lvglObjectName";
import { parentCoordinates } from "../common/parentCoordinates";
import { lvglSize, lvglSizePartial } from "./builderImpl/lvglSize";

export class LvglDefaultBuilder {
  style: string;
  isJSX: boolean;
  visible: boolean;
  name: string = "";
  hasFixedSize = false;

  constructor(node: AltSceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.style = "";
    this.visible = node.visible;

    if (showLayerName) {
      this.name = node.name.replace(" ", "");
    }
  }

  blend(node: AltSceneNode, parentId: string): this {
    this.style += lvglVisibility(node, this.isJSX);
    this.style += lvglRotation(node, this.isJSX);
    this.style += lvglOpacity(node, this.isJSX);

    return this;
  }

  border(node: AltGeometryMixin & AltSceneNode): this {
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight > 0) {
      const fill = this.retrieveFill(node.strokes);
      const weight = node.strokeWeight;

      if (fill.kind === "gradient") {
		  this.style += "\n    // Warning, gradient border not supported";
      }
	  this.style += "\n    lv_style_set_border_color(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+fill.prop+"); ";
	  this.style += "\n    lv_style_set_border_width(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+weight+");"; 
    }
    return this;
  }

  position(node: AltSceneNode, parentId: string): this {
     if (node.parent && node.parent.isRelative === true) {
      // tailwind can't deal with absolute layouts.

      const [parentX, parentY] = parentCoordinates(node.parent);

      const left = node.x - parentX;
      const top = node.y - parentY;
	  
      this.style += "\n    lv_obj_set_pos("+objectName(node.id)+","+ left + ","+ top + ");";
    } 

    return this;
  }

  customColor(node: AltSceneNode,
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background-color", parentId: string
  ): this {
    const fill = this.retrieveFill(paintArray);
    if (fill.kind === "solid") {
      if (property === "background-color") {
		 this.style += "\n    lv_style_set_bg_color(&style_"+objectName(node.id)+",LV_STATE_DEFAULT,"+ fill.prop + ");";
      } else if (property === "text") {
		 this.style += "\n    lv_style_set_text_color(&style_"+objectName(node.id)+",LV_STATE_DEFAULT,"+ fill.prop + ");";
	  }
    } else if (fill.kind === "gradient") {
		
	  this.style += "\n    lv_style_set_bg_grad_color(&style_"+objectName(node.id)+",LV_STATE_DEFAULT,"+ fill.prop + ");";
	  this.style += "\n    lv_style_set_bg_grad_dir(&style_"+objectName(node.id)+",LV_STATE_DEFAULT,LV_GRAD_DIR_VER);";
    }

    return this;
  }

  retrieveFill = (
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"]
  ): { prop: string; kind: "solid" | "gradient" | "none" } => {
    // visible is true or undefinied (tests)
    if (this.visible !== false) {
      const gradient = lvglGradientFromFills(paintArray);
      if (gradient) {
        return { prop: gradient, kind: "gradient" };
      } else {
        const color = lvglColorFromFills(paintArray);
        if (color) {
          return { prop: color, kind: "solid" };
        }
      }
    }
    return { prop: "", kind: "none" };
  };

  shadow(node: AltSceneNode): this {
    const shadow = lvglShadow(node);
	this.style += shadow;

    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  widthHeight(node: AltSceneNode, parentId: string): this {
    // if current element is relative (therefore, children are absolute)
    // or current element is one of the absoltue children and has a width or height > w/h-64

     const partial = lvglSizePartial(node, this.isJSX);
    if ("isRelative" in node && node.isRelative === true) {
      //
    } else {
      this.hasFixedSize = partial[0] !== "" && partial[1] !== "";
    }
	if( partial[0] == ""){
		this.style += "\n    lv_obj_set_height("+objectName(node.id)+","+ partial[1] + ");";
	} else if  (partial[1] == ""){
		this.style += "\n    lv_obj_set_width("+objectName(node.id)+","+ partial[0]+ ");";
	} else {
		this.style += "\n    lv_obj_set_size("+objectName(node.id)+","+ partial[0] + ","+ partial[1] + ");";
	}
    return this;
  }

  autoLayoutPadding(node: AltFrameNode | AltRectangleNode | AltEllipseNode): this {
    this.style += lvglPadding(node, this.isJSX);
    return this;
  }

  removeTrailingSpace(): this {
    if (this.style.length > 0 && this.style.slice(-1) === " ") {
      this.style = this.style.slice(0, -1);
    }
    return this;
  }

  build(node: AltSceneNode, additionalStyle: string = ""): string {
    this.style += additionalStyle;
    this.removeTrailingSpace();
	if(this.style.includes("style_")){
		this.style="\nlv_style_t style_"+objectName(node.id)+";"+
		"\n    lv_style_init(&style_"+objectName(node.id)+");"+this.style+
		"\n    lv_obj_reset_style_list("+objectName(node.id)+", LV_BTN_PART_MAIN);"+         
		"\n    lv_obj_add_style("+objectName(node.id)+", LV_BTN_PART_MAIN, &style_"+objectName(node.id)+");";
	}
    if (this.name.length > 0) {
      const classOrClassName = this.isJSX ? "className" : "class";

      return ` ${classOrClassName}="${this.name}"${this.style}`;
    } else {
      return this.style;
    }
  }
}
