#!/usr/bin/env python3
"""Rend un document Markdown en .docx, aux couleurs de l'ambassade.

Usage : python3 scripts/document-docx.py docs/mon-document.md [sortie.docx]

Pourquoi Python ici, alors que le reste de `scripts/` est en JavaScript : un
.docx est une archive ZIP de fichiers XML, et Python sait produire les deux
sans dependance. Cote Node il aurait fallu ajouter une bibliotheque au depot
pour un document que l'on genere trois fois par an.

Le PDF sert a lire et a imprimer ; ce fichier-ci sert a REMPLIR. Les tableaux
y sont donc de vrais tableaux Word, avec des cellules vides ou l'ambassade
ecrit directement.
"""

import re
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

VERT = "009E60"
JAUNE = "FCD116"
ENCRE = "1F2D33"
GRIS = "4A5C64"
POLICE = "Trebuchet MS"

NS = (
    'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
)


def runs(texte):
    """Convertit le gras et le code d'une ligne en suite de runs Word."""
    morceaux = re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", texte)
    sortie = []
    for morceau in morceaux:
        if morceau == "":
            continue
        if morceau.startswith("**") and morceau.endswith("**"):
            contenu, gras, code = morceau[2:-2], True, False
        elif morceau.startswith("`") and morceau.endswith("`"):
            contenu, gras, code = morceau[1:-1], False, True
        else:
            contenu, gras, code = morceau, False, False
        proprietes = "<w:b/>" if gras else ""
        if code:
            proprietes += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
        sortie.append(
            f"<w:r><w:rPr>{proprietes}</w:rPr>"
            f'<w:t xml:space="preserve">{escape(contenu)}</w:t></w:r>'
        )
    return "".join(sortie) or '<w:r><w:t xml:space="preserve"></w:t></w:r>'


def paragraphe(texte, style=None, apres=120):
    pr = f'<w:pStyle w:val="{style}"/>' if style else ""
    return f'<w:p><w:pPr>{pr}<w:spacing w:after="{apres}"/></w:pPr>{runs(texte)}</w:p>'


def titre(texte, niveau):
    tailles = {1: 40, 2: 26, 3: 22}
    couleurs = {1: VERT, 2: VERT, 3: ENCRE}
    avant = 0 if niveau == 1 else 320
    bordure = (
        f'<w:pBdr><w:bottom w:val="single" w:sz="18" w:space="4" w:color="{JAUNE}"/></w:pBdr>'
        if niveau == 1
        else ""
    )
    return (
        f'<w:p><w:pPr>{bordure}<w:spacing w:before="{avant}" w:after="160"/>'
        f'<w:outlineLvl w:val="{niveau - 1}"/></w:pPr>'
        f'<w:r><w:rPr><w:b/><w:sz w:val="{tailles[niveau]}"/>'
        f'<w:color w:val="{couleurs[niveau]}"/></w:rPr>'
        f"<w:t>{escape(texte)}</w:t></w:r></w:p>"
    )


def puce(texte):
    return (
        '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
        f'<w:spacing w:after="60"/></w:pPr>{runs(texte)}</w:p>'
    )


def cellule(texte, entete=False, largeur=2000):
    fond = f'<w:shd w:val="clear" w:fill="{VERT}"/>' if entete else ""
    contenu = (
        f'<w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>{escape(texte)}</w:t></w:r>'
        if entete
        else runs(texte)
    )
    return (
        f'<w:tc><w:tcPr><w:tcW w:w="{largeur}" w:type="dxa"/>{fond}'
        '<w:vAlign w:val="center"/></w:tcPr>'
        f'<w:p><w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>{contenu}</w:p></w:tc>'
    )


def tableau(entetes, corps):
    colonnes = len(entetes)
    largeur = 9360 // colonnes
    bordure = (
        '<w:tblBorders>'
        + "".join(
            f'<w:{cote} w:val="single" w:sz="4" w:space="0" w:color="D9E0E3"/>'
            for cote in ("top", "left", "bottom", "right", "insideH", "insideV")
        )
        + "</w:tblBorders>"
    )
    grille = "".join(f'<w:gridCol w:w="{largeur}"/>' for _ in entetes)
    lignes = [
        "<w:tr><w:trPr><w:tblHeader/></w:trPr>"
        + "".join(cellule(c, True, largeur) for c in entetes)
        + "</w:tr>"
    ]
    for rang in corps:
        rang = (rang + [""] * colonnes)[:colonnes]
        lignes.append("<w:tr>" + "".join(cellule(c, False, largeur) for c in rang) + "</w:tr>")
    return (
        f'<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/>{bordure}</w:tblPr>'
        f"<w:tblGrid>{grille}</w:tblGrid>" + "".join(lignes) + "</w:tbl>"
        '<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>'
    )


