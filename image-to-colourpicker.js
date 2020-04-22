(function(){

// Storing some HTML references for faster access   

    const imagecontainer = document.querySelector('#imagecontainer');
    const pickercontainer = document.querySelector('#pickercontainer');

// Grab the colour picker
    const colourpicker = document.querySelector('#pickcolour');

// dynamically add a list attribute to the colour picker
    colourpicker.setAttribute('list','presets');
// create a datalist with the right ID and add it to the container
    const datalist = document.createElement('datalist');
    datalist.setAttribute('id','presets');
    pickercontainer.appendChild(datalist);

// Define a new Worker as there might be a lot of pixels
// to analyse and we don't want to slow down the main 
// thread.
    let worker = new Worker('imagecolouranalyser.js');
    
    // once he worker is done, send its data to addToColourPicker
    worker.addEventListener('message', (e) => {
        addToColourPicker(e.data);
    }, false);
    // If there are any errors, log them 
    worker.addEventListener('error', (e) => {
        console.log('worker error', e);
    }, false);



// Analyse the colours in an image once it is loaded 
    const analyseColours = (img) => {
        // create a canvas and resize it to the 
        // dimensions of the image so that we get 
        // all pixels
        let c = document.createElement('canvas');
        let cx = c.getContext('2d');
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        c.width = w;
        c.height = h;
        // paint the image onto it top left
        cx.drawImage(img, 0,0);
        // get all the pixel information and 
        // post it to the Worker  
        let pixels = cx.getImageData(0, 0, w, h).data;
        worker.postMessage(pixels);
    }


// Once the worker has analysed the pixels, we 
// create the dynamic datalist    
    const addToColourPicker = (colours) => {
        let out = '';
        colours.forEach(c => {
            out += `<option value="#${c}"></option>`
        });
        datalist.innerHTML = out;
        // open the colour picker (this is just for this demo)
        colourpicker.click();
    }

/* Helper methods to get the image into th document. 
   See: 
   https://christianheilmann.com/2020/03/20/fun-with-browsers-how-to-get-an-image-into-the-current-page/
*/    

    /* Image received */
    const loadImage = (file) => {
        var img = new Image();
        img.src = file;
        img.onload = function() {
          analyseColours(img);
        };
      }
  
    /* Image from Clipboard */
    const getClipboardImage = (ev) => {
      let items = ev.clipboardData.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          var blob = items[i].getAsFile();
          loadImage(window.URL.createObjectURL(blob));
          break;
        }
      }
    }
    window.addEventListener('paste', getClipboardImage, false);
     
    /* Image from Drag and Drop */
    const imageFromDrop = (e) => {
      var file = e.dataTransfer.files[0];
      loadImage(window.URL.createObjectURL(file), file.name);
      e.preventDefault();
    }
    document.body.addEventListener('drop', imageFromDrop, false);
    // Override the normal drag and drop behaviour
    document.body.addEventListener('dragover', (ev) => {
      ev.preventDefault();
    }, false);
     
    /* Image from Upload */
    const fileinput = document.querySelector('#getfile');
    const imageFromUpload = (e) => {
      var file = e.target.files[0];
      loadImage(window.URL.createObjectURL(file), file.name);
      e.preventDefault();
    }
    fileinput.addEventListener('change', imageFromUpload, false);
     
    /* Demo */

    imagecontainer.addEventListener('click', (ev) => {
        let t = ev.target;
        if(t.src) { loadImage(t.src); }
        ev.preventDefault();
    })
})();