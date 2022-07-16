function getTypesOfUserConfig(folderName) {
    var groups = app.activeDocument.layerSets;
    var typeData = {
        name: "toSet",
        typesValid: []
    }

    if (groups[0].name.toLowerCase() === folderName.toLowerCase()) {
        var typesGroup = groups[0];
        var weightTypes = 0;
        var typesMap = [];

        for (var i = 0; i < typesGroup.layers.length; ++i) {
            var typeLayer = typesGroup.layers[i];
            var typeWeight = getRarityWeights(typeLayer.name);

            weightTypes += typeWeight;
            typesMap.push({
                index: i,
                name: cleanName(typeLayer.name),
                types: getTypes(typeLayer.name),
                weight: typeWeight
            });
        }

        var random = Math.floor(Math.random() * weightTypes);

        for (var z = 0; z < typesMap.length; ++z) {
            var typeMapSelected = typesMap[z];

            random -= typeMapSelected.weight;
            if (random < 0) {
                typeData.name = typeMapSelected.name;
                typeData.typesValid = typeMapSelected.types;
                break;
            }
        }
    }
    return typeData;
}
