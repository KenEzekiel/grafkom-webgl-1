type UniformTypes =
  | `uniform${1 | 2 | 3 | 4}${"i" | "f"}${"v" | ""}`
  | `uniformMatrix${2 | 3 | 4}fv`;

export class Program<
  TAttribs extends Record<
    string,
    {
      size: number;
    }
  >,
  TUniforms extends Record<
    string,
    {
      type: UniformTypes;
      args?: any[];
    }
  >
> {
  public gl: WebGLRenderingContext;
  private attributes: Record<
    keyof TAttribs,
    {
      buffer: WebGLBuffer | null;
      location: number;
    }
  >;
  public get a() {
    return this.attributes;
  }

  private uniforms: {
    [K in keyof TUniforms]: {
      type: TUniforms[K]["type"];
      location: WebGLUniformLocation | null;
    };
  };

  public get u() {
    return this.uniforms;
  }

  public program: WebGLProgram;

  constructor({
    gl,
    fragmentShaderSource,
    vertexShaderSource,
    attributes,
    uniforms,
  }: {
    gl: WebGLRenderingContext;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    attributes: TAttribs;
    uniforms: TUniforms;
  }) {
    this.gl = gl;
    this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
    this.gl.useProgram(this.program);
    this.attributes = {} as typeof this.attributes;
    Object.entries(attributes).forEach(([attribName, obj]) => {
      const location = this.gl.getAttribLocation(
        this.program,
        "a_" + attribName
      );
      const buffer = this.gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, obj.size, gl.FLOAT, false, 0, 0);
      this.attributes[attribName as keyof TAttribs] = {
        buffer,
        location,
      };
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    });

    this.uniforms = {} as typeof this.uniforms;

    Object.entries(uniforms).forEach(([uniformName, obj]) => {
      const location = this.gl.getUniformLocation(
        this.program,
        "u_" + uniformName
      );
      if (obj.args) {
        (this.gl[obj.type as UniformTypes] as any)(location, ...obj.args);
      }
      this.uniforms[uniformName as keyof TUniforms] = {
        type: obj.type,
        location,
      };
    });
  }

  private createProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    const program = this.gl.createProgram()!;
    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(this.gl.getProgramInfoLog(program));
    this.gl.deleteProgram(program);
    throw new Error("Invalid to share program");
  }

  private createShader(type: number, source: string) {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(this.gl.getShaderInfoLog(shader));
    this.gl.deleteShader(shader);
    throw new Error("Failed to create shader");
  }

  public setUniforms(uniforms: {
    [K in keyof TUniforms]?: any[];
  }) {
    Object.entries(uniforms).forEach(([item, args]) => {
      if (!args) {
        return;
      }
      const uniform = this.uniforms[item];
      if (!uniform) {
        return;
      }
      (this.gl[uniform.type] as any)(uniform.location, ...args);
    });
  }

  public setAttributes(uniforms: {
    [K in keyof TUniforms]?: any[];
  }) {
    Object.entries(uniforms).forEach(([item, args]) => {
      if (!args) {
        return;
      }
      const uniform = this.uniforms[item];
      if (!uniform) {
        return;
      }
      (this.gl[uniform.type] as any)(uniform.location, ...args);
    });
  }
  bindBufferStaticDraw(targetBuffer: WebGLBuffer | null, bufferData: number[]) {
    if (!targetBuffer) {
      return;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, targetBuffer);

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(bufferData),
      this.gl.STATIC_DRAW
    );
  }
}
