export default () => {
    function getMistakeIconSrc(mistakeType: MistakeType): string {
        switch (mistakeType) {
            case 'Death':
                return 'https://xivapi.com/i/015000/015286.png';
            case 'Damage Down':
                return 'https://xivapi.com/i/015000/015520.png';
            case 'Weakness':
                return 'https://xivapi.com/i/015000/015010.png';
            case 'Brink of Death':
                return 'https://xivapi.com/i/015000/015011.png';
            default:
                return '';
        }
    }

    function getMistakeIcon(mistake: PlayerMistake): string {
        return getMistakeIconSrc(mistake.type);
    }

    return { getMistakeIcon, getMistakeIconSrc }
}