console.log("Content script has loaded. YAY!");

// Function to dynamically load external scripts and execute a callback after loading
function loadExternalScript(src, callback) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    script.onload = () => {
        console.log(`${src} loaded successfully.`);
        script.remove(); // Cleanup after load
        if (callback) callback();
    };
    script.onerror = () => {
        console.error(`Failed to load ${src}.`);
    };
    document.head.appendChild(script);
}

// Function to find Order ID from text
function findOrderId(text) {
    const orderIdPattern = /Order ID:\s*(\d+)/i;
    const matches = text.match(orderIdPattern);
    return matches ? matches[1] : null;
}

// Function to generate a barcode and add it to the page
function generateBarcode(orderId) {
    if (!window.JsBarcode) {
        console.error("JsBarcode is not loaded, trying to load...");
        loadExternalScript('libraries/JsBarcode.all.min.js', () => generateBarcode(orderId));
        return;
    }
    const barcodeContainer = document.createElement('svg');
    barcodeContainer.id = 'barcode';
    document.body.appendChild(barcodeContainer);
    JsBarcode(barcodeContainer, orderId, {
        format: "CODE128",
        lineColor: "#0aa",
        width: 4,
        height: 40,
        displayValue: true
    });
    console.log("Barcode generated for Order ID:", orderId);
    addPrintButton(); // Add a print button after generating the barcode
}

// Function to add a print button to the page
function addPrintButton() {
    const printButton = document.createElement('button');
    printButton.textContent = 'Print';
    printButton.onclick = () => window.print();
    document.body.appendChild(printButton);
}

// Function to process image with OCR using Tesseract.js
function processImageWithOCR(imageUri) {
    if (!window.Tesseract) {
        console.error("Tesseract.js is not defined. Trying to load...");
        loadExternalScript('lib/tesseract.min.js', () => processImageWithOCR(imageUri));
        return;
    }
    Tesseract.recognize(
        imageUri,
        'eng',
        { logger: m => console.log(`OCR Progress: ${m.progress * 100}%`) }
    ).then(result => {
        console.log("OCR Result:", result.text);
        const orderId = findOrderId(result.text);
        if (orderId) {
            generateBarcode(orderId);
        } else {
            console.error("Order ID not found in OCR text.");
        }
    }).catch(err => {
        console.error("OCR Error:", err);
    });
}

// Listener for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received", request);
    if (request.action === "process_screenshot") {
        processImageWithOCR(request.imageUri);
        sendResponse({status: "Processing started"});
        return true;  // Indicates asynchronous response
    }
});

