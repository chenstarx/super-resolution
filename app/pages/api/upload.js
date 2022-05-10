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
      const prefix = `${month}${day}${hour}${min}`;
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
  
  const inputPath = `../app/dist/inputs/${req.files[0].filename}`;
  const outputPath = `../app/dist/outputs/hr_${req.files[0].filename}`;
  exec(`python inference.py ${inputPath} ${outputPath}`, {
    cwd: '../runner/'
  }, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: 'Inference Error' });
      return;
    }

    const { size } = fs.statSync(outputPath);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': size
    });

    const readStream = fs.createReadStream(outputPath);
    readStream.pipe(res);

  });
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default apiRoute;
