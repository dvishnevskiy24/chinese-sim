// Сценарии живых бытовых диалогов. Уровень HSK 2-3, разговорный.
// Каждый ход NPC: { hanzi, pinyin, ru }  — фраза собеседника.
// accept: массив принимаемых ответов (пиньинь без тонов, нижний регистр).
// model: { hanzi, pinyin, ru } — образцовый ответ, что сказать.
// words: разбор ключевых слов [pinyin, ru].
// tip: подсказка, если "не знаю что сказать".

const SCENARIOS = [
  {
    id: "customs",
    icon: "🛂",
    title: "Аэропорт: паспортный контроль",
    desc: "Прилетел в Чэнду. Офицер на границе задаёт вопросы.",
    turns: [
      {
        npc: { hanzi: "你好，请出示你的护照。", pinyin: "Nǐ hǎo, qǐng chūshì nǐ de hùzhào.", ru: "Здравствуйте, предъявите ваш паспорт." },
        accept: ["hao de", "gei ni", "zhe shi wo de huzhao", "hao de gei ni", "zai zheli", "gei"],
        model: { hanzi: "好的，给你。", pinyin: "Hǎo de, gěi nǐ.", ru: "Хорошо, вот, держите." },
        words: [["hǎo de", "хорошо, ладно"], ["gěi nǐ", "вот вам / держите"], ["hùzhào", "паспорт"]],
        tip: "Просто согласись и протяни паспорт: «Hǎo de, gěi nǐ» — «Хорошо, держите»."
      },
      {
        npc: { hanzi: "你来中国做什么？", pinyin: "Nǐ lái Zhōngguó zuò shénme?", ru: "С какой целью приехали в Китай?" },
        accept: ["luyou", "wo lai luyou", "wo lai zheli luyou", "wo shi lai luyou de", "chuchai", "wo lai chuchai", "kan pengyou", "wo lai kan pengyou"],
        model: { hanzi: "我来旅游。", pinyin: "Wǒ lái lǚyóu.", ru: "Я приехал как турист (путешествовать)." },
        words: [["lái", "приехать / прибыть"], ["lǚyóu", "туризм, путешествовать"], ["chūchāi", "командировка"], ["kàn péngyou", "навестить друзей"]],
        tip: "Назови цель: туризм — «Wǒ lái lǚyóu». Командировка — «Wǒ lái chūchāi»."
      },
      {
        npc: { hanzi: "你打算在中国待多久？", pinyin: "Nǐ dǎsuàn zài Zhōngguó dāi duōjiǔ?", ru: "Как долго планируете пробыть в Китае?" },
        accept: ["yi ge xingqi", "liang ge xingqi", "shi tian", "yi ge yue", "wo dasuan dai yi ge xingqi", "yi zhou", "liang zhou"],
        model: { hanzi: "大概两个星期。", pinyin: "Dàgài liǎng ge xīngqī.", ru: "Примерно две недели." },
        words: [["dǎsuàn", "планировать, намереваться"], ["dāi", "оставаться, пробыть"], ["duōjiǔ", "как долго"], ["dàgài", "примерно"], ["xīngqī", "неделя"]],
        tip: "Назови срок: «две недели» — «liǎng ge xīngqī», «десять дней» — «shí tiān», «месяц» — «yí ge yuè»."
      },
      {
        npc: { hanzi: "你住在哪里？有酒店地址吗？", pinyin: "Nǐ zhù zài nǎlǐ? Yǒu jiǔdiàn dìzhǐ ma?", ru: "Где остановитесь? Есть адрес отеля?" },
        accept: ["you", "you dizhi", "zai zheli", "wo zhu zai jiudian", "dizhi zai zheli", "wo you dizhi"],
        model: { hanzi: "有，地址在这里。", pinyin: "Yǒu, dìzhǐ zài zhèlǐ.", ru: "Есть, вот адрес." },
        words: [["zhù", "жить, останавливаться"], ["jiǔdiàn", "отель"], ["dìzhǐ", "адрес"], ["zài zhèlǐ", "здесь, вот"]],
        tip: "Подтверди и покажи бронь: «Yǒu, dìzhǐ zài zhèlǐ» — «Есть, вот адрес»."
      },
      {
        npc: { hanzi: "好了，欢迎来到中国。", pinyin: "Hǎo le, huānyíng lái dào Zhōngguó.", ru: "Готово, добро пожаловать в Китай." },
        accept: ["xiexie", "xie xie", "xiexie ni", "hao de xiexie", "duo xie"],
        model: { hanzi: "谢谢！", pinyin: "Xièxie!", ru: "Спасибо!" },
        words: [["huānyíng", "добро пожаловать"], ["xièxie", "спасибо"]],
        tip: "Просто поблагодари: «Xièxie!»"
      }
    ]
  },

  {
    id: "taxi",
    icon: "🚕",
    title: "Такси из аэропорта",
    desc: "Садишься в такси, едешь в отель в центре.",
    turns: [
      {
        npc: { hanzi: "你好，去哪儿？", pinyin: "Nǐ hǎo, qù nǎr?", ru: "Здравствуйте, куда едем?" },
        accept: ["qu jiudian", "wo qu jiudian", "qu zhege jiudian", "qu shizhongxin", "qu zheli", "dao zhege dizhi", "qu zhege dizhi"],
        model: { hanzi: "麻烦去这个酒店，地址在这儿。", pinyin: "Máfan qù zhège jiǔdiàn, dìzhǐ zài zhèr.", ru: "Пожалуйста, в этот отель, вот адрес." },
        words: [["qù", "ехать / идти в"], ["máfan", "будьте добры / затруднить"], ["zhège", "этот"], ["zài zhèr", "здесь, вот"]],
        tip: "Назови место и покажи адрес: «Máfan qù zhège jiǔdiàn» — «Будьте добры, в этот отель»."
      },
      {
        npc: { hanzi: "行，走高速可以吗？会快一点。", pinyin: "Xíng, zǒu gāosù kěyǐ ma? Huì kuài yìdiǎn.", ru: "Ок. По платной трассе можно? Будет быстрее." },
        accept: ["keyi", "hao", "hao de", "keyi zou gaosu", "xing", "mei wenti", "keyi keyi"],
        model: { hanzi: "可以，走高速吧。", pinyin: "Kěyǐ, zǒu gāosù ba.", ru: "Можно, поехали по трассе." },
        words: [["zǒu gāosù", "ехать по скоростной/платной трассе"], ["kěyǐ", "можно"], ["kuài yìdiǎn", "побыстрее"], ["ba", "частица предложения/согласия"]],
        tip: "Согласись: «Kěyǐ, zǒu gāosù ba» — «Можно, давайте по трассе»."
      },
      {
        npc: { hanzi: "你从哪个国家来的？中文说得不错啊！", pinyin: "Nǐ cóng nǎge guójiā lái de? Zhōngwén shuō de búcuò a!", ru: "Из какой вы страны? А неплохо говорите по-китайски!" },
        accept: ["wo cong eluosi lai de", "eluosi", "wo shi eluosi ren", "nali nali", "nalinali", "wo cong eluosi lai", "xiexie"],
        model: { hanzi: "我从俄罗斯来的，哪里哪里。", pinyin: "Wǒ cóng Èluósī lái de, nǎli nǎli.", ru: "Я из России. Ну что вы (скромный ответ на похвалу)." },
        words: [["cóng… lái de", "приехать из…"], ["Èluósī", "Россия"], ["guójiā", "страна"], ["nǎli nǎli", "«да ну что вы» — вежливый ответ на комплимент"]],
        tip: "Скажи, откуда ты, и вежливо отмахнись от похвалы: «Wǒ cóng Èluósī lái de, nǎli nǎli»."
      },
      {
        npc: { hanzi: "到了，一共一百二十块。", pinyin: "Dào le, yígòng yìbǎi èrshí kuài.", ru: "Приехали, всего 120 юаней." },
        accept: ["keyi weixin ma", "keyi shua ka ma", "gei ni", "hao de gei ni", "keyi yong weixin ma", "weixin keyi ma", "sao ma keyi ma"],
        model: { hanzi: "好的，可以用微信支付吗？", pinyin: "Hǎo de, kěyǐ yòng Wēixìn zhīfù ma?", ru: "Хорошо. Можно оплатить через WeChat?" },
        words: [["dào le", "приехали, на месте"], ["yígòng", "всего, итого"], ["kuài", "юань (разг.)"], ["zhīfù", "оплатить"], ["Wēixìn", "WeChat"]],
        tip: "Уточни способ оплаты: «Kěyǐ yòng Wēixìn zhīfù ma?» — «Можно оплатить через WeChat?»"
      }
    ]
  },

  {
    id: "hotel",
    icon: "🏨",
    title: "Заселение в отель",
    desc: "На ресепшене отеля, регистрируешься.",
    turns: [
      {
        npc: { hanzi: "您好，请问有预订吗？", pinyin: "Nín hǎo, qǐngwèn yǒu yùdìng ma?", ru: "Здравствуйте, у вас есть бронь?" },
        accept: ["you", "you yuding", "you wo yuding le", "wo yuding le", "yuding le", "you de"],
        model: { hanzi: "有，我预订了。", pinyin: "Yǒu, wǒ yùdìng le.", ru: "Да, я бронировал." },
        words: [["nín", "Вы (вежливое)"], ["qǐngwèn", "позвольте спросить"], ["yùdìng", "бронировать / бронь"]],
        tip: "Подтверди бронь: «Yǒu, wǒ yùdìng le» — «Да, я бронировал»."
      },
      {
        npc: { hanzi: "请给我看一下您的护照。", pinyin: "Qǐng gěi wǒ kàn yíxià nín de hùzhào.", ru: "Покажите, пожалуйста, ваш паспорт." },
        accept: ["hao de gei ni", "gei ni", "zhe shi wo de huzhao", "gei nin", "hao de"],
        model: { hanzi: "好的，给你。", pinyin: "Hǎo de, gěi nǐ.", ru: "Хорошо, вот." },
        words: [["kàn yíxià", "взглянуть, посмотреть"], ["yíxià", "чуть-чуть / разок (смягчает просьбу)"], ["gěi nǐ", "вот вам"]],
        tip: "Дай паспорт: «Hǎo de, gěi nǐ»."
      },
      {
        npc: { hanzi: "您订的是大床房，住两晚，对吗？", pinyin: "Nín dìng de shì dàchuáng fáng, zhù liǎng wǎn, duì ma?", ru: "Вы бронировали номер с двуспальной кроватью на две ночи, верно?" },
        accept: ["dui", "dui de", "shi de", "dui shi zheyang", "mei cuo", "dui liang wan"],
        model: { hanzi: "对，没错。", pinyin: "Duì, méicuò.", ru: "Да, всё верно." },
        words: [["dìng", "бронировать"], ["dàchuáng fáng", "номер с большой кроватью"], ["zhù… wǎn", "жить … ночей"], ["duì", "верно"], ["méicuò", "точно, всё так"]],
        tip: "Подтверди: «Duì, méicuò» — «Да, всё верно»."
      },
      {
        npc: { hanzi: "早餐在二楼，早上七点到十点。", pinyin: "Zǎocān zài èr lóu, zǎoshang qī diǎn dào shí diǎn.", ru: "Завтрак на втором этаже, с 7 до 10 утра." },
        accept: ["hao de xiexie", "zhidao le", "hao de", "mingbai le", "xiexie", "hao de zhidao le"],
        model: { hanzi: "好的，知道了，谢谢。", pinyin: "Hǎo de, zhīdào le, xièxie.", ru: "Хорошо, понял, спасибо." },
        words: [["zǎocān", "завтрак"], ["lóu", "этаж"], ["diǎn", "час (времени)"], ["zhīdào le", "понял, ясно"]],
        tip: "Прими к сведению: «Hǎo de, zhīdào le, xièxie»."
      },
      {
        npc: { hanzi: "这是您的房卡，房间在八楼。", pinyin: "Zhè shì nín de fángkǎ, fángjiān zài bā lóu.", ru: "Вот ваша карта-ключ, номер на восьмом этаже." },
        accept: ["xiexie", "hao de xiexie", "dianti zai nali", "qingwen dianti zai nali", "xiexie dianti zai nali"],
        model: { hanzi: "谢谢，请问电梯在哪里？", pinyin: "Xièxie, qǐngwèn diàntī zài nǎlǐ?", ru: "Спасибо, а где лифт?" },
        words: [["fángkǎ", "карта-ключ"], ["fángjiān", "номер, комната"], ["diàntī", "лифт"], ["zài nǎlǐ", "где находится"]],
        tip: "Поблагодари и спроси про лифт: «Xièxie, qǐngwèn diàntī zài nǎlǐ?»"
      }
    ]
  },

  {
    id: "restaurant",
    icon: "🍜",
    title: "Ресторан / кафе",
    desc: "Заказываешь еду, уточняешь остроту, платишь.",
    turns: [
      {
        npc: { hanzi: "欢迎光临，几位？", pinyin: "Huānyíng guānglín, jǐ wèi?", ru: "Добро пожаловать, сколько вас человек?" },
        accept: ["yi ge ren", "wo yi ge ren", "jiu wo yi ge", "yi wei", "liang ge ren", "wo ziji"],
        model: { hanzi: "就我一个人。", pinyin: "Jiù wǒ yí ge rén.", ru: "Только я один." },
        words: [["huānyíng guānglín", "добро пожаловать (в заведение)"], ["jǐ wèi", "сколько человек (вежл.)"], ["jiù", "всего лишь, только"], ["yí ge rén", "один человек"]],
        tip: "Назови число: «Jiù wǒ yí ge rén» — «Только я один» / «liǎng ge rén» — двое."
      },
      {
        npc: { hanzi: "您想吃点什么？", pinyin: "Nín xiǎng chī diǎn shénme?", ru: "Что желаете поесть?" },
        accept: ["wo yao zhege", "wo yao yi ge zhege", "lai yi ge zhege", "wo xiang chi zhege", "zhege", "gei wo zhege"],
        model: { hanzi: "我要一个这个，还有一碗米饭。", pinyin: "Wǒ yào yí ge zhège, hái yǒu yì wǎn mǐfàn.", ru: "Мне вот это и ещё миску риса." },
        words: [["xiǎng", "хотеть"], ["yào", "хотеть, заказать, взять"], ["hái yǒu", "и ещё"], ["yì wǎn", "одна миска"], ["mǐfàn", "варёный рис"]],
        tip: "Покажи в меню и скажи «Wǒ yào yí ge zhège» — «Мне вот это». Рис — «yì wǎn mǐfàn»."
      },
      {
        npc: { hanzi: "要辣的吗？我们可以做微辣。", pinyin: "Yào là de ma? Wǒmen kěyǐ zuò wēi là.", ru: "Острое будете? Можем сделать слабо-острым." },
        accept: ["bu yao la", "wei la keyi", "yao wei la", "bu la", "wo bu chi la", "wei la jiu hao", "yidian la keyi"],
        model: { hanzi: "微辣就好，谢谢。", pinyin: "Wēi là jiù hǎo, xièxie.", ru: "Слабо-острое — в самый раз, спасибо." },
        words: [["là", "острый"], ["wēi là", "слабо-острый"], ["bù là", "не острый"], ["jiù hǎo", "и хорошо / достаточно"]],
        tip: "Выбери остроту: «Wēi là jiù hǎo» — слабо-остро. Совсем без остроты — «Bú yào là»."
      },
      {
        npc: { hanzi: "喝点什么？", pinyin: "Hē diǎn shénme?", ru: "Что будете пить?" },
        accept: ["yi ping shui", "wo yao yi ping shui", "lai yi ping shui", "yi bei cha", "kele", "yi ping kele", "shui jiu hao"],
        model: { hanzi: "来一瓶水就行。", pinyin: "Lái yì píng shuǐ jiù xíng.", ru: "Одну бутылку воды, и хватит." },
        words: [["hē", "пить"], ["lái", "«дайте / принесите» (при заказе)"], ["yì píng", "одна бутылка"], ["shuǐ", "вода"], ["jiù xíng", "и сойдёт, достаточно"]],
        tip: "Закажи напиток: «Lái yì píng shuǐ» — воды. Чай — «yì bēi chá»."
      },
      {
        npc: { hanzi: "吃好了吗？需要买单吗？", pinyin: "Chī hǎo le ma? Xūyào mǎidān ma?", ru: "Наелись? Счёт принести?" },
        accept: ["mai dan", "maidan", "yao maidan", "qing maidan", "keyi maidan", "mai dan xiexie", "hao le maidan"],
        model: { hanzi: "吃好了，麻烦买单。", pinyin: "Chī hǎo le, máfan mǎidān.", ru: "Да, наелся, счёт, пожалуйста." },
        words: [["chī hǎo le", "наелся, поел"], ["xūyào", "нужно ли"], ["mǎidān", "счёт / рассчитаться"], ["máfan", "будьте добры"]],
        tip: "Попроси счёт: «Máfan mǎidān» — «Счёт, пожалуйста»."
      }
    ]
  },

  {
    id: "shop",
    icon: "🛍️",
    title: "Магазин / покупки",
    desc: "Покупаешь воду и симку, торгуешься на рынке.",
    turns: [
      {
        npc: { hanzi: "您好，需要点什么？", pinyin: "Nín hǎo, xūyào diǎn shénme?", ru: "Здравствуйте, что вам нужно?" },
        accept: ["wo yao mai shui", "wo xiang mai dianhuaka", "wo yao mai dianhuaka", "mai shui", "wo zhao dianhuaka", "wo yao sim ka"],
        model: { hanzi: "我想买一张电话卡。", pinyin: "Wǒ xiǎng mǎi yì zhāng diànhuàkǎ.", ru: "Я хочу купить сим-карту." },
        words: [["xūyào", "нужно"], ["mǎi", "покупать"], ["yì zhāng", "одна штука (для плоских: карт, билетов)"], ["diànhuàkǎ", "сим-карта"]],
        tip: "Скажи, что хочешь купить: «Wǒ xiǎng mǎi yì zhāng diànhuàkǎ» — «Хочу сим-карту»."
      },
      {
        npc: { hanzi: "要多少流量的？", pinyin: "Yào duōshǎo liúliàng de?", ru: "Сколько гигабайт (трафика) нужно?" },
        accept: ["duo yidian", "yue duo yue hao", "gou yong yi ge yue jiu hao", "bu zhidao", "you shenme tuican", "yueduoyuehao"],
        model: { hanzi: "够用一个月就好，你推荐哪个？", pinyin: "Gòu yòng yí ge yuè jiù hǎo, nǐ tuījiàn nǎge?", ru: "Чтоб хватило на месяц, что посоветуете?" },
        words: [["liúliàng", "трафик, гигабайты"], ["gòu yòng", "хватит на"], ["yí ge yuè", "один месяц"], ["tuījiàn", "рекомендовать"]],
        tip: "Опиши потребность и спроси совет: «Gòu yòng yí ge yuè jiù hǎo, nǐ tuījiàn nǎge?»"
      },
      {
        npc: { hanzi: "这个套餐一百块，包含很多流量。", pinyin: "Zhège tàocān yìbǎi kuài, bāohán hěn duō liúliàng.", ru: "Этот тариф 100 юаней, включает много трафика." },
        accept: ["keyi pianyi yidian ma", "tai gui le", "you pianyi de ma", "neng bu neng pianyi dian", "pianyi dian ba", "keyi shao yidian ma"],
        model: { hanzi: "能不能便宜一点？", pinyin: "Néng bu néng piányi yìdiǎn?", ru: "Можно чуть подешевле?" },
        words: [["tàocān", "тариф, комплект"], ["bāohán", "включать"], ["néng bu néng", "можно ли"], ["piányi", "дёшево / дешевле"], ["yìdiǎn", "чуть-чуть"]],
        tip: "Поторгуйся: «Néng bu néng piányi yìdiǎn?» — «Можно подешевле?»"
      },
      {
        npc: { hanzi: "行吧，给你算九十。", pinyin: "Xíng ba, gěi nǐ suàn jiǔshí.", ru: "Ладно, посчитаю за 90." },
        accept: ["hao wo yao zhege", "hao de", "keyi wo yao le", "hao jiu zhege", "xing wo yao", "hao de wo yao"],
        model: { hanzi: "好，那我要这个。", pinyin: "Hǎo, nà wǒ yào zhège.", ru: "Хорошо, тогда беру этот." },
        words: [["xíng ba", "ну ладно"], ["suàn", "посчитать (цену)"], ["nà", "тогда, в таком случае"], ["yào", "брать, хотеть"]],
        tip: "Соглашайся на сделку: «Hǎo, nà wǒ yào zhège» — «Хорошо, тогда беру»."
      }
    ]
  },

  {
    id: "directions",
    icon: "🧭",
    title: "Спросить дорогу / метро",
    desc: "Потерялся, спрашиваешь дорогу и как доехать.",
    turns: [
      {
        npc: { hanzi: "你好像在找路，需要帮忙吗？", pinyin: "Nǐ hǎoxiàng zài zhǎo lù, xūyào bāngmáng ma?", ru: "Вы, кажется, ищете дорогу — помочь?" },
        accept: ["qingwen ditiezhan zai nali", "ditiezhan zai nali", "zenme qu ditiezhan", "qingwen zenme qu ditiezhan", "wo zhao ditiezhan", "ditie zai nar"],
        model: { hanzi: "请问地铁站在哪里？", pinyin: "Qǐngwèn dìtiězhàn zài nǎlǐ?", ru: "Подскажите, где станция метро?" },
        words: [["hǎoxiàng", "кажется, как будто"], ["zhǎo lù", "искать дорогу"], ["bāngmáng", "помогать"], ["dìtiězhàn", "станция метро"]],
        tip: "Спроси про метро: «Qǐngwèn dìtiězhàn zài nǎlǐ?» — «Где станция метро?»"
      },
      {
        npc: { hanzi: "一直往前走，到路口右拐就能看到。", pinyin: "Yìzhí wǎng qián zǒu, dào lùkǒu yòu guǎi jiù néng kàndào.", ru: "Идите прямо, на перекрёстке направо — и увидите." },
        accept: ["yuan ma", "yuan bu yuan", "zou lu yao duo jiu", "yao duo chang shijian", "yuan ma zou lu", "zou guoqu yuan ma"],
        model: { hanzi: "远吗？走路要多久？", pinyin: "Yuǎn ma? Zǒulù yào duōjiǔ?", ru: "Далеко? Сколько идти пешком?" },
        words: [["yìzhí wǎng qián zǒu", "идти всё время прямо"], ["lùkǒu", "перекрёсток"], ["yòu guǎi", "повернуть направо"], ["yuǎn", "далеко"], ["zǒulù", "идти пешком"]],
        tip: "Уточни расстояние: «Yuǎn ma? Zǒulù yào duōjiǔ?» — «Далеко? Сколько идти?»"
      },
      {
        npc: { hanzi: "不远，走路五分钟就到。", pinyin: "Bù yuǎn, zǒulù wǔ fēnzhōng jiù dào.", ru: "Недалеко, пешком минут пять." },
        accept: ["tai hao le xiexie", "xiexie ni", "haode xiexie", "mingbai le xiexie", "xiexie bangmang"],
        model: { hanzi: "太好了，谢谢你！", pinyin: "Tài hǎo le, xièxie nǐ!", ru: "Отлично, спасибо большое!" },
        words: [["bù yuǎn", "недалеко"], ["fēnzhōng", "минута"], ["jiù dào", "и уже на месте"], ["tài hǎo le", "отлично, супер"]],
        tip: "Поблагодари: «Tài hǎo le, xièxie nǐ!»"
      }
    ]
  }
];
