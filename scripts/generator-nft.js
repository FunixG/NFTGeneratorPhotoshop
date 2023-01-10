#include "./libs/JSON.js";
#include "./libs/Strings.js";

#include "./src/utils.js";
#include "./src/algorithm.js";
#include "./src/resume-generation.js";

var charList = {
    type: "@",
    rarity: "#"
}
var layerIngoreMetadtaName = "none";

function main() {
    var continueConfirmation = confirm("You are going to use the NFT generator created by Funix. Are you sure you want to continue ?");
    if (!continueConfirmation) {
        return;
    }

    var supply = parseInt(prompt("How many images do you want to generate ?", "10"));
    var name = prompt("What is the name of your collection ?", "NFT-Collection");
    var description = prompt("What is the description for your collection ?", "NFT-Description");
    var needDiffStart = confirm("Do you want a different start ID ? Useful when you want to add new NFT to an existing collection.");
    var startId = 0;

    if (needDiffStart) {
        startId = parseInt(prompt("Please set the start ID. (The last id of your collection generated)", "1"));

        if (startId === null || isNaN(startId)) {
            alert("You need to enter a valid start ID number.");
            return;
        }
        if (startId < 2) {
            startId = 0;
        }
    }

    if (supply === null || isNaN(supply)) {
        alert("You need to enter a valid number of images you want to generate.");
        return;
    }
    if (name === null || name.length === 0) {
        alert("You can't have an empty collection name.");
        return;
    }
    if (description === null || description.length === 0) {
        alert("You can't have an empty collection description");
        return;
    }

    var rarityUserCheck = confirm("This script use a rarity (weight) system. You can add # on your layers names to define a rarity. Do you want to continue ?\nPlease see the documentation on github.")
    if (!rarityUserCheck) {
        return;
    }

    var usingTypes = confirm("Are you using genres or types for your collection ? You can create differents types for the generation.\nCheck the documentation on github.");
    var typesFolderName = "types";
    var typesInMeta = false;
    if (usingTypes) {
        typesFolderName = prompt("What's the name of the folder in photoshop containing the types ?", "types").toLowerCase();
        if (typesFolderName === null || typesFolderName.length === 0) {
            alert("You can't have an empty types folder name. Example -> types");
            return;
        }

        typesInMeta = confirm("Do you want to have types in the metadata ?");
    }

    var lowBitsExport = confirm("Do you want that the NFT will be exported in format PNG-8 instead of PNG-24 ?\nSay yes for PNG-8 (256 colors max)\nSay no for PNG-24 (~16 millions colors)");

    var confirmExecution = confirm(supply + " images will be generated. Do you want proceed ? It's a long execution and you will need to wait. (Photoshop will be frozen during the run)");
    if (!confirmExecution) {
        return;
    }

    var groups = app.activeDocument.layerSets;
    if (groups.length === 0) {
        alert("You do not have any groups. Please create folders to have parts. Please check the documentation on github.");
        return;
    }

    //Make sure that the project is set up properly, no layers visible
    resetLayers(groups);

    initResume(usingTypes, typesFolderName);

    /*
    Main program loop
    Used to generate the NFT collection
    */
    var limitLoop = supply + startId;
    for (var nftID = startId; nftID < limitLoop; ++nftID) {
        var nft = {};

        nft.name = "toSet";
        nft.description = description;
        nft.image = "To be replaced";
        nft.edition = (nftID + 1).toString();
        nft.attributes = [];

        //Object to know the type definition, used when the NFT artist want to define genres for the collection, example: Male, Female, Robot, Etc...
        var typeData = {
            name: "toSet",
            typesValid: []
        }

        //This part of code is used to get the infos about the type
        if (usingTypes) {
            typeData = getTypesOfUserConfig(typesFolderName);
            if (typeData === null) {
                alert("The folder " + typesFolderName + " does not exists on your projet for the types definition.");
                return;
            }
        }

        if (usingTypes && typesInMeta) {
            nft.attributes.push({
                trait_type: typesFolderName,
                value: typeData.name
            });
        }

        for (var groupIterator = 0; groupIterator < groups.length; ++groupIterator) {
            var group = groups[groupIterator];
            var totalWeight = 0;
            var layerMap = [];

            if (usingTypes && group.name.toLowerCase() === typesFolderName) {
                continue;
            } else if (usingTypes && !groupUsable(group, typeData.typesValid)) {
                continue;
            }

            //For loop used to collect all the layers and total weight
            for (var layerIterator = 0; layerIterator < group.layers.length; ++layerIterator) {
                var layer = group.layers[layerIterator];
                var rarityWeight = getRarityWeights(layer.name);

                totalWeight += rarityWeight;
                layerMap.push({
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

                    if (!stringContains(layerMapSelected.name.toLowerCase(), layerIngoreMetadtaName)) {
                        nft.attributes.push({
                            trait_type: group.name,
                            value: layerMapSelected.name
                        });
                    }

                    addCategoryAndTrait(group.name, layerMapSelected.name);

                    found = true;
                    break;
                }
            }
        }

        if (usingTypes) {
            addTypeInResume(typeData.name);
            nft.name = typeData.name + " #" + nft.edition;
        } else {
            nft.name = name + " #" + nft.edition;
        }

        saveImage(nft.edition, lowBitsExport);
        saveMetadata(nft);
        resetLayers(groups);
    }

    writeResumeFile(supply, name, description, usingTypes, typesInMeta, lowBitsExport);

    alert(
        "Generation process is complete.\n" +
        "Build folder: " + getBuildFolderName() + "\n" +
        "Thanks for using this generator <3.\n\n" +
        "If you want to support me: Twitter @FunixGaming\n" +
        "E-Mail: contact@funixgaming.fr"
    );
}

main();
