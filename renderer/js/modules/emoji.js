var j = (e, t, n) => {
  for (var r = n || 0, i = (e || []).length; i > r; r++) if (e[r] == t) return r;
  return -1;
}

var inArray = (e,t) => {
  return -1 != j(t,e)
}

var imgEmoji = {
      'D83DDE15': 1,
      'D83DDE1F': 1,
      'D83DDE2E': 1,
      'D83DDE34': 1
    },
    cssEmoji = {
      'D83DDE0A': [0, ':-)'], 'D83DDE03': [1, ':-D'], 'D83DDE09': [2, ';-)'], 'D83DDE06': [3, 'xD'],
      'D83DDE1C': [4, ';-P'], 'D83DDE0B': [5, ':-p'], 'D83DDE0D': [6, '8-)'], 'D83DDE0E': [7, 'B-)'],
      'D83DDE12': [8, ':-('], 'D83DDE0F': [9, ';-]'], 'D83DDE14': [10, '3('], 'D83DDE22': [11, ':\'('],
      'D83DDE2D': [12, ':_('], 'D83DDE29': [13, ':(('], 'D83DDE28': [14, ':o'], 'D83DDE10': [15, ':|'],
      'D83DDE0C': [16, '3-)'], 'D83DDE20': [17, '>('], 'D83DDE21': [18, '>(('], 'D83DDE07': [19, 'O:)'],
      'D83DDE30': [20, ';o'], 'D83DDE33': [21, '8|'], 'D83DDE32': [22, '8o'], 'D83DDE37': [23, ':X'],
      'D83DDE1A': [24, ':-*'], 'D83DDE08': [25, '}:)'], '2764': [26 , '<3'], 'D83DDC4D': [27, ':like:'],
      'D83DDC4E': [28, ':dislike:'], '261D': [29, ':up:'], '270C': [30, ':v:'], 'D83DDC4C': [31, ':ok:']
    },
    EMOJI_SPRITES_NUM = 3,
    emojiJoiners = ["2640", "2642", "200D", "200C"],
    emojiWithJoiners = ["D83DDC71200D2640FE0F","D83DDC6E200D2640FE0F","D83DDC77200D2640FE0F","D83DDD75200D2640FE0F",
                        "D83DDE47200D2640FE0F","D83DDC81200D2642FE0F","D83DDE45200D2642FE0F","D83DDE46200D2642FE0F",
                        "D83DDE4E200D2642FE0F","D83DDE4D200D2642FE0F","D83DDC86200D2642FE0F","D83DDC87200D2642FE0F",
                        "D83DDEB6200D2640FE0F","D83CDFC3200D2640FE0F","D83CDFCB200D2640FE0F","26F9200D2640FE0F",
                        "D83CDFC4200D2640FE0F","D83CDFCA200D2640FE0F","D83DDEB5200D2640FE0F","D83DDEB4200D2640FE0F",
                        "D83DDC6F200D2642FE0F","D83CDFCC200D2640FE0F","D83DDE4B200D2642FE0F","D83DDC73200D2640FE0F",
                        "D83DDC82200D2640FE0F","D83CDFF3200DD83CDF08FE0F","D83EDD26D83CDFFB200D2642FE0F",
                        "D83EDD37D83CDFFB200D2640FE0F","D83EDD37D83CDFFB200D2642FE0F","D83EDD3DD83CDFFB200D2642FE0F",
                        "D83EDD3DD83CDFFB200D2640FE0F","D83EDD3ED83CDFFB200D2642FE0F","D83EDD3C200D2642FE0F",
                        "D83EDD38D83CDFFB200D2642FE0F","D83EDD37200D2642FE0F","D83EDD37D83CDFFC200D2642FE0F",
                        "D83EDD37D83CDFFD200D2642FE0F","D83EDD37D83CDFFE200D2642FE0F","D83EDD37D83CDFFF200D2642FE0F",
                        "D83EDD26200D2642FE0F","D83EDD26D83CDFFC200D2642FE0F","D83EDD26D83CDFFD200D2642FE0F",
                        "D83EDD26D83CDFFE200D2642FE0F","D83EDD26D83CDFFF200D2642FE0F","D83EDD37200D2640FE0F",
                        "D83EDD37D83CDFFC200D2640FE0F","D83EDD37D83CDFFD200D2640FE0F","D83EDD37D83CDFFE200D2640FE0F",
                        "D83EDD37D83CDFFF200D2640FE0F","D83EDD3D200D2642FE0F","D83EDD3DD83CDFFC200D2642FE0F",
                        "D83EDD3DD83CDFFD200D2642FE0F","D83EDD3DD83CDFFE200D2642FE0F","D83EDD3DD83CDFFF200D2642FE0F",
                        "D83EDD3D200D2640FE0F","D83EDD3DD83CDFFC200D2640FE0F","D83EDD3DD83CDFFD200D2640FE0F",
                        "D83EDD3DD83CDFFE200D2640FE0F","D83EDD3DD83CDFFF200D2640FE0F","D83EDD3E200D2642FE0F",
                        "D83EDD3ED83CDFFC200D2642FE0F","D83EDD3ED83CDFFD200D2642FE0F","D83EDD3ED83CDFFE200D2642FE0F",
                        "D83EDD3ED83CDFFF200D2642FE0F","D83EDD38200D2642FE0F","D83EDD38D83CDFFC200D2642FE0F",
                        "D83EDD38D83CDFFD200D2642FE0F","D83EDD38D83CDFFE200D2642FE0F","D83EDD38D83CDFFF200D2642FE0F",
                        "D83EDD19D83CDFFB","D83EDD19D83CDFFC","D83EDD19D83CDFFD","D83EDD19D83CDFFE","D83EDD19D83CDFFF",
                        "D83EDD1BD83CDFFB","D83EDD1BD83CDFFC","D83EDD1BD83CDFFD","D83EDD1BD83CDFFE","D83EDD1BD83CDFFF",
                        "D83EDD1CD83CDFFB","D83EDD1CD83CDFFC","D83EDD1CD83CDFFD","D83EDD1CD83CDFFE","D83EDD1CD83CDFFF",
                        "D83EDD26200D2640FE0F","D83EDD39200D2642FE0F","D83EDD39200D2640FE0F","D83DDC68200DD83DDE92FE0F",
                        "D83DDC69200DD83DDE92FE0F","D83DDC68200DD83CDFA4FE0F","D83DDC69200DD83CDFA4FE0F","D83DDC68200D2695FE0F",
                        "D83DDC69200D2695FE0F","D83DDC68200DD83CDF93FE0F","D83DDC69200DD83CDF93FE0F","D83DDC68200DD83CDFEBFE0F",
                        "D83DDC69200DD83CDFEBFE0F","D83DDC68200D2696FE0F","D83DDC69200D2696FE0F","D83DDC68200DD83CDF3EFE0F",
                        "D83DDC69200DD83CDF3EFE0F","D83DDC68200DD83CDF73FE0F","D83DDC69200DD83CDF73FE0F","D83DDC68200DD83DDD27FE0F",
                        "D83DDC69200DD83DDD27FE0F","D83DDC68200DD83CDFEDFE0F","D83DDC69200DD83CDFEDFE0F","D83DDC68200DD83DDCBCFE0F",
                        "D83DDC69200DD83DDCBCFE0F","D83DDC68200DD83DDD2CFE0F","D83DDC69200DD83DDD2CFE0F","D83DDC68200DD83DDCBBFE0F",
                        "D83DDC69200DD83DDCBBFE0F","D83DDC68200DD83CDFA8FE0F","D83DDC69200DD83CDFA8FE0F","D83DDC68200D2708FE0F",
                        "D83DDC69200D2708FE0F","D83DDC68200DD83DDE80FE0F","D83DDC69200DD83DDE80FE0F"];

