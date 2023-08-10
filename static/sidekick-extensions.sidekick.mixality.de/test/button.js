(function(Scratch) {
  'use strict';
  class Test {
    getInfo () {
      return {
        id: 'testbutton',
        name: 'test 123',
        // !!! CHANGE !!!
        // docsURI: 'https://mixality.github.io/Sidekick/extensions',
        docsURI: 'https://menersar.github.io/Sidekick/extensions',
        blocks: [
          {
            blockType: Scratch.BlockType.BUTTON,
            func: 'MAKE_A_VARIABLE',
            text: 'Make variable'
          },
          {
            blockType: Scratch.BlockType.BUTTON,
            text: ':)',
            func: 'hello'
          }
        ]
      };
    }
    hello () {
      alert('>:]');
    }
  }
  Scratch.extensions.register(new Test());
})(Scratch);