def cellules(ligne):
    return [c.strip() for c in ligne.strip().strip("|").split("|")]


def corps_du_markdown(markdown):
    lignes = markdown.split("\n")
    sortie = []
    i = 0
    while i < len(lignes):
        ligne = lignes[i]

        if ligne.strip() == "":
            i += 1
            continue

        if re.fullmatch(r"-{3,}", ligne.strip()):
            sortie.append(
                '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="6" '
                'w:color="D9E0E3"/></w:pBdr><w:spacing w:after="200"/></w:pPr></w:p>'
            )
            i += 1
            continue

        entete = re.match(r"^(#{1,4})\s+(.*)$", ligne)
        if entete:
            sortie.append(titre(entete.group(2), min(len(entete.group(1)), 3)))
            i += 1
            continue

        if "|" in ligne and i + 1 < len(lignes) and re.match(r"^\|?\s*:?-{2,}", lignes[i + 1]):
            entetes = cellules(ligne)
            i += 2
            corps = []
            while i < len(lignes) and "|" in lignes[i] and lignes[i].strip() != "":
                corps.append(cellules(lignes[i]))
                i += 1
            sortie.append(tableau(entetes, corps))
            continue

        if re.match(r"^\s*[-*]\s+", ligne):
            while i < len(lignes) and re.match(r"^\s*[-*]\s+", lignes[i]):
                sortie.append(puce(re.sub(r"^\s*[-*]\s+", "", lignes[i])))
                i += 1
            continue

        if ligne.startswith(">"):
            bloc = []
            while i < len(lignes) and lignes[i].startswith(">"):
                bloc.append(re.sub(r"^>\s?", "", lignes[i]))
                i += 1
            sortie.append(paragraphe(" ".join(bloc)))
            continue

        bloc = []
        while (
            i < len(lignes)
            and lignes[i].strip() != ""
            and not re.match(r"^(#{1,4}\s|>|\s*[-*]\s|-{3,}$)", lignes[i])
            and "|" not in lignes[i]
        ):
            bloc.append(lignes[i].strip())
            i += 1
        if bloc:
            sortie.append(paragraphe(" ".join(bloc)))
        else:
            i += 1

    return "".join(sortie)


DOCUMENT = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    f"<w:document {NS}><w:body>{{corps}}"
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
    '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" '
    'w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>'
)

STYLES = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    f"<w:styles {NS}><w:docDefaults><w:rPrDefault><w:rPr>"
    f'<w:rFonts w:ascii="{POLICE}" w:hAnsi="{POLICE}" w:cs="{POLICE}"/>'
    f'<w:color w:val="{ENCRE}"/><w:sz w:val="21"/></w:rPr></w:rPrDefault>'
    '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/>'
    "</w:pPr></w:pPrDefault></w:docDefaults>"
    # Certaines versions de Word ignorent `docDefaults` si le style Normal
    # n'existe pas : la police y est donc redite plutot que supposee.
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
    '<w:name w:val="Normal"/><w:rPr>'
    f'<w:rFonts w:ascii="{POLICE}" w:hAnsi="{POLICE}" w:cs="{POLICE}"/>'
    f'<w:color w:val="{ENCRE}"/><w:sz w:val="21"/></w:rPr></w:style>'
    "</w:styles>"
)

NUMEROTATION = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    f"<w:numbering {NS}>"
    '<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0">'
    '<w:numFmt w:val="bullet"/><w:lvlText w:val="•"/>'
    '<w:pPr><w:ind w:left="454" w:hanging="227"/></w:pPr>'
    '<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr>'
    "</w:lvl></w:abstractNum>"
    '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'
)

TYPES = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>'
    "</Types>"
)

RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    "</Relationships>"
)

RELS_DOCUMENT = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>'
    "</Relationships>"
)


def main():
    if len(sys.argv) < 2:
        print("Usage : python3 scripts/document-docx.py <document.md> [sortie.docx]")
        return 1
    entree = Path(sys.argv[1])
    sortie = Path(sys.argv[2]) if len(sys.argv) > 2 else entree.with_suffix(".docx")
    sortie.parent.mkdir(parents=True, exist_ok=True)

    corps = corps_du_markdown(entree.read_text(encoding="utf-8"))

    with zipfile.ZipFile(sortie, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", TYPES)
        archive.writestr("_rels/.rels", RELS)
        archive.writestr("word/_rels/document.xml.rels", RELS_DOCUMENT)
        archive.writestr("word/document.xml", DOCUMENT.format(corps=corps))
        archive.writestr("word/styles.xml", STYLES)
        archive.writestr("word/numbering.xml", NUMEROTATION)

    print(sortie)
    return 0


if __name__ == "__main__":
    sys.exit(main())
