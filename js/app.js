const url = "../docs/Lorem.pdf"; //shortcut for the sample pdf document in the repo

//global variables that are gonna be reassigned
let pdfDoc = null, //represents the document we're gonna get with pdf.js
  pageNum = 1,
  pageIsRendering = false, //this is gonna tell us the state of page render
  pageNumIsPending = null; //this is gonna show if we're fetching other multiple pages

const scale = 1.5, //defines the amount of zoom
  canvas = document.querySelector("#pdf-render"), //creating the html canvas
  context = canvas.getContext("2d"); //fetching a pdf and putting it in this canvas

//rendering the page
const renderPage = num => {
  pageIsRendering = true;

  //fetch the first page
  pdfDoc.getPage(num).then(page => {
    //prepare canvas using PDF page dimensions
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height; //stretching canvas to cover the viewport
    canvas.width = viewport.width;

    //Render PDF page into canvas context
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

    //output current page
    document.querySelector("#page-num").textContent = num;
  });
};

//check if there are pages rendering
const checkIfPagesRendering = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

//show previous page
const showPreviousPage = () => {
  if (pageNum <= 1) {
    return; //do nothing because there's no smaller page num
  }
  pageNum--;
  checkIfPagesRendering(pageNum);
};

//show next page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return; //do nothing because there's no greater page num
  }
  pageNum++;
  checkIfPagesRendering(pageNum);
};

//Get document - we're calling render from inside
//pdfjsLib is object from the pdf.js cdn
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.querySelector("#page-count").textContent = pdfDoc.numPages;

    renderPage(pageNum);
  })
  .catch(err => {
    //display error
    const div = document.createElement("div");
    div.className = "error";
    div.appendChild(document.createTextNode(err.message));
    document.querySelector("body").insertBefore(div, canvas);

    //and remove the navigation bar
    document.querySelector("#top-bar").style.display = "none";
  });

//onclick navigation - button events
document
  .querySelector("#prev-page")
  .addEventListener("click", showPreviousPage);
document.querySelector("#next-page").addEventListener("click", showNextPage);
