const scriptName = "CRYPTO_BOT";
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

const coinLists = {
  upbit: ['SAND', 'BTC', 'ETH', 'NEO', 'MTL', 'LTC', 'XRP', 'ETC', 'OMG', 'SNT', 'WAVES', 'XEM', 'QTUM', 'LSK', 'STEEM', 'XLM', 'ARDR', 'KMD', 'ARK', 'STORJ', 'GRS', 'REP', 'EMC2', 'ADA', 'SBD', 'POWR', 'BTG', 'ICX', 'EOS', 'TRX', 'SC', 'GTO', 'IGNIS', 'ONT', 'ZIL', 'POLY', 'ZRX', 'SRN', 'LOOM', 'BCH', 'ADX', 'BAT', 'IOST', 'DMT', 'RFR', 'CVC', 'IQ', 'IOTA', 'OST', 'MFT', 'ONG', 'GAS', 'UPP', 'ELF', 'KNC', 'BSV', 'THETA', 'EDR', 'QKC', 'BTT', 'MOC', 'ENJ', 'TFUEL', 'MANA', 'ANKR', 'NPXS', 'AERGO', 'ATOM', 'TT', 'CRE', 'SOLVE', 'MBL', 'TSHP', 'WAXP', 'HBAR', 'MED', 'MLK', 'STPT', 'ORBS', 'VET', 'CHZ', 'PXL', 'STMX', 'DKA', 'HIVE', 'KAVA', 'AHT', 'SPND', 'LINK', 'XTZ', 'BORA', 'JST', 'CRO', 'TON', 'SXP', 'LAMB', 'HUNT', 'MARO', 'PLA', 'DOT', 'MVL', 'PCI', 'STRAX', 'AQT', 'BCHA', 'GLM', 'QTCON', 'SSX', 'OBSR', 'FCT2', 'LBC', 'CBK'],
  coinone: ['KLAY', 'KSP', 'FNSA', 'PIB','LUNA','MNR','TRIX','HANDY', 'SIX','FLETA','POL','STPL'],
  binance: { 'BNB': 'BNBUSDT', 'CAKE': 'CAKEUSDT', 'SUN': 'SUNUSDT','SOL':'SOLUSDT','FTT':'FTTUSDT'},
  bithumb: ['BIOT'],
  ftx: {'STEP':'STEP','MEDIA':'MEDIA','COPE':'COPE', 'SOL': 'SOL', 'SRM': 'SRM', 'RAY': 'RAY', 'FTT': 'FTT', 'FIDA': 'FIDA', 'MAPS': 'MAPS', 'MOB': 'MOB', 'BAOB': 'BAO' ,'OXY':'OXY','FIDA':'FIDA'},
  klaySwap: {'KDON':'kDON','SKAI':'sKAI','VKAI':'vKAI','BKAI':'bKAI','KSAPPLE':'ksAPPLE','KSDUNAMU':'ksDUNAMU','KSETH':'ksETH','KSCONBASE':'ksCOINBASE','KSSOL':'ksSOL'}
};

const API_KEYS = {
  CMC: '4559da4c-6fe7-412c-8c96-9f111683f2ea',
  // 다른 API 키들...
};

const API_URLS = {
  UPBIT: "https://api.upbit.com/v1/ticker?markets=KRW-",
  COINONE: "https://api.coinone.co.kr/ticker?currency=",
  NEWS_API: "https://newsapi.org/v2/everything", // 뉴스 API URL 추가
  // 다른 API URL들...
};

// 포트폴리오 코인 목록을 저장할 전역 변수
var portfolioCoins = ['KSP', 'FNSA', 'KLAY', 'BTC', 'ETH', 'XRP', 'DOT', 'LUNA', 'POL', 'SOL', 'BAT', 'BELT', 'BNB'];

