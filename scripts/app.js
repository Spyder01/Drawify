//Global Constants
const Canvases = document.querySelector('#canvases');
const darken = document.querySelector('#darken');
const intensity = document.querySelector('#intensity');
const selector = document.querySelector('#selector');
const applyBtn = document.querySelector ('#Apply');
const uploadBtn = document.querySelector ('#upload');
const download = document.querySelector ('#Download');
const intensity_slider = document.querySelector('#intensity-slider');
const darken_slider = document.querySelector('#darken-slider');
const file =  document.getElementById("file1");


selector.value = 'Sketchify';

// States
var workingCanvas = null;
const setWorkingCanvas = (canvas)=>{
    workingCanvas = canvas;
}

var resultCanvas = null;
const setResultCanvas = (canvas)=>{
    resultCanvas = canvas;
}

var mode = 'sketch';
const setMode = (ele)=>{
    switch (ele.value) {
        case "oil_pasted":
            mode = 'oil';
            break;
        case "Sketchify":
            mode = 'sketch';
            break;
    }
}

var apply = false;
const setApply = (val) => {
    apply = val;
}

var image = ".\\images\\Retriever.jpg";

const setImage = (val) => {
    image = val;
}




// Functions
const init = ()=>{
    const Width = window.innerWidth;
    setWorkingCanvas (document.getElementById("original_image"));


    if (Width < 786) {
        setResultCanvas (document.getElementById ("original_image"));
        document.getElementById ('result_canvas').style.display = 'none';
        workingCanvas.style.display = 'inline-block';

        resultCanvas.style.display = 'inline-block';
        

    }
    else {
        setResultCanvas (document.getElementById ("result_canvas"));
        workingCanvas.style.display = 'inline-block';
        resultCanvas.style.display = 'inline-block';
        
//        console.log (resultCanvas.style.display)
    }
    canvases.style.display = 'flex';
    slidersDisplay ()
    listeners ();
}

const slidersDisplay = ()=>{
    if (mode === 'sketch') {
        darken.style.display = 'flex';
        intensity.style.display = 'none';
    }
    else {
        darken.style.display = 'none';
        intensity.style.display = 'flex'; 
    }
}


// All the EventListeners
const listeners = ()=>{
    selector.addEventListener('change', (e)=>{
        setMode (e.target);
        slidersDisplay ();
        setApply (false);
    })

    applyBtn.addEventListener ('click', ()=>{
        setApply(true);
        switch (mode) {
            case 'oil':  
            loadImage(workingCanvas, image, ()=>{
                if(window.innerWidth>786)
            normalize (workingCanvas, resultCanvas)
           oilPaintEffect(workingCanvas, resultCanvas, JSON.parse(intensity_slider.value));  
          
                
            });
                    break;
            case 'sketch':
                sketchify (workingCanvas, resultCanvas, JSON.parse(darken_slider.value));
        }
    })
    
uploadBtn.addEventListener('click',  () =>
{
  file.click();
}

)

  
file.addEventListener('change', function(e){
    
    readImage(e.target.files[0]);


})

darken.addEventListener('change', ()=>{
    
})

download.addEventListener('click', ()=>{
    let link = document.createElement('a');
    link.download = 'filename.png';
    link.href = resultCanvas.toDataURL()
    link.click();
})


}



// To normalise the size of the canvas
const normalize = (ogCanvas, newCanvas) => {

    newCanvas.height = ogCanvas.height;
    newCanvas.style.aspectRatio = ogCanvas.style.aspectRatio;

}

// To Load Images
const loadImage = (canvas, imgSrc, callback=()=>{}) => {
    const ctx = canvas.getContext("2d");
    const img = new Image ();



    img.addEventListener('load', function(){
        console.log(this.height, this.width);
        scaleToFit (this, canvas, ctx );
        callback ();
    })
    img.crossOrigin = "Anonymous";
    img.src = imgSrc;



}

const readImage = (file) => {
    // Check if the file is an image.
    if (file.type && !file.type.startsWith('image/')) {
      console.log('File is not an image.', file.type, file);
      return;
    }
  
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      setImage(event.target.result);
      loadImage(workingCanvas, image, ()=>{
        if(window.innerWidth>786)
    normalize (workingCanvas, resultCanvas)
        
    });
    });
    reader.readAsDataURL(file);


  }




// To fit in the canvas
const scaleToFit = (img, canvas, ctx)=>{
    img.aspectRatio = img.width/img.height;

  if (img.height>550)
     img.height = 545;
   img.width = window.innerWidth;
  // console.log (img.width)
    canvas.width = img.width
   canvas.height = img.height;
    canvas.style.aspectRatio = img.aspectRatio;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}


