// some global variables
var wordServerURL = "https://wordlist.netcare.se:1448";
var backupWords = ["ekumeniskt", "hoprasat", "labilares", "Kurland", "bladens", "guldskatt", "Xians", "vaxljusen", "knekt",
    "jobbigast", "alibin", "Julianas", "estraders", "vaggas", "isterband"];

var words = [];

var language = "swedish";
var returnWord = "---UNDEFINED---";
var playWord;
var guessedLetters = [];
var letterClickedIsBusy = false;
var playerHasWon = false;
var playerTries = 0;
var maxPlayerTries = 6;
var alphabet;


// Function that gets a word
function getWord(maxLength, minLength, language) {

    if (maxLength === "undefined") { maxLength = 15; }
    if (minLength === "undefined") { minLength = 5; }
    if (language === "undefined") { language = "swedish"; }

    returnWord = "---UNDEFINED---";
    console.log("Trying to call " + wordServerUrlBuilder(maxLength, minLength, language));
    
    $.ajax({
        type: "GET",
        url: wordServerUrlBuilder(maxLength, minLength, language),
        success: function (data) {
            returnWord = data;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("getWord could not get a word from " + wordServerUrlBuilder(maxLength, minLength, language));
            console.log(xhr.status);
            console.log(thrownError);
            returnWord = "test";
        },
        dataType: "json"
    });

          
}

function wordServerUrlBuilder(maxLength, minLength, language) {

    if (maxLength === "undefined") { maxLength = 15; }
    if (minLength === "undefined") { minLength = 5; }
    if (language === "undefined") { language = "swedish"; }

    return wordServerURL + '/get/' + language + '/word/between/' + minLength + '/and/' + maxLength + '/characters';
    
}


// Function that renders the alphabet
function renderAlphabet(letters) {

    letterClickedIsBusy = true; // We dont want letters being able to be clicked right now

    var htmlOutput = "";
    var currentLetter;
    for (i = 0; i < letters.length; i++) {
        currentLetter = letters[i];
        
        htmlOutput += "<a id='letter-" + i + "' href = '#' onclick = 'letterClicked(" + i + ")'>" + currentLetter + "</a>\r";
    }

    $("#letters").append(htmlOutput);

    letterClickedIsBusy = false; // OK let the user click all that the user wants
}


function buildMaskedWord() {

    // Lets loop over the playWord and display all correct letters. We will also count for a win.
    var maskedWord = "";
    var numberOfMasks = 0;
    for (var i = 0; i < playWord.length; i++) {

        // Check if the player have found the character in playWord at index position [i], if so display character.
        // If not, display "-"

        var currentLetter = playWord.charAt(i);
        
        //Å = 197
        //Ä = 196
        //Ö = 214
        

        //if (playWord.indexOf(String.fromCharCode(197)) > -1) {
        //    console.log("Ordet innehåller ett Å!");
        //}

        //if (playWord.indexOf(String.fromCharCode(196)) > -1) {
        //    console.log("Ordet innehåller ett Ä!");
        //}


        //if (playWord.indexOf(String.fromCharCode(214)) > -1) {
        //    console.log("Ordet innehåller ett Ö!");
        //}

        //for (var i = 0; i < playWord.length; i++) {
        //    console.log("Bokstav[" + i + "] (" + playWord.charAt(i) + " has ascii code " + playWord.charCodeAt(i));

        //}

 
        //console.log("currentLetter.charCodeAt(0)) = " + currentLetter.charCodeAt(0));

        //switch (currentLetter.charCodeAt[0]) {
        //    // case 197: currentLetter = "&Aring;".toString;

        //    case 197: currentLetter = escape(String.fromCharCode(197));
        //        console.log("curentLetter switched to &Aring;");
        //        break;
        //        // case 196: currentLetter = "&Auml;".tostring;
        //    case 196: currentLetter = escape(String.fromCharCode(196));
        //        console.log("curentLetter switched to &Auml;");
        //        break;
        //        // case 214: currentLetter = "&Ouml;".tostring;
        //    case 214: currentLetter = escape(String.fromCharCode(214));
        //        console.log("curentLetter switched to &Ouml;");
        //        break;
        //    default:
        //        break;

        //}

        //console.log("Currentletter after switch is " + currentLetter);

        //console.log("GuessedLetters = " + guessedLetters);
        //console.log("guessedLetters.indexOf(" + currentLetter + " ) = " + guessedLetters.indexOf(currentLetter));

        if (guessedLetters.indexOf(currentLetter) > -1) {   // a hit!
            maskedWord += currentLetter;
        }
        else {
            maskedWord += "*";
            numberOfMasks++;
        }

    }
    
    if (numberOfMasks === 0) { playerHasWon = true; }

    return maskedWord;

}


