/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
import { BaseProvider } from '@voyage-providers/providers';
import { ControllerClient } from './rpc/virtual/client';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare global {
  // eslint-disable-next-line no-var
  var voyage: BaseProvider;
  // eslint-disable-next-line no-var
  var controller: ControllerClient;
  // eslint-disable-next-line no-var
  var provider: BaseProvider;
  interface Window {
    voyage: BaseProvider;
  }
  namespace NodeJS {
    interface ProcessEnv {
      AUTH0_DOMAIN: string;
      AUTH0_CLIENT_ID: string;
    }
  }
}
