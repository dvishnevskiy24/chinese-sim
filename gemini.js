// Клиент Gemini. Ключ хранится ТОЛЬКО в localStorage телефона (в репозиторий не попадает).
// Бесплатный tier. Модель gemini-2.0-flash — быстрая и хорошо знает китайский.

const Gemini = (function(){
  const MODEL = "gemini-2.0-flash";
  const URL = m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;

  function key(){ try{ return localStorage.getItem("cs_gemini_key")||""; }catch(e){ return ""; } }
  function setKey(k){ try{ localStorage.setItem("cs_gemini_key",(k||"").trim()); }catch(e){} }
  function hasKey(){ return key().length>10; }

  // Профиль ученика + правила поведения ИИ.
  const SYSTEM = `Ты — доброжелательный носитель китайского (путунхуа), который помогает русскоязычному ученику по имени Дима практиковать ЖИВОЙ разговорный китайский. Дима — начально-средний уровень (HSK 2-3), едет в Чэнду.

Как Дима пишет ответы:
- Латиницей (пиньинь), тоны и знаки не обязательны, опечатки — норма.
- Слова, которых не знает по-китайски, он вставляет в скобках на английском или русском, например: "ni hao ni keyi bangzhu wo (get the taxi)?" — считай, будто он сказал это по-китайски, и подставь нужное слово.

Твоя задача КАЖДЫЙ ход:
1. Играй роль из блока СИТУАЦИЯ. Говори живым, разговорным китайским уровня HSK 2-3 — короткие естественные фразы, как реальный человек, а не учебник.
2. Оцени последнюю реплику Димы: понял ли ты её; правильна ли она грамматически и звучит ли естественно. Если есть ошибки или звучит неестественно — по-русски, спокойно и по-доброму объясни, как правильно. Если хорошо — коротко похвали. ВАЖНО: если Дима сказал что-то грамматически верное и уместное (даже если это не то, что ты ожидал) — засчитывай как правильное, не навязывай свой вариант.
3. Дай исправленную версию именно ЕГО фразы (fixed) и отдельно — как ту же мысль естественно выразил бы носитель (native).
4. Продолжи разговор в роли: отреагируй на то, что он реально сказал, и задай уместный встречный/уточняющий вопрос или двигай ситуацию дальше. ПОМНИ весь предыдущий контекст разговора (факты, которые Дима уже сообщил).

Правила вывода:
- Отвечай ТОЛЬКО валидным JSON по заданной схеме. Без markdown и лишнего текста.
- Все пояснения (comment_ru, ru) — на русском. Китайский — иероглифы (hanzi) + пиньинь С тонами (pinyin).
- comment_ru — кратко и по делу (1-3 предложения). Будь терпелив и поддерживай.
- words — разбор 2-5 ключевых слов из ТВОЕЙ реплики (reply), чтобы Диме было легче понять.`;

  const RESP_SCHEMA = {
    type: "OBJECT",
    properties: {
      feedback: {
        type: "OBJECT", nullable: true,
        properties: {
          understood: { type: "BOOLEAN" },
          rating: { type: "STRING", enum: ["good","ok","wrong"] },
          comment_ru: { type: "STRING" },
          fixed:  { type:"OBJECT", properties:{ hanzi:{type:"STRING"}, pinyin:{type:"STRING"}, ru:{type:"STRING"} }, required:["hanzi","pinyin","ru"] },
          native: { type:"OBJECT", properties:{ hanzi:{type:"STRING"}, pinyin:{type:"STRING"}, ru:{type:"STRING"} }, required:["hanzi","pinyin","ru"] }
        },
        required: ["understood","rating","comment_ru","fixed","native"]
      },
      reply: {
        type:"OBJECT",
        properties:{
          hanzi:{type:"STRING"}, pinyin:{type:"STRING"}, ru:{type:"STRING"},
          words:{ type:"ARRAY", items:{ type:"OBJECT", properties:{ py:{type:"STRING"}, ru:{type:"STRING"} }, required:["py","ru"] } }
        },
        required:["hanzi","pinyin","ru","words"]
      }
    },
    required: ["reply"]
  };

  async function call(contents, scene, useSchema){
    if(!hasKey()) throw new Error("NO_KEY");
    const body = {
      systemInstruction: { parts:[{ text: SYSTEM + "\n\nСИТУАЦИЯ: " + scene }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    };
    if(useSchema){ body.generationConfig.responseMimeType="application/json"; body.generationConfig.responseSchema=RESP_SCHEMA; }
    const res = await fetch(URL(MODEL)+"?key="+encodeURIComponent(key()), {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)
    });
    if(!res.ok){
      let msg = "HTTP "+res.status;
      try{ const j=await res.json(); if(j.error&&j.error.message) msg=j.error.message; }catch(e){}
      if(res.status===400 && /API key/i.test(msg)) throw new Error("BAD_KEY");
      if(res.status===429) throw new Error("RATE");
      throw new Error(msg);
    }
    const j = await res.json();
    const text = (((j.candidates||[])[0]||{}).content||{}).parts?.[0]?.text || "";
    return text;
  }

  // История разговора для Gemini: массив {role:"user"|"model", parts:[{text}]}.
  function userTurn(t){ return { role:"user", parts:[{text:t}] }; }
  function modelTurn(t){ return { role:"model", parts:[{text:t}] }; }

  // Начать сцену: первая реплика собеседника.
  async function start(scene){
    const contents = [ userTurn("[СИСТЕМА] Это самое начало сцены. Поприветствуй Диму и задай первую реплику по своей роли. Верни только reply, поле feedback опусти.") ];
    const raw = await call(contents, scene, true);
    return { data: JSON.parse(raw), rawTurn: raw };
  }

  // Обычный ход: оценить ответ Димы + следующая реплика.
  async function turn(history, userText, scene){
    const contents = history.concat([ userTurn(userText) ]);
    const raw = await call(contents, scene, true);
    return { data: JSON.parse(raw), userText, rawTurn: raw };
  }

  // Подсказка «не знаю что сказать» — простой текст на русском, сцену НЕ двигает.
  async function hint(history, scene){
    const contents = history.concat([ userTurn("[СИСТЕМА] Дима не знает, что ответить на твою последнюю реплику. Не продолжай сцену. Просто подскажи ПО-РУССКИ в 1-2 предложениях, что уместно сейчас сказать, и дай ОДИН короткий готовый пример ответа в формате: пиньинь — перевод. Не используй JSON, ответь обычным текстом.") ]);
    return await call(contents, scene, false);
  }

  return { hasKey, key, setKey, start, turn, hint, userTurn, modelTurn };
})();
