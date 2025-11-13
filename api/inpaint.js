const formidable = require('formidable');
const sharp = require('sharp');
const fs = require('fs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send(String(err));
    const file = files.image;
    if (!file) return res.status(400).send('no image');
    try {
      const imgBuf = fs.readFileSync(file.path);
      let maskBuf = null;
      if (files.mask) {
        maskBuf = fs.readFileSync(files.mask.path);
      } else {
        const meta = await sharp(imgBuf).metadata();
        const {width, height} = meta;
        const grey = await sharp(imgBuf).greyscale().raw().toBuffer();
        let sum=0;
        for (let i=0;i<grey.length;i++){ sum+=grey[i]; }
        const mean = sum/grey.length;
        const mask = Buffer.alloc(grey.length);
        for (let i=0;i<grey.length;i++){
          const v = grey[i];
          mask[i] = (Math.abs(v-mean) > 25) ? 255 : 0;
        }
        maskBuf = await sharp(mask, {raw:{width:width, height:height, channels:1}}).png().toBuffer();
      }

      const blurred = await sharp(imgBuf).blur(20).toBuffer();
      const maskedBlur = await sharp(blurred)
        .composite([{ input: maskBuf, blend: 'dest-in' }])
        .png()
        .toBuffer();
      const out = await sharp(imgBuf)
        .composite([{ input: maskedBlur, blend: 'over' }])
        .png()
        .toBuffer();
      res.setHeader('Content-Type','image/png');
      res.send(out);
    } catch (e) {
      res.status(500).send(String(e));
    }
  });
};
