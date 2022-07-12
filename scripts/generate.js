#include "./libs/JSON.js";

var date = new Date();

var charList = {
    type: "@",
    rarity: "#"
}

function main() {
    var continueConfirmation = confirm("You are going to use the NFT generator created by Funix. Are you sure you want to continue ?");
    if (!continueConfirmation) {
        return;
    }

    var supply = parseInt(prompt("How many images do you want to generate ?", "10"));
    var name = prompt("What is the name of your collection ?", "NFT-Collection");
    var description = prompt("What is the description for your collection ?", "");

    var confirmExecution = confirm(supply + " images will be generated. Do you want proceed ? It's a long execution and you will need to wait.");
    if (!confirmExecution) {
        return;
    }

    var groups = app.activeDocument.layerSets;
    if (groups.length === 0) {
        alert("You have no groups. Please create folders to have parts.")
        return;
    }
    resetLayers(groups);

    for (var nftID = 0; nftID < supply; ++nftID) {
        var nft = {};

        nft.name = name + " #" + nftID + 1;
        nft.description = description;
        nft.image = "To be replaced";
        nft.edition = nftID + 1;
        nft.attributes = [];

        var userTypesConfig = false;
        var typesValid = [];

        if (groups[0].name.toLowerCase() === "types") {
            var typesGroup = groups[0];
            var weightTypes = 0;
            var typesMap = [];
            userTypesConfig = true;

            for (var i = 0; i < typesGroup.layers.length; ++i) {
                var typeLayer = typesGroup.layers[i];
                var typeWeight = getRarityWeights(typeLayer.name);

                weightTypes += typeWeight;
                typesMap.push({
                    index: i,
                    types: getTypes(typeLayer.name),
                    weight: typeWeight
                });
            }

            var random = Math.floor(Math.random() * weightTypes);

            for (var z = 0; z < typesMap.length; ++z) {
                var typeMapSelected = typesMap[z];

                random -= typeMapSelected.weight;
                if (random < 0) {
                    typesValid = typeMapSelected.types;
                    break;
                }
            }
        }

        for (var groupIterator = (userTypesConfig ? 1 : 0); groupIterator < groups.length; ++groupIterator) {
            var group = groups[groupIterator];
            var totalWeight = 0;
            var layerMap = [];

            for (var layerIterator = 0; layerIterator < group.layers.length; ++layerIterator) {
                var layer = group.layers[layerIterator];
                var rarityWeight = getRarityWeights(layer.name);

                totalWeight += rarityWeight;
                layerMap.push({
                    index: layerIterator,
                    name: cleanName(layer.name),
                    weight: rarityWeight,
                    types: getTypes(layer.name)
                });
            }

            var ran = Math.floor(Math.random() * totalWeight);

            for (var j = 0; j < group.layers.length; ++j) {
                var layerGet = group.layers[j];
                var layerMapSelected = layerMap[j];

                ran -= layerMapSelected.weight;

                if (ran < 0 && isPartIsTypeValid(layerMapSelected.types, typesValid)) {
                    layerGet.visible = true;

                    if (typesValid.length === 0) {
                        typesValid = layerMapSelected.types;
                    }

                    nft.attributes.push({
                        trait_type: group.name,
                        value: layerMapSelected.name
                    })
                    break;
                }
            }
        }

        saveImage(nft.edition);
        saveMetadata(nft);
        resetLayers(groups);
    }

    alert(
        "Generation process is complete.\n" +
        "Build folder: " + getBuildFolderName() + "\n" +
        "Thanks for using this generator <3.\n\n" +
        "If you want to support me: Twitter @FunixGaming"
    );
}

function isPartIsTypeValid(types, typesValid) {
    if (typesValid.length === 0) {
        return true;
    } else {
        for (var i = 0; i < types.length; ++i) {
            for (var k = 0; k < typesValid.length; ++k) {
                if (typesValid[k].toLowerCase() === types[i].toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }
}

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

    if (isNaN(weight)) {
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

main();
