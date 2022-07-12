var date = new Date();

function getRarityWeights(string) {
    var parsing = false;
    var data = "";

    for (var i = 0; i < string.length; ++i) {
        if (string[i] === charList.rarity) {
            parsing = true;
        } else if ((string[i] > '9' || string[i] < '0') && parsing) {
            break;
        } else {
            if (parsing) {
                data += string[i];
            }
        }
    }

    var weight = Number(data);

    if (isNaN(weight) || data.length === 0) {
        return 1;
    } else {
        return weight;
    }
}

function cleanName(string) {
    var words = string.split(/\s+/);
    var names = [];

    for (var wordIterator = 0; wordIterator < words.length; ++wordIterator) {
        var name = "";
        var skipping = false;

        for (var i = 0; i < words[wordIterator].length; ++i) {
            var c = words[wordIterator][i];

            if (c === charList.type || c === charList.rarity) {
                skipping = true;
            } else {
                if (!skipping) {
                    name += c;
                }
            }
        }

        if (name.length > 0) {
            names.push(name);
        }
    }

    return names.join(" ");
}

function resetLayers(groups) {
    for (var i = 0; i < groups.length; ++i) {
        var group = groups[i];

        group.visible = true;
        for (var j = 0; j < group.layers.length; ++j) {
            group.layers[j].visible = false;
        }
    }
}

function getTypes(string) {
    var words = string.split(/\s+/);
    var types = [];

    for (var i = 0; i < words.length; ++i) {
        var parsingType = false;
        var word = words[i];
        var type = "";

        for (var k = 0; k < word.length; ++k) {
            if (word[k] === charList.type) {
                if (parsingType) {
                    if (type.length > 0) {
                        types.push(type);
                        type = "";
                    }
                } else {
                    parsingType = true;
                }
            } else {
                if (parsingType) {
                    type += word[k];
                }
            }
        }

        if (type.length > 0) {
            types.push(type);
            type = "";
        }
    }
    return types;
}

function saveImage(edition) {
    var saveFile = new File(toFolder(getBuildFolderName() + "/images") + "/" + edition + ".png");
    var exportOptions = new ExportOptionsSaveForWeb();

    exportOptions.format = SaveDocumentType.PNG;
    exportOptions.PNG24 = false;
    exportOptions.transparency = true;
    exportOptions.interlaced = false;

    app.activeDocument.exportDocument(
        saveFile,
        ExportType.SAVEFORWEB,
        exportOptions
    );
}

//TODO get type in meta
function saveMetadata(data) {
    var file = new File(toFolder(getBuildFolderName() + "/metadata") + "/" + data.edition + ".json");

    file.encoding = "UTF8";
    file.open("w");
    file.write(JSON.stringify(data));
    file.close();
}

function toFolder(name) {
    var path = app.activeDocument.path;
    var folder = new Folder(path + "/" + name);

    if (!folder.exists) {
        folder.create();
    }
    return folder;
}

function getBuildFolderName() {
    return "build_" + date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear() + "_" + date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + "s";
}
