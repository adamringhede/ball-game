
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { RgbNode, abs, rgb, select, standardMaterial, textureSampler2d, uniforms, varyingAttributes, vec2 } from "@hology/core/shader-nodes";
import { Color, Texture } from 'three';

export default class StripeShader extends NodeShader {
  @Parameter()
  color: Color = new Color(0x000000)

  @Parameter()
  map: Texture

  output(): NodeShaderOutput {

    const coord = varyingAttributes.uv.multiply(vec2(1,2))
    const color = this.map != null
      ? select<RgbNode>(abs(varyingAttributes.normal.y()).lt(0.8),
          textureSampler2d(this.map).sample(coord).rgb(),
          rgb(0xffffff))
      : rgb('#FFFFFF')

    return {
      alphaTest: 0,
      color: standardMaterial({color: color})
    }
  } 

}
