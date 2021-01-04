// deno-lint-ignore-file
import EventEmitter, { GenericFunction } from "./events.ts";
import nodeProcess from "./process.ts";
import stream from "./stream.ts";
import assert from "./assert.ts";
import {
  ERR_INVALID_ADDRESS_FAMILY,
  ERR_INVALID_ARG_TYPE,
  // TODO(jopemachine): Need to add below error type
  // ERR_INVALID_ARG_VALUE,
  ERR_INVALID_FD_TYPE,
  ERR_INVALID_IP_ADDRESS,
  ERR_SERVER_ALREADY_LISTEN,
  ERR_SERVER_NOT_RUNNING,
  ERR_SOCKET_CLOSED,
  ERR_MISSING_ARGS,
} from "./_errors.ts";

import { clearTimeout } from "./timers.ts"
import { DenoStdInternalError } from "../_util/assert.ts";
import { notImplemented } from "./_utils.ts";
import { Buffer } from "./buffer.ts";

const DEFAULT_IPV4_ADDR = "0.0.0.0";
const DEFAULT_IPV6_ADDR = "::";

const isWindows = nodeProcess.platform === "win32";

function noop() {}

interface AddressInfo {
  address: string;
  family: string;
  port: number;
}

interface ListenOptions {
  port?: number;
  host?: string;
  backlog?: number;
  path?: string;
  exclusive?: boolean;
  readableAll?: boolean;
  writableAll?: boolean;
  /**
   * @default false
   */
  ipv6Only?: boolean;
}

interface SocketConstructorOpts {
  fd?: number;
  allowHalfOpen?: boolean;
  readable?: boolean;
  writable?: boolean;
}

interface OnReadOpts {
  buffer: Uint8Array | (() => Uint8Array);
  /**
   * This function is called for every chunk of incoming data.
   * Two arguments are passed to it: the number of bytes written to buffer and a reference to buffer.
   * Return false from this function to implicitly pause() the socket.
   */
  callback(bytesWritten: number, buf: Uint8Array): boolean;
}

interface ConnectOpts {
  /**
   * If specified, incoming data is stored in a single buffer and passed to the supplied callback when data arrives on the socket.
   * Note: this will cause the streaming functionality to not provide any data, however events like 'error', 'end', and 'close' will
   * still be emitted as normal and methods like pause() and resume() will also behave as expected.
   */
  onread?: OnReadOpts;
}

interface TcpSocketConnectOpts extends ConnectOpts {
  port: number;
  host?: string;
  localAddress?: string;
  localPort?: number;
  hints?: number;
  family?: number;

  // TODO(jopemachine): Need to implement 'dns' module first
  // lookup?: LookupFunction;
}

interface IpcSocketConnectOpts extends ConnectOpts {
  path: string;
}

type SocketConnectOpts = TcpSocketConnectOpts | IpcSocketConnectOpts;

const kBytesRead = Symbol("kBytesRead");
const kBytesWritten = Symbol("kBytesWritten");
const kSetNoDelay = Symbol("kSetNoDelay");

export class Socket extends stream.Duplex {
  constructor(options: any) {
    super();
  }

  public connecting: boolean = false;
  public pending: boolean = false;
  public readyState: boolean = false;
  public bufferSize: number = 0;
  
  public localAddress: string = '';
  public localPort: number = -1;

  pause = () => {
    // It seems to pause related functions not exists in Deno.Writer
    notImplemented();
  };

  resume = () => {
    // It seems to pause related functions not exists in Deno.Writer
    notImplemented();
  };

  public setNoDelay(enable: boolean) {
    // It seems to setNoDelay related functions not exists in this.conn
  }

  public setKeepAlive(setting: any, msecs: any) {
    // It seems to setKeepAlive related functions not exists in this.conn
  }

  public address() {
    if (this.conn?.localAddr.transport === "tcp") {
      // tcp
      return (this.conn.localAddr as Deno.NetAddr).hostname;
    } else {
      // ipc (not support windows using named pipe)
    }
  }

