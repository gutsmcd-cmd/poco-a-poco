// Course content: Castilian Spanish (Spain) taught through Japanese, with English glosses.
// Pronunciation hints are katakana approximations. In Spain, c (before e/i) and z
// sound like English "th" — the katakana サ/シ/ス/セ are only a guide.

export type Register = 'tu' | 'usted';

export interface Item {
  id: string;
  es: string;
  ja: string;
  en: string;
  pron?: string;
  ex?: string;
  exJa?: string;
  exEn?: string;
  note?: string;
  noteEn?: string;
  reg?: Register;
}

export interface Unit {
  id: string;
  emoji: string;
  ja: string;
  en: string;
  es: string;
  tip: string;
  tipEn: string;
  items: Item[];
}

export interface Lesson {
  id: string;
  unitId: string;
  index: number; // 0-based within unit
  itemIds: string[];
}

type Extra = Partial<Omit<Item, 'id' | 'es' | 'ja' | 'en' | 'pron'>>;
type Raw = [es: string, ja: string, en: string, pron: string, extra?: Extra];

function unit(
  id: string,
  emoji: string,
  ja: string,
  en: string,
  es: string,
  tip: string,
  tipEn: string,
  raws: Raw[],
): Unit {
  return {
    id,
    emoji,
    ja,
    en,
    es,
    tip,
    tipEn,
    items: raws.map(([es, ja, en, pron, extra], i) => ({
      id: `${id}-${String(i + 1).padStart(2, '0')}`,
      es,
      ja,
      en,
      pron,
      ...(extra ?? {}),
    })),
  };
}