// 사용자가 추가한 코인을 저장할 객체
var userAddedCoins = {
  upbit: [],
  coinone: [],
  binance: {}
};

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if (msg.startsWith("/")) {
    var command = msg.slice(1).split(" ");
    var exchange = command[0].toLowerCase();
    var coin = command[1] ? command[1].toUpperCase() : null;
    
    switch(exchange) {
      case "환율":
        replier.reply(getExchangeRate());
        break;
      case "도미":
      case "비트":
        replier.reply(getBtcDominance());
        break;
      case "삼총사":
      case "3":
        replier.reply(getTripleCoins());
        break;
      case "belt":
      case "bb":
        replier.reply(getBeltBnbInfo());
        break;
      case "포트":
        replier.reply(getPortfolio());
        break;
      case "포트추가":
        if (coin) {
          replier.reply(addToPortfolio(coin));
        } else {
          replier.reply("추가할 코인 심볼을 입력해주세요.");
        }
        break;
      case "포트삭제":
        if (coin) {
          replier.reply(removeFromPortfolio(coin));
        } else {
          replier.reply("삭제할 코인 심볼을 입력해주세요.");
        }
        break;
      case "upbit":
      case "coinone":
      case "binance":
        if (coin) {
          replier.reply(addNewCoin(exchange, coin));
        } else {
          replier.reply("추가할 코인 심볼을 입력해주세요.");
        }
        break;
      case "뉴스": // 뉴스 명령어 추가
      case "news": // 대소문자 구분 없이 처리
        if (coin) {
          replier.reply(getCryptoNews(coin));
        } else {
          replier.reply("뉴스를 검색할 코인 심볼을 입력해주세요.");
        }
        break;
      default:
        replier.reply(getCoinPrice(exchange));
    }
  }
}

