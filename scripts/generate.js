#include "./libs/JSON.js";

function main() {
    var continueConfirmation = confirm("You are going to use the NFT generator created by Funix. Are you sure you want to continue ?");

    if (!continueConfirmation) {
        return;
    }

    var supply = parseInt(prompt("How many images do you want to generate ?", "10"));
    var name = prompt("What is the name of your collection ?", "NFT-Collection");
    var description = prompt("What is the description for your collection ?", "");

    alert(supply + " images will be generated, so sit back relax and enjoy the art being generated.");

    var groups = app.activeDocument.layerSets;

    resetLayers(groups);

    for (var nftID = 0; nftID < supply; ++nftID) {
        var nft = {};

        nft.name = name + " #" + nftID + 1;
        nft.description = description;
        nft.image = "To be replaced";
        nft.edition = nftID;
        nft.attributes = [];

        for (var groupIterator = 0; groupIterator < groups.length; ++groupIterator) {
            var group = groups[groupIterator];
            var totalWeight = 0;
            var layerMap = [];

            for (var layerIterator = 0; layerIterator < group.layers.length; ++layerIterator) {
                var layer = group.layers[layerIterator];

                totalWeight += getRWeights(layer.name);
                layerMap.push({
                    index: layerIterator,
                    name: cleanName(layer.name),
                    weight: getRWeights(layer.name)
                });
            }

            var ran = Math.floor(Math.random() * totalWeight);

            (function() {
                for (var j = 0; j < group.layers.length; ++j) {
                    var layer = group.layers[j];

                    ran -= layerMap[j].weight;

                    if (ran < 0) {
                        layer.visible = true;

                        nft.attributes.push({
                            trait_type: group.name,
                            value: layerMap[j].name
                        })
                        return;
                    }
                }
            })()
        }

        saveImage(nft.edition);
        saveMetadata(nft);
        resetLayers(groups);
    }

    alert("Generation process is complete.");
}

function getRWeights(string) {
    var weight = Number(string.split("#").pop());

    if (isNaN(weight)) {
        weight = 1;
    }
    return weight;
}

function cleanName(string) {
    return string.split("#").shift();
}

function resetLayers(groups) {
    for (var i = 0; i < groups.length; i++) {
        groups[i].visible = true;

        for (var j = 0; j < groups[i].layers.length; j++) {
            groups[i].layers[j].visible = false;
        }
    }
}

function saveImage(edition) {
    var saveFile = new File(toFolder("build/images") + "/" + edition + ".png");
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

function saveMetadata(data) {
    var file = new File(toFolder("build/metadata") + "/" + data.edition + ".json");

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

main();
