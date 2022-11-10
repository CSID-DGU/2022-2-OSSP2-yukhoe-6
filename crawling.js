const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;


//getHtml 함수는 axios.get의 인자로 전달받은 페이지에서 html 파일을 가져옴 

// https://www.wevity.com/?c=find&s=1&gub=1&cidx=20 공모전 목록 제공하는 사이트 
const getHtml = async () => {
  try {
    return await axios.get("https://www.wevity.com/?c=find&s=1&gub=1&cidx=20");
  } catch (error) {
    console.error(error);
  }
};

//


var crawl = getHtml()
  .then(html => {
    let ulList = [];
    //사이트에서 html을 가져와서 cheerio 객체로 반환 
    const $ = cheerio.load(html.data);
    //cheerio 객채에서 클래스가 bg인 li의 자손중 클래스가 tit인 div 반환 
    const $bodyList = $('li.bg').children('div.tit');

    //each로 bodyList의 각 요소에 대해 콜백함수를 실행함 
    $bodyList.each(function(i, elem) {

        // 그 내용을 지금 ulList에 json 형태로 저장하는거임 
      ulList[i] = {
        //find의 인자로 html selector를 받아서 해당 태그를 반환함 
          title: $(this).find('a').text(),
          url: `https://www.wevity.com/`+$(this).find('a').attr('href'),
      };
    });
    //console.log(ulList);

    const data = ulList.filter(n => n.title);
    console.log(data);
    return data;
  });
  // .then(res => log(res));

  module.exports=crawl;