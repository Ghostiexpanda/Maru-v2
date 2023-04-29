module.exports = {

    formatNumber: (number, minimumFractionDigits = 0) => {
        return Number.parseFloat(number).toLocaleString(undefined, {
            minimumFractionDigits,
            maximumFractionDigits: 2
        });
    },

    embedURL: (title, url, display) => {
        return `[${title}](${url.replace(/\)/g, '%27')}${display ? ` "${display}"` : ''})`;
    },

    generateCode: (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    getRandomColor: () => {
        const randomColor = Math.floor(Math.random() * 16777215);
        const hexColor = randomColor.toString(16).padStart(6, '0');
        return '#' + hexColor;
    },
}