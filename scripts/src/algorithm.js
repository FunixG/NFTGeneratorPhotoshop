var typeLayerCacheIterator = -1;

function getTypesOfUserConfig(folderName) {
    var groups = app.activeDocument.layerSets;
    var typeData = {
        name: "toSet",
        typesValid: []
    }

    var groupIterator = 0;
    if (typeLayerCacheIterator !== -1) {
        groupIterator = typeLayerCacheIterator;
    }

    while (groupIterator < groups.length) {
        if (groups[groupIterator].name.toLowerCase() === folderName.toLowerCase()) {
            var typesGroup = groups[groupIterator];
            var weightTypes = 0;
            var typesMap = [];

            typeLayerCacheIterator = groupIterator;
            for (var i = 0; i < typesGroup.layers.length; ++i) {
                var typeLayer = typesGroup.layers[i];
                var typeWeight = getRarityWeights(typeLayer.name);

                weightTypes += typeWeight;
                typesMap.push({
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

            return typeData;
        }

        groupIterator++;
    }

    return null;

}
