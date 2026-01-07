enum FontFamily {
    Bokor = 'bokor',
    BrunoAceSC = 'brunoAceSC',
    Codystar = 'codystar',
    DarkerGrotesque = 'darkerGrotesque',
    ImperialScript = 'imperialScript',
    Kablammo = 'kablammo',
    Matemasie = 'matemasie',
    MochiyPopOne = 'mochiyPopOne',
    Monoton = 'monoton',
    MontserratAlternates = 'montserratAlternates',
    Ole = 'ole',
    OvertheRainbow = 'overtheRainbow',
    Schoolbell = 'schoolbell',
    SueEllenFrancisco = 'sueEllenFrancisco',
    UnifrakturMaguntia = 'unifrakturMaguntia'
}

interface FontData {
    name: string;
    isCursive: boolean;
}

const fontConfig: Record<FontFamily, FontData> = {
    [FontFamily.Bokor]: {
        name: 'Bokor',
        isCursive: false
    },
    [FontFamily.BrunoAceSC]: {
        name: 'BrunoAceSC',
        isCursive: false
    },
    [FontFamily.Codystar]: {
        name: 'Codystar',
        isCursive: false
    },
    [FontFamily.DarkerGrotesque]: {
        name: 'DarkerGrotesque',
        isCursive: false
    },
    [FontFamily.ImperialScript]: {
        name: 'ImperialScript',
        isCursive: true
    },
    [FontFamily.Kablammo]: {
        name: 'Kablammo',
        isCursive: false
    },
    [FontFamily.Matemasie]: {
        name: 'Matemasie',
        isCursive: false
    },
    [FontFamily.MochiyPopOne]: {
        name: 'MochiyPopOne',
        isCursive: false
    },
    [FontFamily.Monoton]: {
        name: 'Monoton',
        isCursive: true
    },
    [FontFamily.MontserratAlternates]: {
        name: 'MontserratAlternates',
        isCursive: false
    },
    [FontFamily.Ole]: {
        name: 'Ole',
        isCursive: true
    },
    [FontFamily.OvertheRainbow]: {
        name: 'OvertheRainbow',
        isCursive: true
    },
    [FontFamily.Schoolbell]: {
        name: 'Schoolbell',
        isCursive: true
    },
    [FontFamily.SueEllenFrancisco]: {
        name: 'SueEllenFrancisco',
        isCursive: true
    },
    [FontFamily.UnifrakturMaguntia]: {
        name: 'UnifrakturMaguntia',
        isCursive: false
    }
};

export { fontConfig as Fonts, FontFamily };