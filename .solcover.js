module.exports = {
  measureStatementCoverage: true,
  measureFunctionCoverage: true,
  measureModifierCoverage: true,
  skipFiles: [
    'test/',
    'utils/',
    'external/umami',
    'external/abracadabra',
    'external/general',
    'external/glp',
    'external/gmxV2',
    'external/helpers',
    'external/interestsetters',
    'external/interfaces',
    'external/jones',
    'external/lib',
    'external/oracles',
    'external/pendle',
    'external/plutus',
    'external/traders',
    'protocol/',
  ],
};
