import { lvglShadow } from "./builderImpl/lvglShadow";
import {
  AltSceneNode,
  AltGeometryMixin,
  AltBlendMixin,
  AltFrameMixin,
  AltDefaultShapeMixin,
} from "../altNodes/altMixins";
import {
  lvglVisibility,
  lvglRotation,
  lvglOpacity,
} from "./builderImpl/lvglBlend";
import { lvglPosition } from "./builderImpl/lvglPosition";
import { lvglColorFromFills, lvglGradientFromFills } from "./builderImpl/lvglColor";
import { lvglPadding } from "./builderImpl/lvglPadding";
import { formatWithJSX } from "../common/parseJSX";
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
        this.style += formatWithJSX("border", this.isJSX, `${weight}px solid`);

        // Gradient requires these.
        this.style += formatWithJSX("border-image-slice", this.isJSX, 1);
        this.style += formatWithJSX(          "border-image-source",          this.isJSX,          fill.prop        );
      } else {
        const border = `${weight}px solid ${fill.prop}`;

        // use "2px solid white" instead of splitting into three properties.
        // This pattern seems more common than using border, borderColor and borderWidth.
        this.style += formatWithJSX("border", this.isJSX, border);
      }
    }

    return this;
  }

  position(node: AltSceneNode, parentId: string): this {
    const position = lvglPosition(node, parentId);

    if (position === "absoluteManualLayout" && node.parent) {
      // tailwind can't deal with absolute layouts.

      const [parentX, parentY] = parentCoordinates(node.parent);

      const left = node.x - parentX;
      const top = node.y - parentY;

      this.style += "\n    lv_obj_set_pos("+parentId+","+ left + ","+ top + ");\n";
    } else {
      this.style += position;
    }

    return this;
  }

  customColor(
    paintArray: ReadonlyArray<Paint> | PluginAPI["mixed"],
    property: "text" | "background-color", parentId: string
  ): this {
    const fill = this.retrieveFill(paintArray);
    if (fill.kind === "solid") {
      if (property === "background-color") {
		 this.style += "\n    lv_style_set_bg_color("+parentId+",LV_STATE_DEFAULT,"+ fill.prop + ");\n";
      } else if (property === "text") {
		 this.style += "\n    lv_style_set_text_color("+parentId+",LV_STATE_DEFAULT,"+ fill.prop + ");\n";
	  }
    } else if (fill.kind === "gradient") {
		
	  this.style += "\n    lv_style_set_bg_grad_color("+parentId+",LV_STATE_DEFAULT,"+ fill.prop + ");\n";
	  this.style += "\n    lv_style_set_bg_grad_dir("+parentId+",LV_STATE_DEFAULT,LV_GRAD_DIR_VER);\n";
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

  shadow(node: AltBlendMixin): this {
    const shadow = lvglShadow(node);
    if (shadow) {
      this.style += formatWithJSX("box-shadow", this.isJSX, lvglShadow(node));
    }
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
	this.style += "\n    lv_obj_set_size("+parentId+","+ partial[0] + ","+ partial[1] + ");\n";
    return this;
  }

  autoLayoutPadding(node: AltFrameMixin | AltDefaultShapeMixin): this {
    this.style += lvglPadding(node, this.isJSX);
    return this;
  }

  removeTrailingSpace(): this {
    if (this.style.length > 0 && this.style.slice(-1) === " ") {
      this.style = this.style.slice(0, -1);
    }
    return this;
  }

  build(additionalStyle: string = ""): string {
    this.style += additionalStyle;
    this.removeTrailingSpace();

    if (this.style) {
      if (this.isJSX) {
        this.style = ` style={{${this.style}}}`;
      } else {
        this.style = ` style="${this.style}"`;
      }
    }
    if (this.name.length > 0) {
      const classOrClassName = this.isJSX ? "className" : "class";
      return ` ${classOrClassName}="${this.name}"${this.style}`;
    } else {
      return this.style;
    }
  }
}