function renderMaskedWord(maskedWord) {

    $("#masked-word").empty();
    $("#masked-word").append(maskedWord);

}


// When the player clicks on a letter, we end up here
function letterClicked(letterNumber) {

    // Lets not allow more clicks until we are done here
    if (letterClickedIsBusy) {
        console.log("letterClicked too busy right now!");
        return;
    }
    letterClickedIsBusy = true;
    console.log("Letter number " + letterNumber + " clicked. The letter is " + alphabet.letters()[letterNumber]);

    $("#letter-" + letterNumber).css('visibility', 'hidden');

    // Lets put the letter in an array of clicked letters
    guessedLetters.push(alphabet.letters()[letterNumber]);
    
    renderMaskedWord(buildMaskedWord());

    if (playWord.indexOf(alphabet.letters()[letterNumber]) === -1) {   // bad letter, increase playerTries
        playerTries++;
        if (playerTries >= maxPlayerTries) { // Game over man!
            $("#main-picture").attr("src", "../images/hangman-" + playerTries + ".png");
            console.log("GAME OVER!!!!!!!!!!!");

            // Show correct word
            $("#correct-word-heading").removeClass('hidden');
            $("#correct-word").empty();
            $("#correct-word").append(playWord);
            
            
            // Show retry button
            $("#letters").empty();
            $("#letters").append("<a href = 'javascript:history.go(0)'>Klicka f&ouml;r att spela igen!</a>");
            
        } else {  // Change picture, player is closer to being hung
            $("#main-picture").attr("src", "../images/hangman-" + playerTries + ".png");
        }
    }

    if (playerHasWon === true) { // Do we have a winner?

        // Show winner picture
        $("#main-picture").attr("src", "../images/win.jpg");

        // Show retry button
        $("#letters").empty();
        $("#letters").append("<a href = 'javascript:history.go(0)'>Klicka f&ouml;r att spela igen!</a>");

    } else {

        letterClickedIsBusy = false;
    }
}


// Alphabet phactory
function AlphabetFactory() {
    this.createAlphabet = function (type) {
        var alphabet;

        if (type === "swedish") {
            alphabet = new Swedish();
        } else if (type === "english") {
            alphabet = new English();
        } else {
            throw "AlphabetFactory unknown alphabet - can not build " + type;
        }

    
        alphabet.type = type;
        alphabet.letters = function () { return this.lttrs; };
        alphabet.isLetterUsed = [];
        return alphabet;
    };
}

var Swedish = function () {
    this.lttrs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "&Aring;", "&Auml;", "&Ouml;", "-"];
    // this.lttrs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Å", "Ä", "Ö", "-"];
};

var English = function () {
    this.lttrs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "-"];
};



// Wait for a word to play with, we have ÅÄÖ problems so filter those!
function playWhenWeHaveAWord() {
    if ((returnWord !== "---UNDEFINED---"))

    {
        playWord = returnWord.toUpperCase();
        console.log("Now we can play with:" + playWord);
        playHangman();

    }
    else {
        console.log("Waiting for a good word to play with, now it is " + returnWord);
        setTimeout(playWhenWeHaveAWord, 250); // check again in after some millisecs

    }
}


function playHangman() {
    if ((playWord.indexOf(String.fromCharCode(197)) === -1)  // ÅÄÖ chars are messing with me tonight
            && (playWord.indexOf(String.fromCharCode(196)) === -1)
            && (playWord.indexOf(String.fromCharCode(214)) === -1)
        ) {

        var alphabetFactory = new AlphabetFactory();
        alphabet = alphabetFactory.createAlphabet("swedish");
        for (i = 0; i < alphabet.letters().length; i++) {
            alphabet.isLetterUsed[i] = false;
        }
        guessedLetters = []; // Emtpy the array of guessed letters

        var maskedWord = "";

        renderMaskedWord(buildMaskedWord());
        renderAlphabet(alphabet.letters());
    } else { // This might not be nice to the stack, but it is a temp fix...
        getWord(20, 10, 'swedish');
        playWhenWeHaveAWord();
    }
}


// The code starts here

getWord(20, 10, 'swedish');
playWhenWeHaveAWord();
    

    
