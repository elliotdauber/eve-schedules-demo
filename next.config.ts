import type { NextConfig } from 'next';
import { withEve } from 'eve/next';

const eveConfig = withEve({
  turbopack: {
    root: import.meta.dirname,
  },
});

const config: typeof eveConfig = async (phase, context) => {
  const savedVercel = process.env.VERCEL;

  if (savedVercel === '1' && process.env.NODE_ENV === 'development') {
    delete process.env.VERCEL;
  }

  try {
    return typeof eveConfig === 'function'
      ? await eveConfig(phase, context)
      : eveConfig;
  } finally {
    if (savedVercel !== undefined) {
      process.env.VERCEL = savedVercel;
    }
  }
};

export default config;
