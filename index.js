// This code is written in english so others don't get confused by mixing languages, 
// the prompts will be in portuguese 
//and the comments, constants and variables will be in english
const fs = require('fs');
const readline = require('readline');
const EventEmitter = require('events');

class SummaryEmitter extends EventEmitter { }
const summaryEmitter = new SummaryEmitter();
// Date.now will be used to collect the time 2 times, at the start and at the end, then the end time will be subtracted from the start time, giving us the run time
// fileStream  allows the program to read the file in a more efficient manner and readline creates an interface for file reading
async function processFile(filePath) {
    const start = Date.now();
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Defined sum and textLines as variables and set their initial values to zero
    let sum = 0;
    let textLines = 0;
    // Finds lines that have numbers in them, transforms them from strings into numbers, then adds them up to sum
    // If contains leters from a-z and A-Z it also adds 1 to textLines
    for await (const line of rl) {
        const numbers = line.match(/\d+/g);
        if (numbers) {
            sum += numbers.reduce((acc, num) => acc + parseInt(num, 10), 0);
        }
        if (line.match(/[a-zA-Z]/) || (numbers && numbers.length > 0)) {
            textLines++;
        }
    }
    // Heres the second instance of Date.now in order to subtract end from start and get the application run time
    const end = Date.now();
    const timeTaken = end - start;
    // this emits the event
    summaryEmitter.emit('summary', { sum, textLines, timeTaken });
}
// Asks for file path(duh) and looks for it, if it finds a file it starts the processFile asyncronous function, if it dosent it gives an error message,
// after its done it will run the askToRunAgain function
function askFilePath() {
    console.log('Digite o caminho do arquivo txt:');
    process.stdin.once('data', async (data) => {
        const filePath = data.toString().trim();
        try {
            await processFile(filePath);
        } catch (error) {
            console.error('Erro ao ler o arquivo:', error);
        }
        askToRunAgain();
    });
}
// Asks for user input, if the input is 's' the application restarts, anything else it ends the application.
function askToRunAgain() {
    console.log('Deseja executar novamente? (s/n)');
    process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 's') {
            askFilePath();
        } else {
            console.log('Encerrando a aplicação.');
            process.exit();
        }
    });
}
// This listens for especific events 
summaryEmitter.on('summary', ({ sum, textLines, timeTaken }) => {
    console.log('--- Resumo ---');
    console.log(`Soma dos números: ${sum}`);
    console.log(`Linhas com texto: ${textLines}`);
    console.log(`Tempo de execução: ${timeTaken}ms`);
    console.log('---------------');
});

// Starts the application
askFilePath();