var isEmoji = txt => {
  return txt.match(/((?:[\u203C\u2049\u2122\u2328\u2601\u260E\u261d\u2626\u262A\u2638\u2639\u263a\u267B\u267F\u2702\u2708]|[\u2600\u26C4\u26BE\u2705\u2764]|[\u2194-\u2199\u21AA\u21A9]|[\u231A-\u231B]|[\u23E9-\u23EF]|[\u23F0-\u23F4]|[\u23F8-\u23FA]|[\u24C2]|[\u25AA-\u25AB]|[\u25B6\u25C0]|[\u25FB-\u25FE]|[\u2602-\u2618]|[\u2648-\u2653]|[\u2660-\u2668]|[\u26A0-\u26FA]|[\u2692-\u269C]|[\u262E-\u262F]|[\u2622-\u2623]|[\u2709-\u2764]|[\u2795-\u2797]|[\u27A1]|[\u27BF]|[\u2934-\u2935]|[\u2B05-\u2B07]|[\u2B1B]|[\u2B50\u2B55]|[\u303D]|[\u3297\u3299]|[\uE000-\uF8FF]|[\uD83D\uD83C\uD83E][\uDC00-\uDFFF]|[0-9]\u20E3|[\u0023-\u0039\u203C-\u21AA\u1F3F3]\uFE0F\u20E3|[\u200C\u200D\u2640\u2642\uFE0F])+)/g);
};

var codeToChr = code => {
  let len = Math.round(code.length / 4),
      chr = '', i = 0;
  
  while(len--) {
    chr += String.fromCharCode(parseInt(code.substr(i, 4), 16))
    i += 4;
  }
  
  return chr;
}

