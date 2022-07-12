function getTypesOfUserConfig() {
    var groups = app.activeDocument.layerSets;
    var typesValid = [];

    if (groups[0].name.toLowerCase() === "types") {
        var typesGroup = groups[0];
        var weightTypes = 0;
        var typesMap = [];

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
    return typesValid;
}