// To convert images to sektch
const sketchify = (canvasInput, canvasOutput, darken=0) => {
    //console.log(darken)
   // cv['onRuntimeInitialized']=()=>{
        let src = cv.imread(canvasInput);
        canvasOutput.height = canvasInput.height;
        canvasOutput.style.aspectRatio = canvasInput.style.aspectRatio;
        let dst = new cv.Mat();
        let grey = new cv.Mat ();
       cv.cvtColor(src, grey, cv.COLOR_BGR2GRAY, 0);
        cv.bitwise_not(grey, dst)
          let ksize = new cv.Size(21, 21);
         cv.GaussianBlur(dst, dst, ksize, darken, darken);
         cv.bitwise_not(dst, dst)
         cv.divide(grey, dst, dst, scale=256.0)
        cv.imshow(canvasOutput, dst);
        src.delete(); grey.delete(); dst.delete();
    //  };
}



// To add oilpaste effect
const oilPaintEffect = (canvas, newCanvas, intensity) => {
  // const ctx = canvas.getContext("2d");
   let src = cv.imread(canvas);
   let dst = new cv.Mat ()
   newCanvas.height =  canvas.height;
   newCanvas.style.aspectRatio = canvas.style.aspectRatio;
   let ksize = new cv.Size(intensity, intensity);
   kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, ksize);
     cv.morphologyEx(src, dst, cv.MORPH_OPEN, kernel)
   cv.normalize(dst, dst, 20, 255, cv.NORM_MINMAX)
   cv.imshow (newCanvas, dst);
   src.delete(); dst.delete(); kernel.delete();



    /*var width = canvas.width;
    var   height = canvas.height;
    var   imgData = ctx.getImageData(0, 0, width, height);
    var   pixData = imgData.data;
    var   destCanvas = newCanvas;
    destCanvas.height = canvas.height;
    destCanvas.style.aspectRatio = canvas.style.aspectRatio;

        dCtx = destCanvas.getContext("2d"),
        pixelIntensityCount = [];

    destCanvas.width = width;
    destCanvas.height = height;

    // for demo purposes, remove this to modify the original canvas
  //  document.body.appendChild(destCanvas);

    var destImageData = dCtx.createImageData(width, height),
        destPixData = destImageData.data,
        intensityLUT = [],
        rgbLUT = [];

    for (var y = 0; y < height; y++) {
        intensityLUT[y] = [];
        rgbLUT[y] = [];
        for (var x = 0; x < width; x++) {
            var idx = (y * width + x) * 4,
                r = pixData[idx],
                g = pixData[idx + 1],
                b = pixData[idx + 2],
                avg = (r + g + b) / 3;

            intensityLUT[y][x] = Math.round((avg * intensity) / 255);
            rgbLUT[y][x] = {
                r: r,
                g: g,
                b: b
            };
        }
    }


    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {

            pixelIntensityCount = [];

            // Find intensities of nearest pixels within radius.
            for (var yy = -radius; yy <= radius; yy++) {
                for (var xx = -radius; xx <= radius; xx++) {
                    if (y + yy > 0 && y + yy < height && x + xx > 0 && x + xx < width) {
                        var intensityVal = intensityLUT[y + yy][x + xx];

                        if (!pixelIntensityCount[intensityVal]) {
                            pixelIntensityCount[intensityVal] = {
                                val: 1,
                                r: rgbLUT[y + yy][x + xx].r,
                                g: rgbLUT[y + yy][x + xx].g,
                                b: rgbLUT[y + yy][x + xx].b
                            }
                        } else {
                            pixelIntensityCount[intensityVal].val++;
                            pixelIntensityCount[intensityVal].r += rgbLUT[y + yy][x + xx].r;
                            pixelIntensityCount[intensityVal].g += rgbLUT[y + yy][x + xx].g;
                            pixelIntensityCount[intensityVal].b += rgbLUT[y + yy][x + xx].b;
                        }
                    }
                }
            }

            pixelIntensityCount.sort(function (a, b) {
                return b.val - a.val;
            });

            var curMax = pixelIntensityCount[0].val,
                dIdx = (y * width + x) * 4;

            destPixData[dIdx] = ~~ (pixelIntensityCount[0].r / curMax);
            destPixData[dIdx + 1] = ~~ (pixelIntensityCount[0].g / curMax);
            destPixData[dIdx + 2] = ~~ (pixelIntensityCount[0].b / curMax);
            destPixData[dIdx + 3] = 255;
        }
    }

    // change this to ctx to instead put the data on the original canvas
    dCtx.putImageData(destImageData, 0, 0); */
}




window.onload = ()=>{
    init ()
    loadImage(workingCanvas, image, ()=>{
        if(window.innerWidth>786)
    normalize (workingCanvas, resultCanvas)
  // oilPaintEffect(workingCanvas, resultCanvas, 4, 55);
   // sketchify (workingCanvas, resultCanvas, 200);
  // newCanvas.style.display = 'none';
        
    });
    

}