export const UNITS: Unit[] = [
  unit(
    'u01', '👋', 'あいさつ', 'Greetings', 'Saludos',
    'お店に入るときは「Hola」、出るときは「Adiós」や「Hasta luego」と言うと感じがいいです。',
    'Say "Hola" when entering a shop and "Adiós" or "Hasta luego" when leaving.',
    [
      ['Hola', 'こんにちは・やあ', 'Hello / Hi', 'オラ', { ex: '¡Hola! ¿Qué tal?', exJa: 'やあ！元気？', exEn: 'Hi! How are you?', note: 'h は発音しません。一日中使えます。', noteEn: 'The h is silent. Works any time of day.' }],
      ['Buenos días', 'おはようございます', 'Good morning', 'ブエノス ディアス', { ex: 'Buenos días, un café, por favor.', exJa: 'おはようございます、コーヒーを1杯お願いします。', exEn: 'Good morning, a coffee, please.', note: 'スペインでは昼食（14時ごろ）まで使います。', noteEn: 'In Spain it is used until lunch (around 2 pm).' }],
      ['Buenas tardes', 'こんにちは（午後）', 'Good afternoon', 'ブエナス タルデス', { note: '昼食後から暗くなるまで使います。', noteEn: 'Used from lunch until it gets dark.' }],
      ['Buenas noches', 'こんばんは・おやすみなさい', 'Good evening / Good night', 'ブエナス ノチェス', { ex: 'Buenas noches, hasta mañana.', exJa: 'おやすみなさい、また明日。', exEn: 'Good night, see you tomorrow.' }],
      ['Adiós', 'さようなら', 'Goodbye', 'アディオス', { ex: 'Adiós, gracias.', exJa: 'さようなら、ありがとう。', exEn: 'Goodbye, thank you.' }],
      ['Hasta luego', 'またね・また後で', 'See you later', 'アスタ ルエゴ', { ex: '¡Hasta luego, Rie!', exJa: 'またね、リエ！', exEn: 'See you later, Rie!', note: 'スペインでは別れ際にとてもよく使います。', noteEn: 'Very common when leaving in Spain.' }],
      ['Gracias', 'ありがとう', 'Thank you', 'グラシアス', { ex: 'Muchas gracias.', exJa: 'どうもありがとう。', exEn: 'Thank you very much.' }],
      ['De nada', 'どういたしまして', "You're welcome", 'デ ナダ'],
      ['Por favor', 'お願いします', 'Please', 'ポル ファボール', { ex: 'Un agua, por favor.', exJa: '水を1つお願いします。', exEn: 'A water, please.' }],
      ['Perdón', 'すみません・ごめんなさい', 'Sorry / Excuse me', 'ペルドン', { ex: 'Perdón, no entiendo.', exJa: 'すみません、わかりません。', exEn: "Sorry, I don't understand." }],
      ['Disculpe', 'すみません（丁寧な呼びかけ）', 'Excuse me (polite)', 'ディスクルペ', { reg: 'usted', ex: 'Disculpe, ¿dónde está el metro?', exJa: 'すみません、地下鉄はどこですか？', exEn: 'Excuse me, where is the metro?', note: '店員さんや知らない人に声をかけるときに。', noteEn: 'To get the attention of staff or strangers.' }],
      ['¿Qué tal?', '元気？・調子はどう？', "How are you? / How's it going?", 'ケ タル', { reg: 'tu', ex: '¿Qué tal el viaje?', exJa: '旅行はどう？', exEn: "How's the trip?" }],
      ['Muy bien, gracias.', 'とても元気です、ありがとう。', 'Very well, thanks.', 'ムイ ビエン グラシアス', { ex: 'Muy bien, gracias. ¿Y tú?', exJa: '元気です、ありがとう。あなたは？', exEn: 'Very well, thanks. And you?' }],
      ['Encantado / Encantada', 'はじめまして', 'Nice to meet you', 'エンカンタド／エンカンタダ', { ex: 'Encantada, soy Rie.', exJa: 'はじめまして、リエです。', exEn: "Nice to meet you, I'm Rie.", note: '話す人が女性なら Encantada、男性なら Encantado。', noteEn: 'Women say Encantada, men say Encantado.' }],
    ],
  ),
  unit(
    'u02', '🙋', '自己紹介', 'About me', 'Presentarse',
    'tú（親しい相手）と usted（丁寧）があります。スペインでは tú がよく使われますが、年上の人や迷ったときは usted が安心です。カードにバッジで表示しています。',
    'Spanish has tú (familiar) and usted (polite). Spain uses tú a lot, but usted is safe with older people or when unsure. Cards show a badge.',
    [
      ['Me llamo…', '私の名前は…です', 'My name is…', 'メ ヤモ', { ex: 'Me llamo Rie.', exJa: '私の名前はリエです。', exEn: 'My name is Rie.' }],
      ['¿Cómo te llamas?', 'お名前は？（親しい相手に）', "What's your name? (informal)", 'コモ テ ヤマス', { reg: 'tu', ex: 'Hola, ¿cómo te llamas?', exJa: 'こんにちは、お名前は？', exEn: "Hi, what's your name?" }],
      ['¿Cómo se llama usted?', 'お名前は何ですか？（丁寧）', 'What is your name? (polite)', 'コモ セ ヤマ ウステ', { reg: 'usted' }],
      ['Soy de Japón.', '日本から来ました。', "I'm from Japan.", 'ソイ デ ハポン', { ex: 'Soy de Japón, de Tokio.', exJa: '日本の東京から来ました。', exEn: "I'm from Japan, from Tokyo." }],
      ['Soy japonesa.', '私は日本人です（女性）。', "I'm Japanese (female).", 'ソイ ハポネサ', { note: '男性は Soy japonés.（ハポネス）', noteEn: 'A man says: Soy japonés.' }],
      ['¿De dónde eres?', '出身はどこ？', 'Where are you from? (informal)', 'デ ドンデ エレス', { reg: 'tu', note: '丁寧に聞くなら ¿De dónde es usted?', noteEn: 'Polite form: ¿De dónde es usted?' }],
      ['Vivo en Tokio.', '東京に住んでいます。', 'I live in Tokyo.', 'ビボ エン トキオ'],
      ['Hablo un poco de español.', 'スペイン語を少し話します。', 'I speak a little Spanish.', 'アブロ ウン ポコ デ エスパニョル'],
      ['¿Habla inglés?', '英語を話せますか？（丁寧）', 'Do you speak English? (polite)', 'アブラ イングレス', { reg: 'usted', ex: 'Perdón, ¿habla inglés?', exJa: 'すみません、英語を話せますか？', exEn: 'Excuse me, do you speak English?' }],
      ['Estoy de vacaciones.', '休暇中です。', "I'm on vacation.", 'エストイ デ バカシオネス', { ex: 'Estoy de vacaciones en España.', exJa: 'スペインで休暇中です。', exEn: "I'm on vacation in Spain." }],
      ['Mucho gusto', 'はじめまして・よろしく', 'Pleased to meet you', 'ムチョ グスト', { note: '男女どちらでもそのまま使えます。', noteEn: 'Same form for everyone.' }],
      ['Sí', 'はい', 'Yes', 'シ', { ex: 'Sí, por favor.', exJa: 'はい、お願いします。', exEn: 'Yes, please.' }],
      ['No', 'いいえ', 'No', 'ノ', { ex: 'No, gracias.', exJa: 'いいえ、結構です。', exEn: 'No, thank you.' }],
      ['Este es mi novio.', 'こちらは私の彼氏です。', 'This is my boyfriend.', 'エステ エス ミ ノビオ', { note: '女性を紹介するときは Esta es mi amiga.（こちらは私の友達です）', noteEn: 'Introducing a woman: Esta es mi amiga. (This is my friend.)' }],
    ],
  ),
  unit(
    'u03', '🔢', '数字', 'Numbers', 'Números',
    'スペインの発音では、c（e・i の前）と z は英語の th のような音です：cinco, diez, cien。カタカナの「サ・シ・ス・セ」は目安です。',
    'In Spain, c (before e/i) and z sound like English "th": cinco, diez, cien.',
    [
      ['cero', '0（ゼロ）', 'zero', 'セロ'],
      ['uno', '1（いち）', 'one', 'ウノ', { ex: 'Un café, por favor.', exJa: 'コーヒーを1杯お願いします。', exEn: 'One coffee, please.', note: '名詞の前では un / una になります。', noteEn: 'Before a noun it becomes un / una.' }],
      ['dos', '2（に）', 'two', 'ドス', { ex: 'Dos cafés con leche, por favor.', exJa: 'カフェラテを2つお願いします。', exEn: 'Two lattes, please.' }],
      ['tres', '3（さん）', 'three', 'トレス', { ex: 'Somos tres.', exJa: '3人です。', exEn: 'There are three of us.' }],
      ['cuatro', '4（よん）', 'four', 'クアトロ'],
      ['cinco', '5（ご）', 'five', 'シンコ', { ex: 'Son cinco euros.', exJa: '5ユーロです。', exEn: "It's five euros." }],
      ['seis', '6（ろく）', 'six', 'セイス'],
      ['siete', '7（なな）', 'seven', 'シエテ'],
      ['ocho', '8（はち）', 'eight', 'オチョ'],
      ['nueve', '9（きゅう）', 'nine', 'ヌエベ'],
      ['diez', '10（じゅう）', 'ten', 'ディエス', { ex: 'Son las diez.', exJa: '10時です。', exEn: "It's ten o'clock." }],
      ['veinte', '20（にじゅう）', 'twenty', 'ベインテ'],
      ['cien', '100（ひゃく）', 'one hundred', 'シエン'],
      ['euros', 'ユーロ', 'euros', 'エウロス', { ex: 'Son tres euros con cincuenta.', exJa: '3ユーロ50セントです。', exEn: "It's three euros fifty." }],
      ['¿Cuánto es?', 'いくらですか？（会計で）', 'How much is it?', 'クアント エス', { note: '会計のときによく使います。', noteEn: 'Handy when paying.' }],
    ],
  ),
  unit(
    'u04', '☕', 'カフェ・バル', 'Café & bar', 'En el bar',
    'バルではカウンターで注文してOK。「Quería…」や「…, por favor」で丁寧に頼めます。',
    'In a bar you can order at the counter. "Quería…" or "…, por favor" keeps it polite.',
    [
      ['café con leche', 'カフェラテ（ミルクコーヒー）', 'coffee with milk', 'カフェ コン レチェ', { ex: 'Un café con leche, por favor.', exJa: 'カフェラテを1つお願いします。', exEn: 'A coffee with milk, please.' }],
      ['café solo', 'エスプレッソ', 'espresso', 'カフェ ソロ'],
      ['cortado', 'コルタード（ミルク少しのエスプレッソ）', 'espresso with a dash of milk', 'コルタド'],
      ['agua', '水', 'water', 'アグア', { ex: 'Agua sin gas, por favor.', exJa: '炭酸なしの水をお願いします。', exEn: 'Still water, please.', note: '炭酸入りは con gas。', noteEn: 'Sparkling is con gas.' }],
      ['cerveza', 'ビール', 'beer', 'セルベサ', { ex: 'Una cerveza, por favor.', exJa: 'ビールを1つお願いします。', exEn: 'A beer, please.' }],
      ['caña', '小さいグラスの生ビール', 'small draft beer', 'カニャ', { ex: 'Dos cañas, por favor.', exJa: '生ビール（小）を2つお願いします。', exEn: 'Two small beers, please.' }],
      ['vino tinto', '赤ワイン', 'red wine', 'ビノ ティント', { ex: 'Una copa de vino tinto.', exJa: '赤ワインをグラスで1杯。', exEn: 'A glass of red wine.', note: '白ワインは vino blanco。', noteEn: 'White wine is vino blanco.' }],
      ['zumo de naranja', 'オレンジジュース', 'orange juice', 'スモ デ ナランハ', { ex: 'Un zumo de naranja natural.', exJa: '生搾りオレンジジュースを1つ。', exEn: 'A fresh orange juice.', note: 'スペインでは jugo ではなく zumo と言います。', noteEn: 'Spain says zumo, not jugo.' }],
      ['Quería…', '…をお願いしたいのですが', "I'd like…", 'ケリア', { ex: 'Quería un cortado, por favor.', exJa: 'コルタードをお願いしたいのですが。', exEn: "I'd like a cortado, please." }],
      ['bocadillo', 'ボカディージョ（バゲットサンド）', 'baguette sandwich', 'ボカディーヨ', { ex: 'Un bocadillo de jamón.', exJa: '生ハムのバゲットサンドを1つ。', exEn: 'A ham baguette.' }],
      ['tortilla de patatas', 'スペイン風オムレツ', 'Spanish potato omelette', 'トルティーヤ デ パタタス', { ex: 'Un pincho de tortilla.', exJa: 'トルティーヤを1切れ。', exEn: 'A slice of tortilla.' }],
      ['pan con tomate', 'パン・コン・トマテ（トマトを塗ったパン）', 'bread with tomato', 'パン コン トマテ', { note: 'カタルーニャの定番。カタルーニャ語では pa amb tomàquet。', noteEn: 'A Catalan classic (pa amb tomàquet in Catalan).' }],
      ['para llevar', '持ち帰りで', 'to go / takeaway', 'パラ イェバール', { ex: 'Un café para llevar.', exJa: 'コーヒーを持ち帰りで。', exEn: 'A coffee to go.' }],
      ['tapas', 'タパス（小皿料理）', 'tapas (small dishes)', 'タパス', { ex: '¿Qué tapas tienen?', exJa: 'どんなタパスがありますか？', exEn: 'What tapas do you have?' }],
    ],
  ),
  unit(
    'u05', '🥘', 'レストラン', 'Restaurant', 'En el restaurante',
    'スペインの昼食は14時ごろ、夕食は21時ごろから。平日昼の menú del día がお得です。チップは必須ではありません。',
    'Lunch is around 2 pm, dinner from about 9 pm. The weekday menú del día is great value. Tipping is optional.',
    [
      ['Una mesa para dos, por favor.', '2人用のテーブルをお願いします。', 'A table for two, please.', 'ウナ メサ パラ ドス ポル ファボール'],
      ['la carta', 'メニュー', 'the menu', 'ラ カルタ', { ex: '¿Me trae la carta, por favor?', exJa: 'メニューを持ってきてもらえますか？', exEn: 'Could you bring me the menu, please?' }],
      ['el menú del día', '日替わりランチ（コース）', 'set menu of the day', 'エル メヌ デル ディア', { ex: '¿Tienen menú del día?', exJa: '日替わりランチはありますか？', exEn: 'Do you have a set menu?' }],
      ['¿Qué me recomienda?', 'おすすめは何ですか？（丁寧）', 'What do you recommend? (polite)', 'ケ メ レコミエンダ', { reg: 'usted' }],
      ['paella', 'パエリア', 'paella', 'パエヤ', { ex: 'Una paella para dos.', exJa: 'パエリアを2人前。', exEn: 'A paella for two.', note: 'バレンシア発祥。多くの店で2人前からです。', noteEn: 'From Valencia; often served for two or more.' }],
      ['jamón', '生ハム', 'cured ham', 'ハモン', { ex: 'Una ración de jamón ibérico.', exJa: 'イベリコ生ハムを1皿。', exEn: 'A portion of Iberian ham.' }],
      ['pescado', '魚（料理）', 'fish', 'ペスカド', { ex: '¿Qué pescado hay hoy?', exJa: '今日はどんな魚がありますか？', exEn: 'What fish is there today?' }],
      ['carne', '肉', 'meat', 'カルネ'],
      ['Soy vegetariana.', '私はベジタリアンです（女性）。', "I'm vegetarian (female).", 'ソイ ベヘタリアナ', { note: '男性は Soy vegetariano.', noteEn: 'A man says: Soy vegetariano.' }],
      ['Tengo alergia a…', '…のアレルギーがあります', "I'm allergic to…", 'テンゴ アレルヒア ア', { ex: 'Tengo alergia a los frutos secos.', exJa: 'ナッツのアレルギーがあります。', exEn: "I'm allergic to nuts." }],
      ['¡Está muy rico!', 'とてもおいしい！', "It's delicious!", 'エスタ ムイ リコ'],
      ['La cuenta, por favor.', 'お会計をお願いします。', 'The bill, please.', 'ラ クエンタ ポル ファボール'],
      ['¿Puedo pagar con tarjeta?', 'カードで払えますか？', 'Can I pay by card?', 'プエド パガール コン タルヘタ'],
    ],
  ),
  unit(
    'u06', '🧭', '道を尋ねる', 'Directions', 'Pedir direcciones',
    '道を聞くときは「Perdón」や「Disculpe」から始めると丁寧です。',
    'Start with "Perdón" or "Disculpe" when asking for directions.',
    [
      ['¿Dónde está…?', '…はどこですか？', 'Where is…?', 'ドンデ エスタ', { ex: '¿Dónde está la Sagrada Familia?', exJa: 'サグラダ・ファミリアはどこですか？', exEn: 'Where is the Sagrada Familia?' }],
      ['el baño', 'トイレ', 'the toilet / restroom', 'エル バニョ', { ex: 'Perdón, ¿dónde está el baño?', exJa: 'すみません、トイレはどこですか？', exEn: 'Excuse me, where is the toilet?', note: '看板では aseos や servicios とも書かれます。', noteEn: 'Signs may also say aseos or servicios.' }],
      ['a la derecha', '右に', 'to the right', 'ア ラ デレチャ', { ex: 'Está a la derecha.', exJa: '右にあります。', exEn: "It's on the right." }],
      ['a la izquierda', '左に', 'to the left', 'ア ラ イスキエルダ', { ex: 'Gire a la izquierda.', exJa: '左に曲がってください。', exEn: 'Turn left.' }],
      ['todo recto', 'まっすぐ', 'straight ahead', 'トド レクト', { ex: 'Siga todo recto.', exJa: 'まっすぐ進んでください。', exEn: 'Go straight ahead.', note: 'スペインでは todo recto（中南米では derecho）。', noteEn: 'Spain says todo recto (Latin America: derecho).' }],
      ['cerca', '近い・近くに', 'near / close', 'セルカ', { ex: '¿Está cerca?', exJa: '近いですか？', exEn: 'Is it near?' }],
      ['lejos', '遠い・遠くに', 'far', 'レホス', { ex: '¿Está lejos de aquí?', exJa: 'ここから遠いですか？', exEn: 'Is it far from here?' }],
      ['la calle', '通り', 'the street', 'ラ カイェ'],
      ['la plaza', '広場', 'the square', 'ラ プラサ', { ex: 'La Plaza Mayor está cerca.', exJa: 'マヨール広場は近いです。', exEn: 'The Plaza Mayor is close.' }],
      ['la esquina', '角', 'the corner', 'ラ エスキナ', { ex: 'Está en la esquina.', exJa: '角にあります。', exEn: "It's on the corner." }],
      ['el mapa', '地図', 'the map', 'エル マパ', { reg: 'usted', ex: '¿Me lo puede enseñar en el mapa?', exJa: '地図で教えてもらえますか？', exEn: 'Can you show me on the map?' }],
      ['Estoy perdida.', '道に迷いました（女性）。', "I'm lost (female).", 'エストイ ペルディダ', { note: '男性は Estoy perdido.', noteEn: 'A man says: Estoy perdido.' }],
      ['aquí', 'ここ', 'here', 'アキ'],
      ['allí', 'あそこ', 'over there', 'アイ', { ex: 'Está allí.', exJa: 'あそこにあります。', exEn: "It's over there." }],
    ],
  ),
  unit(
    'u07', '🛍️', '買い物', 'Shopping', 'De compras',
    'お店に入ったら Hola、出るときは Gracias, adiós。ほとんどのお店でカードが使えます。',
    'Say Hola when you enter and Gracias, adiós when you leave. Cards are accepted almost everywhere.',
    [
      ['¿Cuánto cuesta esto?', 'これはいくらですか？', 'How much is this?', 'クアント クエスタ エスト'],
      ['Solo estoy mirando.', '見ているだけです。', "I'm just looking.", 'ソロ エストイ ミランド', { ex: 'Gracias, solo estoy mirando.', exJa: 'ありがとう、見ているだけです。', exEn: "Thanks, I'm just looking." }],
      ['¿Tiene…?', '…はありますか？（丁寧）', 'Do you have…? (polite)', 'ティエネ', { reg: 'usted', ex: '¿Tiene otra talla?', exJa: '別のサイズはありますか？', exEn: 'Do you have another size?' }],
      ['la talla', '（服の）サイズ', 'size (clothes)', 'ラ タヤ', { reg: 'usted', ex: '¿Qué talla usa?', exJa: 'サイズはいくつですか？', exEn: 'What size do you wear?' }],
      ['¿Puedo probármelo?', '試着してもいいですか？', 'Can I try it on?', 'プエド プロバルメロ'],
      ['Me lo llevo.', 'これにします（買います）。', "I'll take it.", 'メ ロ イェボ'],
      ['caro', '（値段が）高い', 'expensive', 'カロ', { ex: 'Es un poco caro.', exJa: 'ちょっと高いです。', exEn: "It's a bit expensive." }],
      ['barato', '安い', 'cheap', 'バラト'],
      ['grande', '大きい', 'big', 'グランデ', { ex: 'Es demasiado grande.', exJa: '大きすぎます。', exEn: "It's too big." }],
      ['pequeño', '小さい', 'small', 'ペケーニョ'],
      ['una bolsa', '袋', 'a bag', 'ウナ ボルサ', { reg: 'usted', ex: '¿Necesita bolsa?', exJa: '袋は要りますか？', exEn: 'Do you need a bag?', note: '袋は有料のことが多いです。', noteEn: 'Bags often cost a few cents.' }],
      ['en efectivo', '現金で', 'in cash', 'エン エフェクティボ', { ex: 'Pago en efectivo.', exJa: '現金で払います。', exEn: "I'll pay in cash." }],
      ['un regalo', 'プレゼント・贈り物', 'a gift', 'ウン レガロ', { ex: 'Es para regalo.', exJa: 'プレゼント用です。', exEn: "It's a gift.", note: 'こう言うと包んでくれることがあります。', noteEn: 'Shops may gift-wrap it for you.' }],
    ],
  ),
  unit(
    'u08', '🏨', 'ホテル', 'Hotel', 'En el hotel',
    'スペインの「planta baja」は日本の1階、「primera planta」は日本の2階です。',
    'In Spain, "planta baja" is the ground floor and "primera planta" is one floor up.',
    [
      ['Tengo una reserva.', '予約しています。', 'I have a reservation.', 'テンゴ ウナ レセルバ', { ex: 'Tengo una reserva a nombre de Sato.', exJa: '佐藤の名前で予約しています。', exEn: 'I have a reservation under Sato.' }],
      ['la habitación', '部屋', 'the room', 'ラ アビタシオン', { reg: 'usted', ex: '¿Tiene una habitación libre?', exJa: '空いている部屋はありますか？', exEn: 'Do you have a room available?' }],
      ['la llave', '鍵', 'the key', 'ラ ヤベ', { reg: 'usted', ex: '¿Me da la llave, por favor?', exJa: '鍵をもらえますか？', exEn: 'Can I have the key, please?' }],
      ['el desayuno', '朝食', 'breakfast', 'エル デサユノ', { ex: '¿A qué hora es el desayuno?', exJa: '朝食は何時ですか？', exEn: 'What time is breakfast?' }],
      ['¿Hay wifi?', 'Wi-Fiはありますか？', 'Is there wifi?', 'アイ ウィフィ', { note: 'スペインでは「ウィフィ」と発音する人が多いです。', noteEn: 'Often pronounced "wee-fee" in Spain.' }],
      ['la contraseña', 'パスワード', 'the password', 'ラ コントラセーニャ', { ex: '¿Cuál es la contraseña del wifi?', exJa: 'Wi-Fiのパスワードは何ですか？', exEn: "What's the wifi password?" }],
      ['el ascensor', 'エレベーター', 'the lift / elevator', 'エル アスセンソル', { ex: '¿Dónde está el ascensor?', exJa: 'エレベーターはどこですか？', exEn: 'Where is the lift?' }],
      ['la toalla', 'タオル', 'the towel', 'ラ トアヤ', { reg: 'usted', ex: '¿Me puede dar otra toalla?', exJa: 'タオルをもう1枚もらえますか？', exEn: 'Could I have another towel?' }],
      ['No funciona.', '動きません・壊れています。', "It doesn't work.", 'ノ フンシオナ', { ex: 'La ducha no funciona.', exJa: 'シャワーが壊れています。', exEn: "The shower doesn't work." }],
      ['¿Puedo dejar la maleta?', 'スーツケースを預けてもいいですか？', 'Can I leave my suitcase?', 'プエド デハール ラ マレタ'],
      ['la planta baja', '1階（地上階）', 'the ground floor', 'ラ プランタ バハ'],
      ['el aire acondicionado', 'エアコン', 'the air conditioning', 'エル アイレ アコンディシオナド'],
    ],
  ),
  unit(
    'u09', '🚆', '交通', 'Getting around', 'Transporte',
    '長距離列車（Renfe など）は駅や公式アプリで事前に切符を買えます。地下鉄は乗る前に切符を買いましょう。',
    'Long-distance trains (e.g. Renfe) can be booked at stations or in the official app. Buy metro tickets before boarding.',
    [
      ['el metro', '地下鉄', 'the metro / subway', 'エル メトロ', { ex: 'Vamos en metro.', exJa: '地下鉄で行こう。', exEn: "Let's go by metro." }],
      ['el autobús', 'バス', 'the bus', 'エル アウトブス', { ex: '¿Este autobús va al centro?', exJa: 'このバスは中心街に行きますか？', exEn: 'Does this bus go to the centre?' }],
      ['el tren', '電車・列車', 'the train', 'エル トレン', { ex: 'El tren a Madrid sale a las diez.', exJa: 'マドリード行きの列車は10時に出ます。', exEn: 'The train to Madrid leaves at ten.' }],
      ['la estación', '駅', 'the station', 'ラ エスタシオン', { ex: 'A la estación de Sants, por favor.', exJa: 'サンツ駅までお願いします。', exEn: 'To Sants station, please.' }],
      ['el aeropuerto', '空港', 'the airport', 'エル アエロプエルト', { ex: 'Al aeropuerto, por favor.', exJa: '空港までお願いします。', exEn: 'To the airport, please.' }],
      ['un billete', '切符・チケット', 'a ticket', 'ウン ビイェテ', { ex: 'Un billete para Madrid, por favor.', exJa: 'マドリードまでの切符を1枚お願いします。', exEn: 'A ticket to Madrid, please.', note: 'スペインでは billete（中南米では boleto）。', noteEn: 'Spain says billete (Latin America: boleto).' }],
      ['de ida y vuelta', '往復', 'return / round trip', 'デ イダ イ ブエルタ', { ex: 'Ida y vuelta, por favor.', exJa: '往復でお願いします。', exEn: 'Return, please.', note: '片道は de ida / solo ida。', noteEn: 'One-way is de ida / solo ida.' }],
      ['el andén', '（駅の）ホーム', 'the platform', 'エル アンデン', { ex: '¿De qué andén sale?', exJa: 'どのホームから出ますか？', exEn: 'Which platform does it leave from?' }],
      ['un taxi', 'タクシー', 'a taxi', 'ウン タクシ', { ex: '¿Dónde puedo coger un taxi?', exJa: 'どこでタクシーに乗れますか？', exEn: 'Where can I get a taxi?' }],
      ['¿A qué hora sale…?', '…は何時に出発しますか？', 'What time does … leave?', 'ア ケ オラ サレ', { ex: '¿A qué hora sale el tren?', exJa: '列車は何時に出発しますか？', exEn: 'What time does the train leave?' }],
      ['la parada', '停留所', 'the stop', 'ラ パラダ', { ex: '¿Dónde está la parada de autobús?', exJa: 'バス停はどこですか？', exEn: 'Where is the bus stop?' }],
      ['¿Este tren va a Barcelona?', 'この電車はバルセロナに行きますか？', 'Does this train go to Barcelona?', 'エステ トレン バ ア バルセロナ'],
      ['la entrada', '入口', 'the entrance', 'ラ エントラダ'],
      ['la salida', '出口', 'the exit', 'ラ サリダ', { ex: '¿Dónde está la salida?', exJa: '出口はどこですか？', exEn: 'Where is the exit?' }],
    ],
  ),
  unit(
    'u10', '🆘', '困った時', 'Emergencies', 'Emergencias',
    '緊急番号は 112（警察・救急・消防共通、英語が通じることが多い）。観光地や地下鉄ではスリに注意。日本大使館はマドリード、バルセロナには総領事館があります。',
    'The emergency number is 112 (police, ambulance, fire; English often available). Watch for pickpockets in tourist areas and on the metro.',
    [
      ['¡Ayuda!', '助けて！', 'Help!', 'アユダ'],
      ['¿Me puede ayudar?', '手伝ってもらえますか？（丁寧）', 'Can you help me? (polite)', 'メ プエデ アユダール', { reg: 'usted' }],
      ['No entiendo.', 'わかりません。', "I don't understand.", 'ノ エンティエンド', { ex: 'Lo siento, no entiendo.', exJa: 'ごめんなさい、わかりません。', exEn: "Sorry, I don't understand." }],
      ['Más despacio, por favor.', 'もっとゆっくりお願いします。', 'More slowly, please.', 'マス デスパシオ ポル ファボール'],
      ['¿Puede repetir?', 'もう一度言ってもらえますか？（丁寧）', 'Could you repeat that? (polite)', 'プエデ レペティール', { reg: 'usted', ex: '¿Puede repetir, por favor?', exJa: 'もう一度言ってもらえますか？', exEn: 'Could you repeat that, please?' }],
      ['Llame a la policía.', '警察を呼んでください。', 'Call the police.', 'ヤメ ア ラ ポリシア', { reg: 'usted' }],
      ['el hospital', '病院', 'the hospital', 'エル オスピタル', { ex: 'Necesito ir al hospital.', exJa: '病院に行かなければなりません。', exEn: 'I need to go to the hospital.' }],
      ['la farmacia', '薬局', 'the pharmacy', 'ラ ファルマシア', { ex: '¿Hay una farmacia cerca?', exJa: '近くに薬局はありますか？', exEn: 'Is there a pharmacy nearby?', note: '緑の十字の看板が目印です。', noteEn: 'Look for the green cross sign.' }],
      ['Me duele aquí.', 'ここが痛いです。', 'It hurts here.', 'メ ドゥエレ アキ', { ex: 'Me duele la cabeza.', exJa: '頭が痛いです。', exEn: 'I have a headache.' }],
      ['Me han robado.', '盗まれました。', "I've been robbed.", 'メ アン ロバド', { ex: 'Me han robado la cartera.', exJa: '財布を盗まれました。', exEn: 'My wallet has been stolen.' }],
      ['He perdido el pasaporte.', 'パスポートをなくしました。', "I've lost my passport.", 'エ ペルディド エル パサポルテ'],
      ['el móvil', '携帯電話', 'mobile phone', 'エル モビル', { ex: 'He perdido el móvil.', exJa: '携帯をなくしました。', exEn: "I've lost my phone.", note: 'スペインでは móvil（中南米では celular）。', noteEn: 'Spain says móvil (Latin America: celular).' }],
      ['la embajada de Japón', '日本大使館', 'the Embassy of Japan', 'ラ エンバハダ デ ハポン', { note: '大使館はマドリード。バルセロナには総領事館（consulado）があります。', noteEn: 'The embassy is in Madrid; Barcelona has a consulate-general (consulado).' }],
    ],
  ),
];

