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
    // Баланс: качество китайского + щедрость бесплатных лимитов провайдера.
    // Kimi даёт лучший китайский, но у него самые жёсткие free-лимиты → чуть ниже
    // надёжных Qwen/Llama, чтобы по умолчанию реже ловить 429. Kimi остаётся в списке.
    let r=0;
    if(/qwen/.test(s)) r=100;                 // Qwen — китайская модель, хорошее качество+лимиты
    else if(/llama-3\.3|llama3\.3|llama-4|llama4/.test(s)) r=92;  // Llama 3.3/4 — щедрые лимиты, надёжна
    else if(/kimi|moonshot/.test(s)) r=88;    // Kimi — лучший китайский, но жёсткие лимиты
    else if(/glm|deepseek|ling|minimax|yi/.test(s)) r=85;
    else if(/gemma/.test(s)) r=80;            // Google Gemma — сильный мультиязычный
    else if(/gpt-oss|nemotron|mistral|llama/.test(s)) r=60;
    else r=40;
    if(/\b(70b|72b|k2|120b|32b|31b|30b)\b/.test(s)) r+=4;   // покрупнее — умнее
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

  const SYSTEM = `Ты — доброжелательный носитель китайского (путунхуа), играешь роль из блока СИТУАЦИЯ и помогаешь русскоязычному ученику Диме (уровень HSK 2-3, едет в Чэнду) практиковать живой разговор.

Дима отвечает пиньинем латиницей (тоны/опечатки не важны); незнакомые слова вставляет в скобках на англ./рус. ("...bangzhu wo (get a taxi)?") — понимай их как сказанные по-китайски.

Каждый ход:
1. Говори живым разговорным китайским уровня HSK 2-3 — короткие естественные фразы.
2. Оцени реплику Димы (понятна/грамотна/естественна). Ошибка — кратко объясни по-русски, как правильно; хорошо — похвали. Верное и уместное засчитывай, даже если ждал другого.
3. Дай исправленную его фразу (FIX) и вариант носителя (NAT).
4. Продолжи разговор в роли: отреагируй и задай встречный вопрос. Помни весь контекст.

ФОРМАТ ОТВЕТА — только строки вида КЛЮЧ= значение, каждая строка отдельно, БЕЗ кавычек, markdown и лишнего текста. Каждое поле строго в ОДНУ строку. Порядок ключей:
RATING= good|ok|wrong
COMMENT= объяснение по-русски, 1-2 предложения
FIX_HZ= исправленная фраза Димы иероглифами
FIX_PY= она же пиньинем с тонами
FIX_RU= её перевод на русский
NAT_HZ= как сказал бы носитель, иероглифы
NAT_PY= пиньинь с тонами
NAT_RU= перевод на русский
REP_HZ= твоя следующая реплика иероглифами
REP_PY= пиньинь с тонами
REP_RU= перевод на русский
WORDS= пиньинь=перевод | пиньинь=перевод | пиньинь=перевод

WORDS — 2-5 ключевых слов из REP. На самом первом ходу (начало сцены) не пиши строки RATING/COMMENT/FIX*/NAT* — только REP_* и WORDS.`;

  function sys(scene){ return { role:"system", content: SYSTEM + "\n\nСИТУАЦИЯ: " + scene }; }
  function userTurn(t){ return { role:"user", content:t }; }
  function modelTurn(t){ return { role:"assistant", content:t }; }

  // Разбор формата пометок КЛЮЧ= значение. Устойчив к любой пунктуации/кавычкам/скобкам.
  function parse(text){
    const t=(text||"").replace(/```/g,"").replace(/<think>[\s\S]*?<\/think>/gi,"");
    const get=k=>{ const m=t.match(new RegExp("^\\s*"+k+"\\s*=\\s*(.+?)\\s*$","mi")); return m?m[1].trim():""; };
    const repHz=get("REP_HZ");
    if(!repHz) throw new Error("PARSE_FAIL");
    const wr=get("WORDS");
    const words=wr? wr.split("|").map(p=>{ const i=p.indexOf("="); return i<0?null:{py:p.slice(0,i).trim(),ru:p.slice(i+1).trim()}; }).filter(x=>x&&x.py) : [];
    const reply={ hanzi:repHz, pinyin:get("REP_PY"), ru:get("REP_RU"), words };
    const ratingRaw=get("RATING").toLowerCase();
    let feedback=null;
    if(/good|ok|wrong/.test(ratingRaw)){
      feedback={
        rating:(ratingRaw.match(/good|ok|wrong/)||["ok"])[0],
        comment_ru:get("COMMENT"),
        fixed:{ hanzi:get("FIX_HZ"), pinyin:get("FIX_PY"), ru:get("FIX_RU") },
        native:{ hanzi:get("NAT_HZ"), pinyin:get("NAT_PY"), ru:get("NAT_RU") }
      };
    }
    return { feedback, reply };
  }

  // Запрос + одна повторная попытка, если ответ не разобрался.
  async function chatParsed(messages){
    let raw=await chat(messages);
    try{ return parse(raw); }
    catch(e){
      const retry=messages.concat([
        modelTurn(raw),
        userTurn("Твой ответ был не по формату. Повтори ТО ЖЕ САМОЕ строго строками КЛЮЧ= значение (RATING=, COMMENT=, FIX_HZ=, … REP_HZ=, REP_PY=, REP_RU=, WORDS=), каждое поле в одну строку, без кавычек и лишнего текста.")
      ]);
      raw=await chat(retry);
      return parse(raw);
    }
  }

  async function chat(messages, opts){
    if(!hasKey()) throw new Error("NO_KEY");
    // Намеренно НЕ используем response_format:json_object — у Groq это включает строгую
    // серверную валидацию, которая бракует ответ целиком. Просим JSON в промпте и
    // разбираем сами (parseJSON терпим к обёрткам и лишнему тексту). max_tokens с запасом,
    // чтобы длинный ответ (feedback+reply+words, кит.+рус.) не обрывался и не ломал JSON.
    const body={ model: model()||"llama-3.3-70b-versatile", messages, temperature:0.6, max_tokens:900 };
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
    const data=await chatParsed([ sys(scene), userTurn("[НАЧАЛО СЦЕНЫ] Поприветствуй Диму и задай первую реплику по своей роли. Только REP_* и WORDS.") ]);
    return { data, rawTurn: data.reply ? data.reply.hanzi : "" };
  }

  // Ход: оценка ответа Димы + следующая реплика.
  async function turn(history, userText, scene){
    const msgs=[ sys(scene) ].concat(history).concat([ userTurn(userText) ]);
    const data=await chatParsed(msgs);
    return { data, userText, rawTurn: data.reply ? data.reply.hanzi : "" };
  }

  // Подсказка (обычный текст, сцену не двигает).
  async function hint(history, scene){
    const msgs=[ sys(scene) ].concat(history).concat([ userTurn("[СИСТЕМА] Дима не знает, что ответить. Не продолжай сцену и не используй формат КЛЮЧ=. Просто подскажи ПО-РУССКИ в 1-2 предложениях, что уместно сказать, и дай ОДИН короткий пример: пиньинь — перевод.") ]);
    return await chat(msgs);
  }

  return { hasKey, key, setKey, provider, providerLabel, model, setModel, models, setModels, test, start, turn, hint, userTurn, modelTurn };
})();
