const fs = require('fs');
const { processImage } = require('../kindle/image/process');

processImage({
    url: 'https://picsum.photos/1280/800',
})
    .then((buffer) => fs.writeFileSync('picsum.png', buffer))
    .catch((e) => console.error(e));
