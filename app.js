// Configurazione
const config = {
    lang: 'it-IT',
    voiceName: 'Google italiano', // Impostato per la voce maschile italiana se disponibile
    defaultSearchEngine: 'https://www.google.com/search?q=',
    commands: {
        'ciao': 'saluta',
        'apri google': 'apriURL',
        'apri youtube': 'apriURL',
        'apri facebook': 'apriURL',
        'che ore sono': 'orario',
        'che giorno è': 'data',
        'apri calcolatrice': 'apriApp',
        'cerca': 'cerca',
        'wikipedia': 'wikipedia'
    },
    urls: {
        'google': 'https://www.google.com',
        'youtube': 'https://www.youtube.com',
        'facebook': 'https://www.facebook.com'
    }
};

// Elementi DOM
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// Classe principale per l'assistente vocale
class VoiceAssistant {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.setupRecognition();
        this.voices = [];
        this.loadVoices();
    }

    setupRecognition() {
        this.recognition.lang = config.lang;
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            content.textContent = transcript;
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Errore nel riconoscimento vocale:', event.error);
            this.speak('Mi dispiace, c\'è stato un errore nel riconoscimento vocale.');
        };
    }

    loadVoices() {
        return new Promise((resolve) => {
            const voicesChanged = () => {
                this.voices = this.synthesis.getVoices();
                if (this.voices.length !== 0) {
                    resolve();
                }
            };

            this.synthesis.onvoiceschanged = voicesChanged;
            voicesChanged();
        });
    }

    speak(text) {
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = config.lang;
            utterance.voice = this.voices.find(voice => voice.name.includes(config.voiceName) && voice.name.includes('Male'));

            if (!utterance.voice) {
                console.warn(`Voce ${config.voiceName} non trovata, usando la voce predefinita.`);
            }

            utterance.onend = () => resolve();
            utterance.onerror = (error) => reject(error);

            this.synthesis.speak(utterance);
        });
    }

    async processCommand(message) {
        for (const [key, value] of Object.entries(config.commands)) {
            if (message.includes(key)) {
                await this[value](message);
                return;
            }
        }
        await this.cerca(message);
    }

    async saluta() {
        const ora = new Date().getHours();
        let saluto;
        if (ora >= 5 && ora < 12) {
            saluto = "Buongiorno";
        } else if (ora >= 12 && ora < 18) {
            saluto = "Buon pomeriggio";
        } else {
            saluto = "Buonasera";
        }
        await this.speak(`${saluto}! Come posso aiutarti?`);
    }

    async apriURL(message) {
        const sito = message.split(' ').pop();
        if (config.urls[sito]) {
            window.open(config.urls[sito], '_blank');
            await this.speak(`Sto aprendo ${sito}`);
        } else {
            await this.speak(`Mi dispiace, non ho trovato un URL per ${sito}`);
        }
    }

    async orario() {
        const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        await this.speak(`Sono le ${ora}`);
    }

    async data() {
        const data = new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        await this.speak(`Oggi è ${data}`);
    }

    async apriApp(message) {
        const app = message.split(' ').pop();
        await this.speak(`Sto cercando di aprire ${app}`);
        // Qui andrebbe implementata la logica per aprire l'applicazione,
        // che dipende dal sistema operativo e dalle impostazioni di sicurezza
    }

    async cerca(query) {
        const url = `${config.defaultSearchEngine}${encodeURIComponent(query)}`;
        window.open(url, '_blank');
        await this.speak(`Ecco i risultati per la tua ricerca su ${query}`);
    }

    async wikipedia(message) {
        const query = message.replace('wikipedia', '').trim();
        const url = `https://it.wikipedia.org/wiki/${encodeURIComponent(query)}`;
        window.open(url, '_blank');
        await this.speak(`Ho aperto la pagina Wikipedia per ${query}`);
    }

    start() {
        this.recognition.start();
        content.textContent = "In ascolto...";
    }
}

// Inizializzazione
const assistant = new VoiceAssistant();

// Esegui il codice quando il DOM è completamente caricato
window.addEventListener('DOMContentLoaded', async () => {
    await assistant.loadVoices();
    await assistant.speak("Inizializzazione dell'assistente vocale...");
    await assistant.saluta();
    assistant.start();  // Avvia l'assistente vocale automaticamente
});

btn.addEventListener('click', () => assistant.start());

// Mostra le voci disponibili nel browser
async function showAvailableVoices() {
    await assistant.loadVoices();
    console.log("Voci disponibili:");
    assistant.voices.forEach(voice => {
        console.log(`${voice.name} (${voice.lang})`);
    });
}

// Chiamare questa funzione per vedere le voci disponibili nella console
showAvailableVoices();






/**  ORIGINALE
// Inizializzazione
const assistant = new VoiceAssistant();

window.addEventListener('load', async () => {
    await assistant.speak("Inizializzazione dell'assistente vocale...");
    await assistant.saluta();
});

btn.addEventListener('click', () => assistant.start());
**/





/*** 
Funzione showAvailableVoices:

Questa funzione carica le voci disponibili nel browser e le stampa nella console, insieme alle loro lingue. Puoi chiamare questa funzione per vedere quali voci sono disponibili e scegliere quella che desideri usare.
Modifica della funzione speak:

Ora, la funzione speak cerca la voce configurata tramite config.voiceName. Se non trova la voce specificata, utilizza la voce predefinita e avvisa tramite un console.warn.
Chiamata alla funzione showAvailableVoices:

Dopo aver inizializzato l'assistente vocale, puoi chiamare showAvailableVoices per vedere le voci disponibili. Questo è facoltativo ma utile per capire quali voci sono disponibili nel browser.
Gestione degli errori:

Se la voce specificata non viene trovata, viene utilizzata la voce predefinita del browser.
*/