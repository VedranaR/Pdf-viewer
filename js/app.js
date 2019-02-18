const url = "../docs/Lorem.pdf";

//global variables that are gonna be reassigned
let pdfDoc = null, //represents the document we're gonna get with pdf.js
  pageNum = 1,
  pageIsRendering = false, //this is gonna tell us the state of page render
  pageNumIsPending = null; //this is gonna show if we're fetching other multiple pages

const scale = 1.5,
  canvas = document.querySelector("#pdf-render"),
  context = canvas.getContext("2d"); //fetching a pdf and putting it in this canvas

//Render the page
const renderPage = num => {
  pageIsRendering = true;

  //Geth the page
  pdfDoc.getPage(num).then(page => {
    //set the scale
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending); //orders it to show whichever page is pending
        pageNumIsPending = null;
      }
    });
  });
};

//Get document - we're calling render from inside
//pdfjsLib is object from the pdf.js cdn
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  document.querySelector("#page-count").textContent = pdfDoc.numPages;

  renderPage(pageNum);
});