  public port() {
    if (this.conn?.remoteAddr.transport === "tcp") {
      return (this.conn.localAddr as Deno.NetAddr).port;
    } else {
    }
  }

  public remoteAddress() {
    if (this.conn?.remoteAddr.transport === "tcp") {
      return (this.conn.remoteAddr as Deno.NetAddr).hostname;
    } else {
    }
  }

  public remoteFamily() {
    // It seems to connection family related field not exists in this.conn
  }

  public remotePort() {
    if (this.conn?.remoteAddr.transport === "tcp") {
      return (this.conn.remoteAddr as Deno.NetAddr).port;
    } else {
    }
  }

  public destorySoon() {
    if (this.writable) this.end();

    if (this.writableFinished) this.destroy();
    else this.once("finish", this.destroy);
  }

  public bytesRead() {}

  public bytesWritten() {}

  public conn: Deno.Conn | undefined = undefined;

  public connect(
    options: TcpSocketConnectOpts | IpcSocketConnectOpts,
    connectionListener?: () => void
  ) {
    let connectionPromise: Promise<Deno.Conn>;

    if ("port" in options) {
      // tcp
      options = options as TcpSocketConnectOpts;
      connectionPromise = Deno.connect({
        port: options.port,
        transport: "tcp",
      });
    } else {
      // ipc (not support windows using named pipe)
      options = options as IpcSocketConnectOpts;
      connectionPromise = Deno.connect({
        path: options.path,
        transport: "unix",
      });
    }

    let bindConnection = (con: Deno.Conn) => {
      this.conn = con;
    };

    bindConnection = bindConnection.bind(this);
    connectionListener = connectionListener?.bind(this);

    connectionPromise.then((con) => {
      bindConnection(con);
      connectionListener && connectionListener();
    });
  }

  public setTimeout(timeout: number, callback: Function) {

  }

}

export class Server extends EventEmitter {
  constructor(options: any, connectionListener: any) {
    super();
  }

  public listening: boolean = false;

  public maxConnections: number = -1;

  public listener: Deno.Listener | undefined = undefined;

  public async listen(options: ListenOptions, callback: GenericFunction) {
    if (callback !== null) {
      this.once('listening', callback);
    }

    if ("port" in options) {
      // tcp
      this.listener = Deno.listen({
        port: options.port!,
        hostname: options.host,
        transport: "tcp",
      });

      this.emit('listening');

      for await (const conn of this.listener) {
        
      }

    } else if ("path" in options) {
      // ipc (not support windows using named pipe)
      this.listener = Deno.listen({
        path: options.path!,
        transport: "unix",
      });
    } else {
      //   throw new ERR_INVALID_ARG_VALUE('options', options,
      //                                   'must have the property "port" or "path"');
    }
  
    // throw new ERR_INVALID_ARG_VALUE('options', options);
  }

  public address() {
    if (this.listener?.addr.transport === 'tcp') {
      // tcp
      return (this.listener!.addr as Deno.NetAddr).hostname;
    } else {
      // ipc (not support windows using named pipe)
    }
  }

  public getConnections(cb: any) {  }

  public connections() {

  }

  public close(cb: any) {
    this.listener?.close();
  }

  public ref() {}

  public unref() {}
}

// Target API:
//
// let s = net.connect({port: 80, host: 'google.com'}, function() {
//   ...
// });
//
// There are various forms:
//
// connect(options, [cb])
// connect(port, [host], [cb])
// connect(path, [cb]);

// export function connect(port: number, options: Object, connectionListener: Function): Deno.Conn;
export function connect(options: Object, connectionListener: Function) {
  const socket = new Socket(options);
  return socket.connect(options as SocketConnectOpts);
}

export function createServer(options: any, connectionListener: any) {
  return new Server(options, connectionListener);
}

export function createConnection() {
  
}

export function isIP(input: string) {

}

export function isIPv4(input: string) {

}

export function isIPv6(input: string) {

}

export default {
  Server,
  Socket
};