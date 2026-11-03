const installDiagnostics = (state) => {
  const originals = { warn: console.warn, error: console.error };
  const wrappers = {};
  const expected = (args) => {
    const file = expect.getState().testPath || '';
    const text = args.map((value) => value?.stack || String(value)).join('\n');
    if (
      /\/frontend\/(app|views|lifecycle)\//.test(file) ||
      /\/harness\/fixtures\/(app-(wrong-initial-request|message-json-failure|best-missing-failure|prices-shape-failure|history-rejection)|history-view-rejection)\.case\.js$/.test(file)
    ) {
      if (
        text.includes(
          'Warning: Cannot update during an existing state transition'
        ) &&
        text.includes('Render methods should be a pure function') &&
        text.includes('at HandleSnackbar')
      )
        return true;
      if (
        text.includes('Warning: Invalid DOM property') &&
        args[1] === 'class' &&
        args[2] === 'className' &&
        text.includes('at HistoricalView')
      )
        return true;
      if (
        text.includes(
          'Warning: Each child in a list should have a unique "key" prop'
        ) &&
        text.includes('BestArbitrageView')
      )
        return true;
    }
    const probes = {
      'app-message-json-failure.case.js': [[/SyntaxError/, /\/src\/App\.js/]],
      'app-prices-shape-failure.case.js': [
        [/sort is not a function/, /\/src\/App\.js/],
      ],
      'app-best-missing-failure.case.js': [
        [/reading 'arbitragesData'/, /\/src\/App\.js/],
        [/reading 'reduce'/, /\/src\/components\/views\/BestArbitrageView\.js/],
        [/The above error occurred/, /BestArbitrageView/],
      ],
      'unexpected-window-error.case.js': [
        [/F4 unhandled window callback/, /unexpected-window-error\.case\.js/],
      ],
    };
    return (probes[file.split('/').pop()] || []).some((patterns) =>
      patterns.every((pattern) => pattern.test(text))
    );
  };
  Object.keys(originals).forEach((kind) => {
    wrappers[kind] = (...args) => {
      if (!expected(args))
        state.deny(`unexpected console diagnostic (${kind})`);
      originals[kind](...args);
    };
    console[kind] = wrappers[kind];
  });
  return {
    check: () => {
      Object.keys(wrappers).forEach((kind) => {
        if (console[kind] !== wrappers[kind])
          throw state.deny(`console diagnostic guard replaced (${kind})`);
      });
    },
  };
};

module.exports = { installDiagnostics };