var Emoji = {
  getEmojiHTML: function(code, symbol, enabled, is_tab) {

  if (code.match('2640|2642|200D|200C', 'g')) {
    code = code.replace('FE0F', '') + 'FE0F';

    if (!inArray(code, emojiWithJoiners)) {
      var smiles = code.replace('FE0F', '').split('/2640|2642|200D|200C/g');
      var out = '';
      for(var i = 0; i < smiles.length; i++) {
        if (!smiles[i]) {
          continue;
        }
        out += Emoji.getEmojiHTML(smiles[i], codeToChr(smiles[i]), enabled, is_tab);
      }
      return out;
    } else if (symbol) {
      symbol = symbol.replace(/\uFE0F/g, '');
      symbol += codeToChr('FE0F');
    }
  }

  var editable = '';
  if (cssEmoji[code] != undefined) {
    var num = -cssEmoji[code][0] * 17;
    return '<img'+editable+' src="https://vk.com/images/blank.gif" emoji="'+code+'" '+(symbol ? 'alt="'+symbol+'"' : symbol)+' class="emoji_css" style="background-position: 0px '+num+'px;" />';
  } else {
    if (!imgEmoji[code] && symbol && !enabled) {
      return symbol;
    } else if (is_tab) {
      var code_lower_case = code.toLowerCase();
      var spriteId = parseInt(code_lower_case, 16) % EMOJI_SPRITES_NUM;
      return '<i class="emoji emoji_sprite_' + spriteId + ' emoji_' + code_lower_case + '" emoji="' + code + '" '+(symbol ? 'alt="'+symbol+'"' : '')+'></i>';
    } else {
      return '<img class="emoji" '+(symbol ? 'alt="'+symbol+'"' : '')+' src="https://vk.com/images/emoji/'+code+'.png" />';
    }
  }
},
  emojiReplace: symbolstr => {
    var i = 0;
    var buffer = '';
    var altBuffer = '';
    var num = '';
    var symbols = [];
    var codes = [];
    var collectCodes = true;
  
    if (symbolstr.match(/\uFE0F\u20E3/g)) {
      symbolstr = symbolstr.replace(/\uFE0F/g, '');
    }
  
    do {
      var num = symbolstr.charCodeAt(i++);
  
      if (!num) {
        collectCodes = false;
        continue;
      }
  
      var code = num.toString(16).toUpperCase();
      var symbol = symbolstr.charAt(i - 1);
  
      if (num == 8419) {
        var numPrevPos = i - 2;
        var numPrevChar = symbolstr.charAt(numPrevPos);
  
        codes.push('003' + numPrevChar + '20E3');
        symbols.push(numPrevChar);
  
        buffer = '';
        altBuffer = '';
        continue;
      }
  
      buffer += code;
      altBuffer += symbol;
  
      if (!symbol.match(/[0-9\uD83D\uD83C\uD83E]/)) {
        codes.push(buffer);
        symbols.push(altBuffer);
        buffer = '';
        altBuffer = '';
      }
  
    } while (collectCodes)
    
    if (buffer) {
      codes.push(buffer);
      symbols.push(altBuffer);
    }
  
    var out = '';
    var joiner = false;
    var isFlag = false;
  
    buffer = '';
    altBuffer = '';
  
    for (var i in codes) {
      var code = codes[i];
      var symbol = symbols[i];
  
      if (!code || code == 'FE0F') {
        continue;
      }
  
      if (symbol.match(/\uD83C[\uDFFB-\uDFFF]/)) { // colors
        buffer += code;
        altBuffer += symbol;
        continue;
      }
      
      if (joiner) {
        buffer += code;
        altBuffer += symbol;
        joiner = false;
        continue;
      }
      
      if (inArray(code, emojiJoiners)) { // joiners
        if (buffer) {
          joiner = true;
          buffer += code;
          altBuffer += symbol;
        } else {
          out += symbol;
        }
        isFlag = false;
        continue;
      }
      
      if (symbol.match(/\uD83C[\uDDE6-\uDDFF]/)) { // flags
        if (isFlag) {
          buffer += code;
          altBuffer += symbol;
          isFlag = false;
          continue;
        }
        isFlag = true;
      } else if (isFlag) {
        isFlag = false;
      }
  
      if (buffer) {
        if(isEmoji(altBuffer)) {
          out += Emoji.getEmojiHTML(buffer, altBuffer, true);
        } else out += altBuffer;
      }
      
      buffer = code;
      altBuffer = symbol;
    }
  
    if (buffer) {
      if(isEmoji(altBuffer)) {
        out += Emoji.getEmojiHTML(buffer, altBuffer, true);
      } else out += altBuffer;
    }
  
    return out;
  }
}

module.exports = {
  replace: Emoji.emojiReplace,
  isEmoji, 
  getEmojiHTML: Emoji.getEmojiHTML
}