module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { node: 'current' }, // Target the version of Node.js in use
        },
      ],
    ],
  };
  