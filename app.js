const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const exceljs = require('exceljs');
const moment = require('moment');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

// Guarda la sesion
const client = new Client({
  authStrategy: new LocalAuth(),
});

// spinner cargando al iniciar
const spinners = require('cli-spinners');
const spinner = spinners.dots; 
const spinnerColor = chalk.blue; // Elige un color para el spinner
const startSpinner = () => {
  let i = 0;
  return setInterval(() => {
    const frame = spinnerColor(spinner.frames[i++ % spinner.frames.length]);
    process.stdout.write(chalk.yellow(`\r${frame} Cargando sesión...`));
  }, spinner.interval);
}
const spinnerInterval = startSpinner();

client.on('qr', (qr) => {
  console.log('\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  clearInterval(spinnerInterval);
  console.log(chalk.green('\nConexión exitosa!'));
});

client.on('message', (msg) => {
  const { from, to, body } = msg;
  const bl = body.toLowerCase();

  if (bl === 'info') {
    client.sendMessage(msg.from, 'Información');
  } else if (bl === 'hola') {
    client.sendMessage(msg.from, '👋 Hola! Soy el Robot Asistente de la empresa x🤖💼');
  } else if (bl === 'adios' || bl === 'chao' || bl === 'nos vemos' || bl === 'hasta mañana' ) {
    client.sendMessage(msg.from, '🚀💫  Nos vemos. Mi código está listo para asistirte cuando lo necesites. 🤖🌌 ¡Hasta la próxima brillante interacción! 👋😃');
  } else if (bl === 'imagen') {
    const mediaFile = MessageMedia.fromFilePath('./media/img.jpg');
    client.sendMessage(msg.from, 'Prueba envio de imagen');
    client.sendMessage(msg.from, mediaFile);
  }

  saveHistorial(from, body)
  console.log(chalk.yellow(body));
});

const saveHistorial = (number, message) => {
  const pathChat = `./chats/${number}.xlsx`;
  const workbook = new exceljs.Workbook();
  const today = moment().format('DD-MM-YYYY hh:mm');

  // Si existe el archivo xlsx guarda los chats
  if (fs.existsSync(pathChat)) {
    workbook.xlsx.readFile(pathChat)
      .then(() => {
        const worksheet = workbook.getWorksheet(1);
        const lastRow = worksheet.lastRow;
        let getRowInsert = worksheet.getRow(++(lastRow.number));
        getRowInsert.getCell('A').value = today;
        getRowInsert.getCell('B').value = message;
        getRowInsert.commit();
        workbook.xlsx.writeFile(pathChat)
          .then(() => {
            console.log('Se agrego chat!');
          })
          .catch((error) => {
            console.log('Algo falló al guardar el chat:', error);
          });
      })
      .catch((error) => {
        console.log('No se pudo leer XLSX o no existe');
      });
  } else {
    // Si no existe lo crea y guarda el mensaje
    const worksheet = workbook.addWorksheet('chats');
    worksheet.columns = [
      { header: 'Fecha', key: 'date' },
      { header: 'Mensaje', key: 'message' },
    ]
    worksheet.addRow([today, message])
    workbook.xlsx.writeFile(pathChat)
      .then(() => {
        console.log('Historial creado!');
      })
      .catch((error) => {
        console.log('Algo falló al guardar xlsx:', error);
      });
  }
}

client.initialize();