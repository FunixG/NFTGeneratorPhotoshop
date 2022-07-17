#include "./libs/JSON.js";

#include "./src/utils.js";
#include "./src/algorithm.js";

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

    var rarityUserCheck = confirm("This script use a rarity system. You can add # on your layers names to define a rarity. Do you want to continue ?\nPlease see the documentation on github.")
    if (!rarityUserCheck) {
        return;
    }

    var usingTypes = confirm("Are you using genres or types for your collection ? You can create differents types for the generation.\nCheck the documentation on github.");
    var typesFolderName = "types";
    var typesInMeta = false;
    if (usingTypes) {
        typesFolderName = prompt("What's the name of the folder containing the types ?", "types");
        typesInMeta = confirm("Do you want to have types in the metadata ?");
    }

    var lowBitsExport = confirm("Do you want that the NFT will be exported in format PNG-8 instead of PNG-24 ?\nSay yes for PNG-8 (256 colors max)\nSay no for PNG-24 (~16 millions colors)");

    var confirmExecution = confirm(supply + " images will be generated. Do you want proceed ? It's a long execution and you will need to wait. (Photoshop will be frozen during the run)");
    if (!confirmExecution) {
        return;
    }

    var groups = app.activeDocument.layerSets;
    if (groups.length === 0) {
        alert("You have no groups. Please create folders to have parts. Please check the documentation on github.");
        return;
    }

    resetLayers(groups);

    for (var nftID = 0; nftID < supply; ++nftID) {
        var nft = {};

        nft.name = name + " #" + nftID + 1;
        nft.description = description;
        nft.image = "To be replaced";
        nft.edition = nftID + 1;
        if (usingTypes && typesInMeta) {
            nft.genre = "toSet";
        }
        nft.attributes = [];

        var typeData = {
            name: "toSet",
            typesValid: []
        }

        if (usingTypes) {
            typeData = getTypesOfUserConfig(typesFolderName);
        }

        for (var groupIterator = (usingTypes ? 1 : 0); groupIterator < groups.length; ++groupIterator) {
            var group = groups[groupIterator];
            var totalWeight = 0;
            var layerMap = [];

            for (var layerIterator = 0; layerIterator < group.layers.length; ++layerIterator) {
                var layer = group.layers[layerIterator];
                var rarityWeight = getRarityWeights(layer.name);

                totalWeight += rarityWeight;
                layerMap.push({
                    index: layerIterator,
                    weight: rarityWeight,
                    name: cleanName(layer.name),
                    types: getTypes(layer.name)
                });
            }

            var ran = Math.floor(Math.random() * totalWeight);

            var found = false;
            for (var j = 0; found === false; ++j) {
                var layerRandomiser = Math.floor(Math.random() * group.layers.length);
                var layerGet = group.layers[layerRandomiser];
                var layerMapSelected = layerMap[layerRandomiser];

                ran -= layerMapSelected.weight;

                if (ran < 0 && isPartIsTypeValid(layerMapSelected.types, typeData.typesValid, usingTypes)) {
                    layerGet.visible = true;

                    if (typeData.typesValid.length === 0) {
                        typeData.typesValid = layerMapSelected.types;
                    }

                    nft.attributes.push({
                        trait_type: group.name,
                        value: layerMapSelected.name
                    })
                    found = true;
                    break;
                }
            }
        }

        if (usingTypes && typesInMeta) {
            nft.genre = typeData.name;
        }

        saveImage(nft.edition, lowBitsExport);
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

function isPartIsTypeValid(types, typesValid, usingTypes) {
    if (!usingTypes || typesValid.length === 0) {
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

main();
