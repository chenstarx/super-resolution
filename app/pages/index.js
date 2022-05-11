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
import ListItem from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import RestartIcon from '@mui/icons-material/RestartAlt';
import AnimeIcon from '@mui/icons-material/LiveTv';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import PhotoIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import CropIcon from '@mui/icons-material/Crop';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import ArrowIcon from '@mui/icons-material/DoubleArrow';
import CheckIcon from '@mui/icons-material/Check';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';

import axios from 'axios';
import Dropzone from "react-dropzone";

import Cropper from '../components/cropper';

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

      if (file.size > 524288) return alert('File size should be smaller than 500 KB');

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

  const [errMsg, setErrMsg] = useState('')
  const uploadImage = () => {
    // Upload image
    setStatus(2)
    const file = files[0]

    const data = new FormData()

    // TODO: crop using cropImg

    data.append('file', file)

    const mode = {
      0: 'Photo',
      1: 'Anime',
      2: 'Crop'
    }[tab] || ''
    data.append('mode', mode)

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
      .catch(e => {
        const text = new TextDecoder('utf-8').decode(e.response.data)
        const { error } = JSON.parse(text)
        setErrMsg(error)
        setStatus(4)
      })
  }

  const onRestart = () => {
    setStatus(0)
    setImgSrc('')
    setResultImg('')
    setRatio(1)
    setFiles([])
    setCropDone(false)
  }

  const [tab, setTab] = useState(0)
  const switchTab = (e, index) => {
    onRestart()
    setTab(index)
  }

  // TODO: how react handle useState(1) with const
  const [cropDone, setCropDone] = useState(false)
  const cropImgData = {}
  const getCroppedImage = (imageFile, cropRatio) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      cropImgData.src = reader.result
      cropImgData.ratio = cropRatio
      cropImgData.file = imageFile
    });
    console.log(imageFile)
    reader.readAsDataURL(imageFile)
  }

  const onCropConfirm = () => {
    console.log(cropImgData)
    setImgSrc(cropImgData.src)
    setRatio(cropImgData.ratio)
    setFiles([cropImgData.file])
    setCropDone(true)
  }

  const ImageCropper = () => cropDone ?
    <ImageView /> :
    <>
      <Cropper
        imgSrc={imgSrc}
        imgRatio={ratio}
        onCropped={(file, ratio) => getCroppedImage(file, ratio)}
        width={imgWidth}
        height={imgWidth * ratio}
      />
      <Button
        className={styles.confirm}
        startIcon={<CheckIcon />}
        size="large"
        onClick={onCropConfirm}
        variant="contained"
      >Confirm</Button>
      <div/>
    </>

  const tabItems = [
    ['Photo', <PhotoIcon key={0} />],
    ['Anime', <AnimeIcon key={1} />],
    ['Crop', <CropIcon key={2} />],
    ['Divider'],
    ['About', <InfoIcon key={4} />]
  ]

  const ImageView = () => <>
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
          status === 4 ?
          errMsg || 'Error' :
          'Processing...'
        }
      </div>
    }
  </>

  const FileUploader = () => <>
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
            <p>Click to select an image, or drag one and drop here</p>
          </div>
        );
      }}
    </Dropzone>
  </>

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
              Real-Time Image Super Resolution ---
              {{
                0: ' Photo Mode',
                1: ' Anime Mode',
                2: ' Image Crop Mode',
                4: ' About',
              }[tab]}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {
                tabItems.map((item, index) => {
                  return item[0] === 'Divider' ?
                    <Divider key={item[0]} /> :
                    <ListItem
                      selected={tab === index}
                      onClick={(e) => switchTab(e, index)}
                      key={item[0]}
                    >
                      <ListItemIcon>
                        {item[1]}
                      </ListItemIcon>
                      <ListItemText primary={item[0]} />
                    </ListItem>
                })
              }
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {
            tab === 4 &&
            <div className={styles.main}>
              About
            </div>
          }
          { tab < 3 &&
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
                status > 0 && status !== 2 && 
                <Button
                  startIcon={<RestartIcon />}
                  onClick={onRestart}
                  variant="contained"
                  style={{ marginLeft: '50px' }}
                >Reset</Button>
              }
            </div>
            <div className={styles.container} style={{ width: 2*imgWidth + 200 + 'px' }}>
              <div className={styles.imageWrapper}>
              {
                imgSrc ?
                  tab === 2 ?
                  <ImageCropper /> :
                  <ImageView />
                :
                <FileUploader />
              }
              </div>
              {
                tab === 1 && status === 0 &&
                <Alert severity="info" style={{ marginTop: '28px' }}>
                  <AlertTitle>Anime Mode</AlertTitle>
                  This mode is optimized for <strong>Anime</strong>, <strong>Carton</strong>, or <strong>Meme</strong> images.
                </Alert>
              }
              {
                tab === 2 && status === 0 &&
                <Alert severity="info" style={{ marginTop: '28px' }}>
                  <AlertTitle>Crop Mode</AlertTitle>
                  You can <strong>crop</strong> the photo in this mode, the app will only process the cropped part.
                </Alert>
              }
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
          }
        </Box>
      </Box>
    </div>
  )
}

export default Home
