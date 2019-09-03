const path = require('path');
const fs = require('fs');

var svgCollection={
    collections:{},
    /**
     * Efface les previews html
     */
    init(){
        //console.log("svgCollection init()",this.collections)
        //this.collections={};
    },
    /**
     * Construit les previews html
     */
    buildHtmlPreviews(){
        console.log("svgCollection buildHtmlPreviews()");
        for (let c in this.collections ){
            this.buildHtmlPreview(c);
        }
    },
    /**
     * Construit une preview html
     */
    buildHtmlPreview(collection){
        console.log("crée la preview html de "+collection);
        //mise à jour de la preview html
        let previewHtml="./dist/svg-collection/"+collection+".html";
        let html=fs.readFileSync("./_builders/svg-collection/main-preview.template.html");
        let svg=fs.readFileSync("./dist/svg-collection/"+collection+".svg");
        html=String(html).replace("${title}",""+collection+" svg symbol collection");
        html=String(html).replace("${svg}",svg);
        fs.writeFileSync(previewHtml, html, 'utf8', function(){});
    },
    /**
     * De la chaine svg-collection-toto/mon-icone.svg renvera svg-collection/toto.svg
     * @param file
     * @returns {string}
     */
    spritePathFromFilePath(file){
        let collection=this.collectionFromFilePath(file);
        return "svg-collection/"+collection+".svg";
    },
    /**
     * Dans la chaine svg-collection-toto/titi.svg renverra "toto"
     * @param file
     * @returns {string}
     */
    collectionFromFilePath(file){
        file=file.replace(/\\/g,"/");
        let matches = file.match(/svg-collection-([^\/.]*)\/(.*)+\.svg/);
        return matches[1];
    },
    symbolIdFromFilePath(file){
        file=file.replace(/\\/g,"/");
        let matches = file.match(/svg-collection-([^\/.]*)\/(.*)+\.svg/);
        let c = matches[1];
        let n = matches[2];
        n=n.replace(/\//g,"-");
        n=n.replace(/--/g,"-");
        //ajoute le fichier à la collection
        if(!this.collections[c]){
            this.collections[c]=true;
        }
        let id=c+"-"+n
        return id;


    }
};
module.exports = svgCollection;