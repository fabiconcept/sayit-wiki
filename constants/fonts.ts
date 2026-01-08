enum FontFamily {
    Bokor = 'bokor',
    BrunoAceSC = 'brunoAceSC',
    Codystar = 'codystar',
    DarkerGrotesque = 'darkerGrotesque',
    Ole = 'ole',
    Kablammo = 'kablammo',
    Matemasie = 'matemasie',
    MochiyPopOne = 'mochiyPopOne',
    Monoton = 'monoton',
    MontserratAlternates = 'montserratAlternates',
    ZCOOLQingKeHuangYou = 'zcoolQingKeHuangYou',
    OvertheRainbow = 'overtheRainbow',
    Schoolbell = 'schoolbell',
    SueEllenFrancisco = 'sueEllenFrancisco',
    UnifrakturMaguntia = 'unifrakturMaguntia'
}

interface FontData {
    name: string;
    isCursive: boolean;
    styleName: string;
}

const fontConfig: Record<FontFamily, FontData> = {
    [FontFamily.Bokor]: {
        name: 'Bokor',
        styleName: 'Ancient & Mystical 🗿',
        isCursive: false
    },
    [FontFamily.BrunoAceSC]: {
        name: 'BrunoAceSC',
        styleName: 'Bold & Futuristic 🚀',
        isCursive: false
    },
    [FontFamily.Codystar]: {
        name: 'Codystar',
        styleName: 'Sparkling ✨',
        isCursive: false
    },
    [FontFamily.DarkerGrotesque]: {
        name: 'DarkerGrotesque',
        styleName: 'Clean & Modern 🧼',
        isCursive: false
    },
    [FontFamily.Ole]: {
        name: 'Ole',
        styleName: 'Festive & Joyful 🎉',
        isCursive: false
    },
    [FontFamily.Kablammo]: {
        name: 'Kablammo',
        styleName: 'Explosive & Dynamic 🔥',
        isCursive: false
    },
    [FontFamily.Matemasie]: {
        name: 'Matemasie',
        styleName: 'Warm & Friendly 🤗',
        isCursive: false
    },
    [FontFamily.MochiyPopOne]: {
        name: 'MochiyPopOne',
        styleName: 'Playful & Bubbly 🍭',
        isCursive: false
    },
    [FontFamily.Monoton]: {
        name: 'Monoton',
        styleName: 'Retro & Groovy 🕺',
        isCursive: true
    },
    [FontFamily.MontserratAlternates]: {
        name: 'MontserratAlternates',
        styleName: 'Elegant & Refined 👑',
        isCursive: false
    },
    [FontFamily.ZCOOLQingKeHuangYou]: {
        name: 'ZCOOL QingKe HuangYou',
        styleName: 'Artistic & Expressive 🎨',
        isCursive: false
    },
    [FontFamily.OvertheRainbow]: {
        name: 'OvertheRainbow',
        styleName: 'Dreamy & Childlike 🌈',
        isCursive: true
    },
    [FontFamily.Schoolbell]: {
        name: 'Schoolbell',
        styleName: 'Casual & Handwritten ✏️',
        isCursive: true
    },
    [FontFamily.SueEllenFrancisco]: {
        name: 'SueEllenFrancisco',
        styleName: 'Personal & Intimate 💌',
        isCursive: true
    },
    [FontFamily.UnifrakturMaguntia]: {
        name: 'UnifrakturMaguntia',
        styleName: 'Gothic & Dramatic 🖤',
        isCursive: false
    }
};


export { fontConfig as Fonts, FontFamily };