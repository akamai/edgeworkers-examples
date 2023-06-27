import { HtmlRewritingStream } from 'html-rewriter';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
export async function responseProvider(request) {

  let jsonresponse = await httpRequest('/menujson');
  let menujson = await jsonresponse.json();

  let rewriter = new HtmlRewritingStream();
  rewriter.onElement('section', el => {
    el.before(`<h2>${menujson[0].name}</h2>`);
    el.after(`<article class="item"><p class="coffee">${menujson[0].items[3].item}</p><p class="mocha">${menujson[0].items[3].price}</p></article>`);
    el.prepend(`<article class="item"><p class="coffee">${menujson[0].items[2].item}</p><p class="latte">${menujson[0].items[2].price}</p></article>`);
    el.append(`<article class="item"><p class="coffee">${menujson[0].items[1].item}</p><p class="espresso">${menujson[0].items[1].price}</p></article>`);
    el.replaceChildren(`<article class="item"><p class="coffee">${menujson[0].items[0].item}</p><p class="americano">${menujson[0].items[0].price}</p></article>`);
  });

  if(getLoggedInUser(request)){
    rewriter.onElement('h1', el => {
      el.after('<p class="offer">Special 20% discount member offer applied!</p>');
    });
  }

  let subrequestHeaders = {"X-Subrequest": ["true"]};
  let htmlResponse = await httpRequest("/template", {headers: subrequestHeaders});
  if (!htmlResponse.ok) {
    return createResponse(500, {}, `Failed to fetch doc: ${htmlResponse.status}`);
  }
  return createResponse(200, {}, htmlResponse.body.pipeThrough(rewriter));
}

function getLoggedInUser(){
  //your logic for logged in users
}