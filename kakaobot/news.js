const apiKey = "9c3fb7cd082b4454ab23d6b9927bd5a9";
const apiUrl = "https://newsapi.org/v2/everything";

function getCryptoNews(coin, count) {
  if (count === undefined) count = 5;
  
  const url = `${apiUrl}?q=${encodeURIComponent(coin)}&sortBy=publishedAt&language=ko&pageSize=${count}&apiKey=${apiKey}`;
  
  try {
    const response = org.jsoup.Jsoup.connect(url)
      .ignoreContentType(true)
      .execute()
      .body();
    
    const json = JSON.parse(response);
    
    if (json.status === "error") {
      throw new Error(json.message || "API 오류 발생");
    }
    
    return formatNews(json.articles, coin);
  } catch (e) {
    return `뉴스 검색 중 오류 발생: ${e.message}`;
  }
}

function formatNews(articles, coin) {
  if (!articles || articles.length === 0) {
    return `${coin}에 관한 최신 뉴스를 찾을 수 없습니다.`;
  }

  let formattedNews = `${coin.toUpperCase()} 관련 최신 뉴스:\n\n`;
  articles.forEach((article, index) => {
    formattedNews += `${index + 1}. ${article.title}\n`;
    formattedNews += `   ${article.description || "설명 없음"}\n`;
    formattedNews += `   링크: ${article.url}\n\n`;
  });

  return formattedNews.trim();
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  const command = msg.split(" ");
  
  if (command[0] === "/news") {
    if (command.length >= 2) {
      const coin = command[1].toUpperCase();
      const news = getCryptoNews(coin);
      replier.reply(news);
    } else {
      replier.reply("코인 심볼을 입력해주세요. 예: /news KLAY");
    }
  }
}