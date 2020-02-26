const fs = require('fs');
const { processImage } = require('../kindle/image/process');

processImage({
    url: 'https://picsum.photos/1280/800',
})
    .then((buffer) => fs.writeFileSync('picsum.png', buffer))
    // eslint-disable-next-line no-console
    .catch((e) => console.error(e));
