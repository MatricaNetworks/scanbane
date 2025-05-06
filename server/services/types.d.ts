// Type definitions for third-party libraries without @types

declare module 'virustotal-api' {
  class VirusTotal {
    constructor(apiKey: string);
    urlLookup(url: string, callback: (error: Error | null, result: any) => void): void;
    fileLookup(resource: string, callback: (error: Error | null, result: any) => void): void;
    urlScan(url: string, callback: (error: Error | null, result: any) => void): void;
    fileReport(resource: string, callback: (error: Error | null, result: any) => void): void;
    fileUpload(filePath: string, callback: (error: Error | null, result: any) => void): void;
  }
  export = VirusTotal;
}

declare module 'whois' {
  function lookup(domain: string, callback: (error: Error | null, data: string) => void): void;
  export = lookup;
}

declare module 'stegjs' {
  export function encode(data: Buffer, message: string, password?: string): Buffer;
  export function decode(data: Buffer, password?: string): string;
}

declare module 'apktool' {
  export function decode(apkPath: string, outputPath: string): Promise<void>;
  export function build(inputDir: string, outputApk: string): Promise<void>;
}

// Extend WebSocket to include OPEN state
interface WebSocket {
  OPEN: number;
  readyState: number;
  send(data: string): void;
}