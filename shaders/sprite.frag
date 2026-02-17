// Fragment shader for 2D sprite rendering
precision mediump float;

uniform sampler2D u_texture;
uniform bool u_useTexture;

varying vec2 v_texCoord;
varying vec4 v_color;

void main() {
    if (u_useTexture) {
        // Sample texture and multiply by vertex color
        vec4 texColor = texture2D(u_texture, v_texCoord);
        gl_FragColor = texColor * v_color;
    } else {
        // Use vertex color only (for shapes without textures)
        gl_FragColor = v_color;
    }
}
