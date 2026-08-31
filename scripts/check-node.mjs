const major = Number(process.version.slice(1).split('.')[0]);

if (major < 24) {
  console.error(
    `Node.js ${process.version} is too old for Eve (requires >=24).\n` +
      'Use fnm use / nvm use, or install Node 24+.'
  );
  process.exit(1);
}