export const ALL_ITEMS: Item[] = UNITS.flatMap((u) => u.items);
export const ITEM_BY_ID = new Map<string, Item>(ALL_ITEMS.map((i) => [i.id, i]));
export const UNIT_OF_ITEM = new Map<string, Unit>(
  UNITS.flatMap((u) => u.items.map((i) => [i.id, u] as [string, Unit])),
);

/** Split each unit into 3 short lessons of roughly equal size. */
function makeLessons(u: Unit): Lesson[] {
  const n = u.items.length;
  const count = Math.max(1, Math.ceil(n / 5));
  const lessons: Lesson[] = [];
  let start = 0;
  for (let k = 0; k < count; k++) {
    const size = Math.floor(n / count) + (k < n % count ? 1 : 0);
    lessons.push({
      id: `${u.id}-l${k + 1}`,
      unitId: u.id,
      index: k,
      itemIds: u.items.slice(start, start + size).map((i) => i.id),
    });
    start += size;
  }
  return lessons;
}

export const LESSONS: Lesson[] = UNITS.flatMap(makeLessons);
export const LESSON_BY_ID = new Map<string, Lesson>(LESSONS.map((l) => [l.id, l]));
export const lessonsOfUnit = (unitId: string): Lesson[] =>
  LESSONS.filter((l) => l.unitId === unitId);
