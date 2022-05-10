import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import RestartIcon from '@mui/icons-material/RestartAlt';

import BurstIcon from '@mui/icons-material/BurstModeOutlined';
import PhotoIcon from '@mui/icons-material/PhotoOutlined';
import CropIcon from '@mui/icons-material/Crop';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import ArrowIcon from '@mui/icons-material/DoubleArrow';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';

import axios from 'axios';
import Dropzone from "react-dropzone";

const Home = () => {
  const imgWidth = 375;
  const drawerWidth = 220;

  const [status, setStatus] = useState(0)
  const [imgSrc, setImgSrc] = useState('')
  const [resultImg, setResultImg] = useState('')
  const [ratio, setRatio] = useState(1)

  const [files, setFiles] = useState([]);
  
  const onSelectFile = (files) => {
    if (files && files.length > 0) {

      const file = files[0];
      if (!file) return;

      setFiles(files);

      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 1) return alert('File size should be smaller than 1 MB')

      // Display image on the page
      const img = document.createElement("img");
      img.onload = () => {
          setRatio(img.naturalHeight / img.naturalWidth)
          setStatus(1)
      }

      // Read selected image
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const src = reader.result
        img.src = src
        setImgSrc(src)
      });
      reader.readAsDataURL(file)

    }
  }

  const uploadImage = () => {
    // Upload image
    setStatus(2)
    const file = files[0]

    const data = new FormData() 
    data.append('file', file)
    data.append('mode', 'photo')
    axios.post(
      '/api/upload',
      data,
      { responseType: 'arraybuffer' }
    )
      .then(res => {
        const result = `data:${file.type};base64,` + Buffer.from(res.data, 'binary').toString('base64')
        setResultImg(result)
        setStatus(3)
      })
  }

  const onRestart = () => {
    setStatus(0)
    setImgSrc('')
    setResultImg('')
    setRatio(1)
    setFiles([])
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Image Super Resolution</title>
        <meta name="description" content="Author: Liqi Chen" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', height: '100%' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Real-Time Image Super Resolution
            </Typography>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <div className={styles.main}>
            <div className={styles.status}>
              <Stepper activeStep={status} style={{ width: 2*imgWidth + 200 + 'px' }}>
                <Step key={1} completed={status > 0}>
                  <StepButton color="inherit">
                    Select Image
                  </StepButton>
                </Step>
                <Step key={2} completed={status > 1}>
                  <StepButton color="inherit">
                    Upload Image
                  </StepButton>
                </Step>
                <Step key={3} completed={status > 2}>
                  <StepButton color="inherit">
                    Processing
                  </StepButton>
                </Step>
                <Step key={4} completed={status > 2}>
                  <StepButton color="inherit">
                    Finished
                  </StepButton>
                </Step>
              </Stepper>
              {
                status === 3 && 
                <Button
                  startIcon={<RestartIcon />}
                  onClick={onRestart}
                  variant="contained"
                  style={{ marginLeft: '50px' }}
                >Restart</Button>
              }
            </div>
            <div className={styles.container} style={{ width: 2*imgWidth + 200 + 'px' }}>
              <div className={styles.imageWrapper}>
                {
                  imgSrc ?
                  <>
                    <Image
                      src={imgSrc}
                      width={imgWidth}
                      height={imgWidth * ratio}
                      alt="Uploaded Image"
                    />
                    {status < 3 ?
                    <LoadingButton
                      loading={status === 2}
                      variant="contained"
                      endIcon={<ArrowIcon />}
                      onClick={uploadImage}
                    >
                      Process
                    </LoadingButton>
                    :
                    <div className={styles.arrow}>
                      <div className={styles.line}></div>
                      <div className={styles.point}></div>
                    </div>
                    }
                    {
                      resultImg ?
                      <Image
                        src={resultImg}
                        width={imgWidth}
                        height={imgWidth * ratio}
                        alt="Result Image"
                      />
                      :
                      <div
                        className={styles.block}
                        style={{
                          width: imgWidth + 'px',
                          height: imgWidth * ratio + 'px',
                          backgroundColor: '#fafafa',
                          border: '3px dashed #eeeeee'
                        }}
                      >
                        {
                          status === 1 ?
                          'Click button to continue' :
                          'Processing...'
                        }
                      </div>
                    }
                  </>
                  :
                  <Dropzone
                    onDrop={onSelectFile}
                    accept={{'image/*': ['.png', '.jpg', '.jpeg']}}
                    minSize={1024}
                    maxSize={1048576}
                    maxFiles={1}
                  >
                    {({
                      getRootProps,
                      getInputProps,
                      isDragActive,
                      isDragAccept,
                      isDragReject
                    }) => {
                      const additionalClass = isDragAccept
                        ? styles.accept
                        : isDragReject
                        ? styles.reject
                        : "";
                      return (
                        <div
                          {...getRootProps({
                            className: `${styles.dropzone} ${additionalClass}`
                          })}
                        >
                          <input {...getInputProps()} />
                          <span style={{ fontSize: '28px' }}>{isDragActive ? "📂" : "📁"}</span>
                          <p>Click to select an image, or drag image and drop here</p>
                        </div>
                      );
                    }}
                  </Dropzone>
                }
              </div>
              {
                status === 3 &&
                <div className={styles.titleArea}>
                  <div style={{
                    textAlign: 'center',
                    width: imgWidth + 'px'
                  }}>
                    Original Image
                  </div>
                  <div style={{
                    textAlign: 'center',
                    width: imgWidth + 'px'
                  }}>
                    Super-Resolution Image
                  </div>
                </div>
              }
            </div>
          </div>
        </Box>
      </Box>
    </div>
  )
}

export default Home
