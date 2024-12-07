//Datos del Proyecto
const nombre = "EL NOMBRE DE TU PROYECTO";
const descripcion = "DESCRIPCIÓN DEL PROYECTO";
const keywords = "keywords importantes separadas por coma";
const pais = "El país de tu proyecto";

//ChatGPT
const apiKey = ""; // Reemplaza con tu clave API
const url = "https://api.openai.com/v1/chat/completions";
const model = "gpt-4o-mini"
const token_input_price = 0.150;
const token_output_price = 0.6;


function ChatGPT(sys,user) {

  //Preparamos payload
  var payload = {
    model: model, // Modelo a usar
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user }
    ]
  };

  //Preparamos opciones
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + apiKey
    },
    payload: JSON.stringify(payload)
  };

  try {

    //Llamamos a Chat y procesamos respuesta
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    var theResponse = JSON.parse(jsonResponse.choices[0].message.content);

    //Buscamos rangos de las siguientes 3 columnas.
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var range = sheet.getActiveRange(); // Obtiene la celda activa
    
    var startRow = range.getRow();
    var startColumn = range.getColumn();

    var titleRange = sheet.getRange(startRow, startColumn + 1, 1, 1);
    var h1Range = sheet.getRange(startRow, startColumn + 2, 1, 1);
    var descRange = sheet.getRange(startRow, startColumn + 3, 1, 1);

    //Pintamos titulo, h1 y descripción
    titleRange.setValue(theResponse.title);
    h1Range.setValue(theResponse.h1);
    descRange.setValue(theResponse.description);

    //Calculamos precio de la ejecución 
    var in_tokens = jsonResponse.usage.total_tokens - jsonResponse.usage.completion_tokens;
    var out_tokens = jsonResponse.usage.completion_tokens;
    var in_token_price = (in_tokens*token_input_price)/1000000;
    var out_token_price = (out_tokens*token_output_price)/1000000;
    var price = (in_token_price+out_token_price);
    var price = Number(price.toFixed(8)); ;

    //Devolvemos precio
    return "$"+price;

  } 
  catch (error) {
    return error;
  }
}

function SEOTAGS(kw) {
  if ( kw == '' ) {
    return '';
  }
  else {

    //Prompt SEO
    const sys = `Actua como un profesional SEO, con conocimiento en Marketing y UX Writting. Proyecto: ${nombre}: ${descripcion}. País del proyecto: ${pais}. El usuario te proveerá de una keyword principal y un listado de keywords alternativas. Necesito que escribas con ellos lo siguiente: 
    
    1- una meta title para posicionar en Google (máximo 60 caracteres). 
    
    2 - Una meta description para posicionar en Google (máximo 150 caracteres).

    3 - Un H1 como título de la web para posicionar en Google (máximo 60 caracteres).

    Devuelve estos tres valores en formato json de la siguiente forma:

    { title, description, h1 }

    Envíame el JSON puro sin bloques de código ni formato adicional.
    
    `;
    const user = `Keyword principal: ${kw}. Keywords secundarias: ${keywords} `;
    return ChatGPT(sys,user);
  }
}
