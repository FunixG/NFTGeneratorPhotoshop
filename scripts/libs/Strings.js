function stringContains(string, toCheck) {
    for (var stringIt = 0; stringIt < string.length; ++stringIt) {
        if (toCheck[0] === string[stringIt] && __checkValidContains(string, stringIt, toCheck)) {
            return true;
        }
    }
    return false;
}

function __checkValidContains(string, stringIt, toCheck) {
    var i = stringIt;

    for (var checkIt = 0; checkIt < toCheck.length; ++checkIt, ++i) {
        if (toCheck[checkIt] !== string[i]) {
            return false;
        }
    }
    return true;
}
