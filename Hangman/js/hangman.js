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
    var playWordAaAeOo = "";


    // Ugly fix to handle the ÅÄÖ problem we have atm
    //Å => +
    //Ä => !
    //Ö => >

    for (var i = 0; i < playWord.length; i++) {
        switch(playWord.charCodeAt(i)) {
            case 197 : playWordAaAeOo += "+";
                break;
            case 196 :  playWordAaAeOo += "!";
                break;
            case 214 :  playWordAaAeOo += ">";
                break;
            default: playWordAaAeOo += playWord[i];
        
        } 
    }


    for (var i = 0; i < playWord.length; i++) {

        // Check if the player have found the character in playWord at index position [i], if so display character.
        // If not, display "-"

        var currentLetter = playWordAaAeOo.charAt(i);
        

        if (guessedLetters.indexOf(currentLetter) > -1) {   // a hit!
            maskedWord += playWord.charAt(i);
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
    // console.log("Letter number " + letterNumber + " clicked. The letter is " + alphabet.letters()[letterNumber]);

    $("#letter-" + letterNumber).css('visibility', 'hidden');

    // Lets put the letter in an array of clicked letters
    guessedLetters.push(alphabet.letters()[letterNumber]);

    // If ÅÄÖ add special token also
    switch (alphabet.letters()[letterNumber]) {

        case "&Aring;": guessedLetters.push("+");
            break;
        case "&Auml;": guessedLetters.push("!");
            break;
        case "&Ouml;": guessedLetters.push(">");
            break;
       
    }
    
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
   
        var alphabetFactory = new AlphabetFactory();
        alphabet = alphabetFactory.createAlphabet("swedish");
        for (i = 0; i < alphabet.letters().length; i++) {
            alphabet.isLetterUsed[i] = false;
        }
        guessedLetters = []; // Emtpy the array of guessed letters

        var maskedWord = "";

        renderMaskedWord(buildMaskedWord());
        renderAlphabet(alphabet.letters());
   
}


// The code starts here

getWord(20, 10, 'swedish');
playWhenWeHaveAWord();
    

    
