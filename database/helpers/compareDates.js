// Función para comparar las fechas

const compareDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
  };

module.exports = compareDates