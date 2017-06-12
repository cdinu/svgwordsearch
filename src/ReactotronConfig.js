const Reactotron = require('reactotron-react-js').default
const { trackGlobalErrors } = require('reactotron-react-js')

Reactotron
  .configure({ name: 'Demo Time!', secure: false })
  .use(trackGlobalErrors({ offline: false }))
  .connect();

Reactotron.log({ numbers: [1, 2, 3], boolean: false, nested: { here: 'we go' } })
Reactotron.warn('*glares*')

Reactotron.error('Now you\'ve done it.')


    Reactotron.display({
      name: 'ORANGE',
      preview: 'Who?',
      value: 'Orange you glad you don\'t know me in real life?',
      mama: 22,
      important: true
    })

console.log('Hahah');
console.error('BuhHahah');
