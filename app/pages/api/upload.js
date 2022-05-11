import nextConnect from 'next-connect';
import multer from 'multer';
import fs from 'fs'
import { exec } from 'child_process';

const formatNum = (num) => num < 10 ? '0' + num : String(num);

const upload = multer({
  storage: multer.diskStorage({
    destination: './dist/inputs',
    filename: (req, file, cb) => {
      const date = new Date();
      const month = formatNum(date.getMonth() + 1);
      const day = formatNum(date.getDate());
      const hour = formatNum(date.getHours());
      const min = formatNum(date.getMinutes());
      const random = Math.floor(Math.random() * 10000) % 10000;
      const prefix = `${month}${day}${hour}${min}_${random}`;
      return cb(null, `${prefix}_${file.originalname}`);
    }
  }),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.array('file'));

apiRoute.post((req, res) => {

  const mode = req.body.mode || '';
  const useModel = {
    'Anime': 'RealESRGAN_x4plus_anime_6B'
  }[mode] || 'RealESRGAN_x4plus';
  
  const fileName = req.files[0].filename;

  const splitted = fileName.split('.');
  const fileType = splitted.pop();
  
  const inputPath = `../app/dist/inputs/${fileName}`;
  const outputDir = `../app/dist/outputs/`;

  exec(`python inference_realesrgan.py -n ${useModel} -i '${inputPath}' -o '${outputDir}' --outscale 4`, {
    cwd: '../esrgan/'
  }, (error, stdout, stderr) => {
    
    const date = new Date();
    const year = date.getFullYear();
    const month = formatNum(date.getMonth() + 1);
    const day = formatNum(date.getDate());
    const hour = formatNum(date.getHours());
    const min = formatNum(date.getMinutes());
    const sec = formatNum(date.getSeconds());
    const timeStr = `${year}-${month}-${day} ${hour}:${min}:${sec}`;

    if (stdout.includes('Error')) {
      console.log(`Error at ${timeStr} |`, stdout);
      return res.status(500).json({ error: stdout });
    }

    if (error) {
      console.log(`Error at ${timeStr} |`, stderr);
      return res.status(500).json({ error: 'Inference Error' });
    }

    try {
      let nameBody = '';
      for (let name of splitted) {
        nameBody += name + '.';
      }
      const namePrefix = nameBody.slice(0, nameBody.length - 1);
      const outputPath = `${outputDir}${namePrefix}_out.${fileType}`;

      const { size } = fs.statSync(outputPath);

      res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Content-Length': size
      });

      console.log(`${timeStr} | ${namePrefix}_out.${fileType}`);

      const readStream = fs.createReadStream(outputPath);
      readStream.pipe(res);

    } catch(err) {
      console.log(err);
      res.status(500).json({ error: 'Error at processing image' });
    }

  });
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default apiRoute;