// 뉴스 기능 추가
function getCryptoNews(coin) {
  const url = `${API_URLS.NEWS_API}?q=${encodeURIComponent(coin)}&sortBy=publishedAt&language=ko&apiKey=${API_KEYS.CMC}`;
  
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

function onCreate(savedInstanceState, activity) {
  //Activity가 실행될때 호출됩니다.
  // "API_KEY"를 실제 API 키로 교체하세요.
  API_KEY = 'YOUR_COINMARKETCAP_API_KEY';
}

function onStart(activity) {
  //Activity가 시작될때 호출됩니다.
}

function onResume(activity) {
  //Activity가 다시 시작될때 호출됩니다.
}

function onPause(activity) {
  //Activity가 일시정지될때 호출됩니다.
}

function onStop(activity) {
  //Activity가 종료될때 호출됩니다.
}

function fetchJson(url, headers) {
  headers = headers || {};  // headers가 undefined일 경우 빈 객체로 초기화
  try {
    var response = org.jsoup.Jsoup.connect(url)
      .headers(headers)
      .ignoreContentType(true)
      .get()
      .text();
    return JSON.parse(response);
  } catch (e) {
    return { error: true, message: "API 호출 오류: " + e.message };
  }
}

function getPrice(exchange, symbol) {
  if (exchange === 'upbit') {
    return getUpbitPrice(symbol);
  } else if (exchange === 'coinone') {
    return getCoinonePrice(symbol);
  } else if (exchange === 'binance') {
    return getBinancePrice(symbol);
  } else {
    return { error: true, message: "지원하지 않는 거래소입니다." };
  }
}

function getCoinPrice(symbol) {
  for (var exchange in coinLists) {
    var coins = coinLists[exchange].concat(userAddedCoins[exchange] || []);
    if (Array.isArray(coins) && coins.indexOf(symbol) !== -1) {
      return getPriceFromExchange(exchange, symbol);
    } else if (typeof coins === 'object' && (coins[symbol] || userAddedCoins[exchange][symbol])) {
      return getPriceFromExchange(exchange, coins[symbol] || userAddedCoins[exchange][symbol]);
    }
  }
  return "해당 코인을 찾을 수 없습니다.";
}

function getPriceFromExchange(exchange, symbol) {
  var result = getPrice(exchange, symbol);
  if (result.error) return result.message;
  var response = symbol + " : " + result.price;
  if (result.rate) {
    response += " / " + result.rate + "%";
  }
  return response;
}

function getUsdkrw() {
  var url = "https://api.exchangerate-api.com/v4/latest/USD";
  var json = fetchJson(url);
  if (json.error) return null;
  return json.rates.KRW.toFixed(2);
}

function getExchangeRate() {
  var usdkrw = getUsdkrw();
  return usdkrw ? "환율[USD-KRW] : " + usdkrw + "원" : "환율조회에러";
}

function getBtcDominance() {
  var cmc = getCmcBtc();
  if (cmc.error) return "도미넌스 조회에러";
  var binanceBtcPrice = getBinancePrice('BTCUSDT').price;
  return "BTC 도미넌스 : " + cmc.domi + "%\nBTC : " + binanceBtcPrice;
}

function getTripleCoins() {
  var kspPrice = getCoinonePrice('KSP').price;
  var fnsaPrice = getCoinonePrice('FNSA').price;
  var klayPrice = getCoinonePrice('KLAY').price;

  return "KSP : " + kspPrice + "\nFNSA : " + fnsaPrice + "\nKLAY : " + klayPrice + "\n핀클비율 : " + (fnsaPrice/klayPrice).toFixed(2);
}

function getBeltBnbInfo() {
  var beltPrice = getBeltInfo();
  var bnbPrice = getBinancePrice('BNBUSDT').price; 
  return "BELT : " + beltPrice + "\nBNB : " + bnbPrice + "\n븐벨비율 : " + (bnbPrice/beltPrice).toFixed(2);
}

function getPortfolio() {
  var prices = {};

  for (var i = 0; i < portfolioCoins.length; i++) {
    var coin = portfolioCoins[i];
    if (coinLists.upbit.indexOf(coin) !== -1) {
      prices[coin] = getUpbitPrice(coin).price;
    } else if (coinLists.coinone.indexOf(coin) !== -1) {
      prices[coin] = getCoinonePrice(coin).price;
    } else if (coinLists.binance[coin]) {
      prices[coin] = getBinancePrice(coinLists.binance[coin]).price;
    } else if (coin === 'BELT') {
      prices[coin] = getBeltInfo();
    } else {
      prices[coin] = "가격 정보 없음";
    }
  }

  // 포트폴리오 문자열 생성
  var result = "";
  for (var coin in prices) {
    result += coin + " : " + prices[coin] + "\n";
  }
  return result.trim();
}

function addToPortfolio(coin) {
  coin = coin.toUpperCase();
  if (portfolioCoins.indexOf(coin) === -1) {
    portfolioCoins.push(coin);
    return coin + "이(가) 포트폴리오에 추가되었습니다.";
  } else {
    return coin + "은(는) 이미 포트폴리오에 있습니다.";
  }
}

function removeFromPortfolio(coin) {
  coin = coin.toUpperCase();
  var index = portfolioCoins.indexOf(coin);
  if (index !== -1) {
    portfolioCoins.splice(index, 1);
    return coin + "이(가) 포트폴리오에서 삭제되었습니다.";
  } else {
    return coin + "은(는) 포트폴리오에 없습니다.";
  }
}

function addNewCoin(exchange, coin) {
  if (exchange === 'upbit' || exchange === 'coinone') {
    if (userAddedCoins[exchange].indexOf(coin) === -1) {
      userAddedCoins[exchange].push(coin);
      return coin + "이(가) " + exchange + " 거래소의 조회 가능 목록에 추가되었습니다.";
    } else {
      return coin + "은(는) 이미 " + exchange + " 거래소의 조회 가능 목록에 있습니다.";
    }
  } else if (exchange === 'binance') {
    if (!userAddedCoins[exchange][coin]) {
      userAddedCoins[exchange][coin] = coin + 'USDT';
      return coin + "이(가) Binance 거래소의 조회 가능 목록에 추가되었습니다.";
    } else {
      return coin + "은(는) 이미 Binance 거래소의 조회 가능 목록에 있습니다.";
    }
  }
  return "지원하지 않는 거래소입니다.";
}

function getCoinonePrice(symbol) {
  var url = "https://api.coinone.co.kr/ticker/?currency=" + symbol.toLowerCase();
  var json = fetchJson(url);
  if (json.error) return json;
  return {
    price: json.last,
    symbol: symbol
  };
}

function getUpbitPrice(symbol) {
  var url = "https://api.upbit.com/v1/ticker?markets=KRW-" + symbol;
  var json = fetchJson(url);
  if (json.error) return json;
  return {
    price: json[0].trade_price,
    rate: (json[0].signed_change_rate * 100).toFixed(2),
    symbol: symbol
  };
}

function getBinancePrice(symbol) {
  var url = "https://api.binance.com/api/v3/ticker/price?symbol=" + symbol;
  var json = fetchJson(url);
  if (json.error) return json;
  return {
    price: json.price,
    symbol: symbol
  };
}

function getBeltInfo() {
  var url = "https://api.belt.fi/v2/info";
  var json = fetchJson(url);
  if (json.error) return "BELT 가격 조회 실패";
  return json.beltPrice;
}