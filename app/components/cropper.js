import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function ImageCropper(props) {
  const { imgSrc, onCropped, width, height, imgRatio } = props;

  const [cropConfig, setCropConfig] = useState({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspect: 1 / imgRatio
  });

  const imageRef = {};
  const img = document.createElement('img');
  img.onload = () => {
    imageRef.ref = img;
  }
  img.src = imgSrc;

  async function cropImage(crop) {
    if (imageRef.ref && crop.width && crop.height) {
      const croppedImage = await getCroppedImage(
        imageRef.ref,
        crop,
        'cropped_image.jpeg' // destination filename
      );
      onCropped(croppedImage);
    }
  }

  function getCroppedImage(sourceImage, cropConfig, fileName) {
    // creating the cropped image from the source image
    const canvas = document.createElement('canvas');
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;
    canvas.width = cropConfig.width;
    canvas.height = cropConfig.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      sourceImage,
      cropConfig.x * scaleX,
      cropConfig.y * scaleY,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY,
      0,
      0,
      cropConfig.width,
      cropConfig.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        // returning an error
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        blob.name = fileName;
        
        const imageFile = new File(
          [blob],
          fileName,
          { lastModified: new Date().getTime(), type: blob.type }
        )
        
        resolve(imageFile);
        
      }, 'image/jpeg');
    });
  }

  return (
    <ReactCrop
      src={imgSrc}
      crop={cropConfig}
      ruleOfThirds
      onComplete={(cropConfig) => cropImage(cropConfig)}
      onChange={(cropConfig) => setCropConfig(cropConfig)}
      crossorigin="anonymous"
    />
  );
}

ImageCropper.defaultProps = {
  onCropped: () => {}
};

export default ImageCropper;
