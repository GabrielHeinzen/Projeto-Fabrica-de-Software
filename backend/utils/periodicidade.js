function calcularProximoVencimento(dataAtual, periodicidade) {

    const data = new Date(dataAtual);

    switch (periodicidade) {

        case 'MENSAL':
            data.setMonth(data.getMonth() + 1);
            break;

        case 'TRIMESTRAL':
            data.setMonth(data.getMonth() + 3);

            // Ajusta os vencimentos fiscais trimestrais
            const mes = data.getMonth() + 1;

            if (mes === 4) {
                data.setDate(30);
            }

            if (mes === 7) {
                data.setDate(31);
            }

            if (mes === 10) {
                data.setDate(31);
            }

            if (mes === 1) {
                data.setDate(31);
            }

            break;

        case 'SEMESTRAL':
            data.setMonth(data.getMonth() + 6);
            break;

        case 'ANUAL':
            data.setFullYear(data.getFullYear() + 1);
            break;

        default:
            return null;
    }

    return data;
}

module.exports = {
    calcularProximoVencimento
};