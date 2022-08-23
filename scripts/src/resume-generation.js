var resumeList = []

function initResume(usingTypes, typesFolderName) {
    var groups = app.activeDocument.layerSets;

    for (var groupIterator = 0; groupIterator < groups.length; ++groupIterator) {
        var group = groups[groupIterator];

        if (usingTypes && group.name.toLowerCase() === typesFolderName) {
            continue;
        } else {
            var resume = {
                category: group.name,
                traits: []
            }

            for (var layerIterator = 0; layerIterator < group.layers.length; ++layerIterator) {
                var layer = group.layers[layerIterator];
                var trait = {
                    trait: cleanName(layer.name),
                    timesSeen: 0
                }

                resume.traits.push(trait);
            }

            resumeList.push(resume);
        }
    }
}

function addCategoryAndTrait(category, trait) {
    for (var i = 0; i < resumeList.length; ++i) {
        var resume = resumeList[i];

        if (resume.category === category) {

            for (var k = 0; k < resume.traits.length; ++k) {
                if (resume.traits[k].trait === trait) {
                    ++resumeList[i].traits[k].timesSeen;
                    return;
                }
            }
        }
    }
}

function writeResumeFile() {
    var buildFolder = getBuildFolderName();
    var resumeFile = new File(toFolder(buildFolder) + "/resume-generation.txt");
    var data = "/**\n" +
        "* File generated by the script created by Funix.\n" +
        "* Used to see how many times the layers have been selected for your collection.\n" +
        "* Twitter: @FunixGaming\n" +
        "* E-Mail: contact@funixgaming.fr\n" +
        "* \n" +
        "* Generated at " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "\n" +
        "**/\n\n";

    for (var i = 0; i < resumeList.length; ++i) {
        var resume = resumeList[i];

        data += "- " + resume.category + "\n";
        for (var k = 0; k < resume.traits.length; ++k) {
            var trait = resume.traits[k];

            data += trait.trait + " (" + trait.timesSeen + " times used)\n"
        }
        data += "\n";
    }

    resumeFile.encoding = "UTF8";
    resumeFile.open("w");
    resumeFile.write(data);
    resumeFile.close();
}
