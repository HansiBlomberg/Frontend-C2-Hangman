


// Function that renders the alphabet
function renderAlphabet(letters) {

    var htmlOutput = "";
   
    for (i = 0; i < letters.length; i++) {
        htmlOutput += "<a id='letter-" + i + "' href = '#'>" + letters[i] + "</a>\r";
    }

    $("#letters").append(htmlOutput);

}




// Alphabet phactory

function AlphabetFactory() {
    this.createAlphabet = function (type) {
        var alphabet;

        if (type === "swedish") {
            alphabet = new Swedish();
        } else if (type === "english") {
            alphabet = new English();
        } else throw "AlphabetFactory unknown alphabet - can not build " + type;
       
        // employee.type = type;
        // employee.say = function () {
        //     log.add(this.type + ": rate " + this.hourly + "/hour");
        // }
        // return employee;

        alphabet.type = type;
        alphabet.letters = function () { return this.lttrs };
        return alphabet;
                
    }
}

var Swedish = function () {
    this.lttrs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "&Aring;", "&Auml;", "&Ouml;"];
};

var English = function () {
    this.lttrs = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
};




function run() {
    var alphabetFactory = new AlphabetFactory();
    var alphabet = alphabetFactory.createAlphabet("swedish");
    renderAlphabet(alphabet.letters());
  


    
}


run();