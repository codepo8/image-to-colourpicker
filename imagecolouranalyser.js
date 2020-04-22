// process the data that came from the main script
const process = (e) => {
    var data = e.data;
    let all = data.length;
    // create a Set to store the colours found
    // sets automatically discard duplicates, so
    // that's great
    let coloursused = new Set();
    // Loop through all the pixel data in steps of 4
    // as in a canvas image data array 
    // 1 = R, 2 = G, 3 = B, 4 = alpha
    for (let i = 0; i < all; i += 4) {
        // Assemble the hex string from the RGB(a) data
        let hex = ''+
            rgbToHex(data[i]) +
            rgbToHex(data[i+1]) +
            rgbToHex(data[i+2]);        
        // add it to the set )
        coloursused.add(hex);
    }
    // done? Back to main thread.
    postMessage(coloursused);
}
// convert decimal to hex
const rgbToHex = (col) => {
    return parseInt(col,10).toString(16);
}
// get the data from the main script.
addEventListener('message', process, false);