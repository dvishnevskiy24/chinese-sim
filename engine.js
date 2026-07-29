// ИИ-мотор. OpenAI-совместимый: работает с Groq (ключ gsk_...) и OpenRouter (ключ sk-or-...).
// Провайдер определяется автоматически по виду ключа. Ключ хранится ТОЛЬКО в localStorage телефона.
// Gemini больше не используется: Google сломал выдачу ключей (формат AQ. не принимается его же API).

const AI = (function(){
  const PROVIDERS = {
    groq:       { base:"https://api.groq.com/openai/v1", label:"Groq" },
    openrouter: { base:"https://openrouter.ai/api/v1",   label:"OpenRouter" }
  };

  function key(){ try{ return (localStorage.getItem("cs_ai_key")||"").trim(); }catch(e){ return ""; } }
  function setKey(k){ try{ localStorage.setItem("cs_ai_key",(k||"").trim()); }catch(e){} }
  function hasKey(){ return key().length>15; }
  function provider(){ return key().indexOf("sk-or-")===0 ? "openrouter" : "groq"; }
  function base(){ return PROVIDERS[provider()].base; }
  function providerLabel(){ return PROVIDERS[provider()].label; }

  function model(){ try{ return localStorage.getItem("cs_model")||""; }catch(e){ return ""; } }
  function setModel(m){ try{ localStorage.setItem("cs_model",m||""); }catch(e){} }
  function models(){ try{ return JSON.parse(localStorage.getItem("cs_models")||"[]"); }catch(e){ return []; } }
  function setModels(a){ try{ localStorage.setItem("cs_models",JSON.stringify(a||[])); }catch(e){} }

  // Выбор лучшей модели для китайского + русского + чата (без «размышляющих»/аудио/модерации).
  function rank(id){
    const s=id.toLowerCase();
    if(/whisper|tts|guard|embed|safety|moderation|vision|-vl|omni/.test(s)) return -1;
    let r=0;
    if(/kimi|moonshot/.test(s)) r=100;        // Moonshot Kimi — отличный китайский
    else if(/qwen/.test(s)) r=95;             // Qwen — китайская модель
    else if(/ling|glm|deepseek|minimax|yi/.test(s)) r=90;
    else if(/gemma/.test(s)) r=80;            // Google Gemma — сильный мультиязычный
    else if(/llama-3\.3|llama3\.3|llama-4|llama4/.test(s)) r=75;
    else if(/gpt-oss|nemotron|mistral|llama/.test(s)) r=60;
    else r=40;
    if(/\b(70b|72b|k2|120b|32b|31b|30b)\b/.test(s)) r+=5;   // покрупнее — умнее
    if(/reason|think|-r1|r1-/.test(s)) r-=15;               // reasoning медленнее для чата
    return r;
  }
  function pickBest(ids){
    const good=ids.filter(id=>rank(id)>0).sort((a,b)=>rank(b)-rank(a));
    return good[0]||ids[0]||"";
  }

  async function fetchModels(){
    const res=await fetch(base()+"/models",{ headers:{ "Authorization":"Bearer "+key() } });
    if(!res.ok) throw new Error("HTTP "+res.status);
    const j=await res.json();
    return (j.data||[]).map(x=>x.id).filter(Boolean);
  }

  // Диагностика ключа: тянем список моделей, выбираем лучшую.
  async function test(){
    if(!hasKey()) return { ok:false, status:0, msg:"ключ не задан" };
    try{
      const ids=await fetchModels();
      setModels(ids.sort());
      if(!model() || ids.indexOf(model())<0) setModel(pickBest(ids));
      return { ok:true, status:200, msg:ids.length+" моделей ("+providerLabel()+"), выбрана: "+model() };
    }catch(e){
      const m=e.message||"";
      const st=parseInt((m.match(/HTTP (\d+)/)||[])[1]||"0",10);
      return { ok:false, status:st, msg:m };
    }
  }

  const SYSTEM = `Ты — доброжелательный носитель китайского (путунхуа), помогаешь русскоязычному ученику по имени Дима практиковать ЖИВОЙ разговорный китайский. Дима — начально-средний уровень (HSK 2-3), едет в Чэнду.

Как Дима пишет ответы:
- Латиницей (пиньинь), тоны и знаки не обязательны, опечатки — норма.
- Незнакомые слова он вставляет в скобках на английском/русском, например: "ni hao ni keyi bangzhu wo (get the taxi)?" — считай, будто он сказал это по-китайски, и подставь нужное слово.

Твоя задача каждый ход:
1. Играй роль из блока СИТУАЦИЯ. Говори живым разговорным китайским уровня HSK 2-3 — короткие естественные фразы, как настоящий человек.
2. Оцени последнюю реплику Димы: понятна ли, правильна ли грамматически, звучит ли естественно. Если ошибки/неестественно — по-русски спокойно объясни, как правильно. Если хорошо — коротко похвали. Если Дима сказал грамматически верное и уместное (пусть и не то, что ты ждал) — засчитывай как правильное.
3. Дай исправленную версию ЕГО фразы (fixed) и отдельно — как ту же мысль сказал бы носитель (native).
4. Продолжи разговор в роли: отреагируй на сказанное и задай уместный встречный/уточняющий вопрос. ПОМНИ весь контекст (факты, которые Дима уже сообщил).

ФОРМАТ ОТВЕТА — верни СТРОГО валидный JSON и НИЧЕГО больше (без markdown, без обратных кавычек, без текста вне JSON):
{
  "feedback": {
    "rating": "good | ok | wrong",
    "comment_ru": "краткое объяснение по-русски (1-3 предложения)",
    "fixed":   { "hanzi": "…", "pinyin": "… с тонами", "ru": "перевод" },
    "native":  { "hanzi": "…", "pinyin": "… с тонами", "ru": "перевод" }
  },
  "reply": {
    "hanzi": "твоя реплика иероглифами",
    "pinyin": "пиньинь с тонами",
    "ru": "перевод на русский",
    "words": [ { "py": "слово пиньинем", "ru": "перевод" } ]
  }
}
На самом первом ходу (начало сцены) поле feedback поставь null. words — 2-5 ключевых слов из твоей reply.`;

  function sys(scene){ return { role:"system", content: SYSTEM + "\n\nСИТУАЦИЯ: " + scene }; }
  function userTurn(t){ return { role:"user", content:t }; }
  function modelTurn(t){ return { role:"assistant", content:t }; }

  function parseJSON(text){
    let t=(text||"").trim();
    t=t.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");   // снять ограждение ```
    try{ return JSON.parse(t); }catch(e){}
    const i=t.indexOf("{"), j=t.lastIndexOf("}");
    if(i>=0&&j>i){ return JSON.parse(t.slice(i,j+1)); }           // выдернуть { ... }
    throw new Error("Модель вернула не JSON");
  }

  async function chat(messages, opts){
    if(!hasKey()) throw new Error("NO_KEY");
    const body={ model: model()||"llama-3.3-70b-versatile", messages, temperature:0.7, max_tokens:1024 };
    if(opts&&opts.json) body.response_format={ type:"json_object" };
    const headers={ "Content-Type":"application/json", "Authorization":"Bearer "+key() };
    if(provider()==="openrouter"){ headers["HTTP-Referer"]="https://dvishnevskiy24.github.io/chinese-sim/"; headers["X-Title"]="chinese-sim"; }
    const res=await fetch(base()+"/chat/completions",{ method:"POST", headers, body:JSON.stringify(body) });
    if(!res.ok){
      let msg="HTTP "+res.status;
      try{ const j=await res.json(); if(j.error&&j.error.message) msg=j.error.message; else if(j.error) msg=JSON.stringify(j.error); }catch(e){}
      if(res.status===401) throw new Error("BAD_KEY");
      if(res.status===402||res.status===403) throw new Error("LIMIT::"+msg);
      if(res.status===429) throw new Error("RATE::"+msg);
      throw new Error("HTTP "+res.status+": "+msg);
    }
    const j=await res.json();
    return (((j.choices||[])[0]||{}).message||{}).content || "";
  }

  // Начать сцену.
  async function start(scene){
    const raw=await chat([ sys(scene), userTurn("[НАЧАЛО СЦЕНЫ] Поприветствуй Диму и задай первую реплику по своей роли. feedback = null.") ], {json:true});
    const data=parseJSON(raw);
    return { data, rawTurn: data.reply ? data.reply.hanzi : "" };
  }

  // Ход: оценка ответа Димы + следующая реплика.
  async function turn(history, userText, scene){
    const msgs=[ sys(scene) ].concat(history).concat([ userTurn(userText) ]);
    const raw=await chat(msgs, {json:true});
    const data=parseJSON(raw);
    return { data, userText, rawTurn: data.reply ? data.reply.hanzi : "" };
  }

  // Подсказка (обычный текст, сцену не двигает).
  async function hint(history, scene){
    const msgs=[ sys(scene) ].concat(history).concat([ userTurn("[СИСТЕМА] Дима не знает, что ответить. Не продолжай сцену и не давай JSON. Просто подскажи ПО-РУССКИ в 1-2 предложениях, что уместно сказать, и дай ОДИН короткий пример в формате: пиньинь — перевод.") ]);
    return await chat(msgs, {json:false});
  }

  return { hasKey, key, setKey, provider, providerLabel, model, setModel, models, setModels, test, start, turn, hint, userTurn, modelTurn };
})();
