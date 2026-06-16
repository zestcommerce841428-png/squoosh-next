declare module 'gifuct-js' {
  export interface ParsedFrame {
    dims: { top: number; left: number; width: number; height: number };
    patch: Uint8ClampedArray;
    delay: number;
    disposalType: number;
  }
  export interface ParsedGif {
    lsd: { width: number; height: number };
  }
  export function parseGIF(buffer: ArrayBuffer | Uint8Array): ParsedGif;
  export function decompressFrames(gif: ParsedGif, buildImagePatches: boolean): ParsedFrame[];
}

declare module 'utif' {
  interface IFD { width: number; height: number; [key: string]: unknown }
  const UTIF: {
    decode(buffer: ArrayBuffer | Uint8Array): IFD[];
    decodeImage(buffer: ArrayBuffer | Uint8Array, ifd: IFD): void;
    toRGBA8(ifd: IFD): Uint8Array;
  };
  export default UTIF;
}
